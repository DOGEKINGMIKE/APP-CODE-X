import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let templates: Record<string, string> = {};
try {
  templates = JSON.parse(
    readFileSync(resolve(__dirname, 'fallback-templates.json'), 'utf-8')
  );
} catch {
  // templates will be empty - that's ok
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end(pickFallback(messages));
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      // fallback on API error
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end(pickFallback(messages));
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body?.getReader();
    if (!reader) {
      return res.end(pickFallback(messages));
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) res.write(content);
        } catch {
          /* skip malformed chunks */
        }
      }
    }
    res.end();
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end(pickFallback(messages));
  }
}

function pickFallback(messages: Array<{ role: string; content: string }>): string {
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
  const u = (lastUserMsg?.content || '').toLowerCase();

  const fallback =
    "I'm X-11, your AI coding assistant! Try asking me to build a todo app, portfolio, dashboard, e-commerce page, or landing page. Connect an OPENAI_API_KEY in Env Vars for full AI power.";

  if (u.includes('todo') || u.includes('task')) return templates.todo || fallback;
  if (u.includes('portfolio') || u.includes('personal')) return templates.portfolio || fallback;
  if (u.includes('ecommerce') || u.includes('e-commerce') || u.includes('shop') || u.includes('store'))
    return templates.dashboard || fallback;
  if (u.includes('dashboard') || u.includes('admin')) return templates.dashboard || fallback;
  if (u.includes('landing') || u.includes('page') || u.includes('website') || u.includes('site'))
    return templates.landing || fallback;
  if (u.includes('note') || u.includes('remember')) return templates.note || fallback;
  if (u.includes('calendar') || u.includes('schedule') || u.includes('deadline') || u.includes('day off')) {
    const d = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    return (templates.calendar || fallback).replace('{{DATE}}', d);
  }

  return fallback;
}
