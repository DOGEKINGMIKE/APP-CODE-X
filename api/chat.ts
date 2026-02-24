import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_COMPATIBLE_URL = 'https://gateway.ai.cloudflare.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Use OpenAI via AI Gateway or direct - check for available API key
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    // Fallback: provide a helpful local response without any AI API
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
    const userContent = lastUserMsg?.content || '';

    const fallbackResponse = generateLocalResponse(userContent);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    return res.end(fallbackResponse);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API Error:', response.status, errText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    // Stream the response back
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: 'No response body' });
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);

        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(content);
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateLocalResponse(userContent: string): string {
  const lower = userContent.toLowerCase();

  if (lower.includes('todo') || lower.includes('to-do') || lower.includes('task')) {
    return `Here's a Todo App for you!

\`\`\`json
{
  "files": [
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>Todo App</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n  <div class=\\"app\\">\\n    <h1>Todo App</h1>\\n    <div class=\\"input-group\\">\\n      <input type=\\"text\\" id=\\"todoInput\\" placeholder=\\"Add a task...\\" />\\n      <button onclick=\\"addTodo()\\">Add</button>\\n    </div>\\n    <ul id=\\"todoList\\"></ul>\\n  </div>\\n  <script src=\\"script.js\\"><\\/script>\\n</body>\\n</html>",
      "action": "create"
    },
    {
      "name": "style.css",
      "content": "* { box-sizing: border-box; margin: 0; padding: 0; }\\nbody { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; justify-content: center; padding: 40px 20px; }\\n.app { max-width: 480px; width: 100%; }\\nh1 { font-size: 2rem; margin-bottom: 24px; text-align: center; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\\n.input-group { display: flex; gap: 8px; margin-bottom: 24px; }\\ninput { flex: 1; padding: 12px 16px; border: 1px solid #334155; border-radius: 8px; background: #1e293b; color: #e2e8f0; font-size: 14px; outline: none; }\\ninput:focus { border-color: #818cf8; }\\nbutton { padding: 12px 20px; border: none; border-radius: 8px; background: #818cf8; color: white; font-weight: 600; cursor: pointer; }\\nbutton:hover { background: #6366f1; }\\nul { list-style: none; }\\nli { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #1e293b; border-radius: 8px; margin-bottom: 8px; }\\nli.done span { text-decoration: line-through; opacity: 0.5; }\\nli span { flex: 1; }\\nli button { background: #ef4444; padding: 6px 12px; font-size: 12px; }",
      "action": "create"
    },
    {
      "name": "script.js",
      "content": "let todos = [];\\n\\nfunction render() {\\n  const list = document.getElementById('todoList');\\n  list.innerHTML = todos.map((t, i) => \\n    \\`<li class=\\\"\\${t.done ? 'done' : ''}\\\">\\n      <input type=\\\"checkbox\\\" \\${t.done ? 'checked' : ''} onchange=\\\"toggle(\\${i})\\\" />\\n      <span>\\${t.text}</span>\\n      <button onclick=\\\"remove(\\${i})\\\">Delete</button>\\n    </li>\\`\\n  ).join('');\\n}\\n\\nfunction addTodo() {\\n  const input = document.getElementById('todoInput');\\n  if (!input.value.trim()) return;\\n  todos.push({ text: input.value.trim(), done: false });\\n  input.value = '';\\n  render();\\n}\\n\\nfunction toggle(i) { todos[i].done = !todos[i].done; render(); }\\nfunction remove(i) { todos.splice(i, 1); render(); }\\n\\ndocument.getElementById('todoInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });",
      "action": "create"
    }
  ]
}
\`\`\`

I've generated a complete Todo App with a modern dark theme. The app has add, toggle, and delete functionality with keyboard support (press Enter to add tasks).`;
  }

  if (lower.includes('landing') || lower.includes('page')) {
    return `I'll create a modern landing page for you!

\`\`\`json
{
  "files": [
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>Modern Landing Page</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n  <nav>\\n    <div class=\\"logo\\">Brand</div>\\n    <div class=\\"nav-links\\">\\n      <a href=\\"#features\\">Features</a>\\n      <a href=\\"#pricing\\">Pricing</a>\\n      <a href=\\"#\\" class=\\"btn\\">Get Started</a>\\n    </div>\\n  </nav>\\n  <section class=\\"hero\\">\\n    <h1>Build Something Amazing</h1>\\n    <p>The modern platform for creating beautiful web experiences.</p>\\n    <div class=\\"hero-actions\\">\\n      <a href=\\"#\\" class=\\"btn btn-primary\\">Start Free</a>\\n      <a href=\\"#\\" class=\\"btn btn-outline\\">Learn More</a>\\n    </div>\\n  </section>\\n  <section id=\\"features\\" class=\\"features\\">\\n    <h2>Features</h2>\\n    <div class=\\"grid\\">\\n      <div class=\\"card\\"><h3>Fast</h3><p>Lightning-fast performance out of the box.</p></div>\\n      <div class=\\"card\\"><h3>Secure</h3><p>Enterprise-grade security built in.</p></div>\\n      <div class=\\"card\\"><h3>Scalable</h3><p>Grows with your business needs.</p></div>\\n    </div>\\n  </section>\\n  <script src=\\"script.js\\"><\\/script>\\n</body>\\n</html>",
      "action": "create"
    },
    {
      "name": "style.css",
      "content": "* { box-sizing: border-box; margin: 0; padding: 0; }\\nbody { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fafafa; }\\nnav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #222; }\\n.logo { font-size: 1.25rem; font-weight: 700; }\\n.nav-links { display: flex; align-items: center; gap: 24px; }\\n.nav-links a { color: #888; text-decoration: none; font-size: 14px; }\\n.nav-links a:hover { color: #fff; }\\n.btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none; }\\n.btn-primary { background: #fff; color: #000; }\\n.btn-outline { border: 1px solid #333; color: #fff; }\\n.hero { text-align: center; padding: 120px 20px 80px; }\\nh1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 16px; background: linear-gradient(135deg, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\\n.hero p { font-size: 1.125rem; color: #888; max-width: 500px; margin: 0 auto 32px; }\\n.hero-actions { display: flex; justify-content: center; gap: 12px; }\\n.features { padding: 80px 40px; text-align: center; }\\n.features h2 { font-size: 2rem; margin-bottom: 40px; }\\n.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; max-width: 900px; margin: 0 auto; }\\n.card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 32px; text-align: left; }\\n.card h3 { font-size: 1.25rem; margin-bottom: 8px; }\\n.card p { color: #888; font-size: 14px; line-height: 1.6; }",
      "action": "create"
    },
    {
      "name": "script.js",
      "content": "console.log('Landing page loaded!');",
      "action": "create"
    }
  ]
}
\`\`\`

I've built a sleek, modern landing page with a hero section, navigation, and feature cards. Everything uses a clean dark theme with smooth typography.`;
  }

  // Generic helpful response
  return `I'm X-11, your AI coding assistant! I can help you build web applications right here in the editor.

Here are some things I can do:
- **Build full web apps** - Just describe what you want and I'll generate HTML, CSS, and JS
- **Create landing pages** - Modern, responsive designs
- **Build interactive features** - Forms, modals, animations
- **Fix code issues** - Share your code and I'll help debug
- **Explain concepts** - Web development, JavaScript, CSS, etc.

Try asking me something like:
- "Build a todo app with HTML, CSS & JS"
- "Create a landing page for a startup"
- "Add a contact form to my project"

Note: For the full AI experience, connect an OpenAI API key in your environment variables (OPENAI_API_KEY).`;
}
