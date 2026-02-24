import type { VercelRequest, VercelResponse } from "@vercel/node";

// Inline fallback templates (readFileSync doesn't work reliably in Vercel serverless)
const TEMPLATES: Record<string, string> = {
  todo: 'Here is a Todo App!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\">\\n<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\">\\n<title>Todo App</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<div class=\\"app\\">\\n<h1>My Tasks</h1>\\n<div class=\\"input-group\\">\\n<input id=\\"inp\\" placeholder=\\"Add a task...\\">\\n<button onclick=\\"addTask()\\">Add</button>\\n</div>\\n<ul id=\\"list\\"></ul>\\n</div>\\n<script src=\\"script.js\\"></script>\\n</body>\\n</html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;justify-content:center;padding:40px 16px}.app{max-width:480px;width:100%}h1{font-size:2rem;margin-bottom:24px;text-align:center;color:#818cf8}.input-group{display:flex;gap:8px;margin-bottom:20px}input{flex:1;padding:12px;border:1px solid #334155;border-radius:8px;background:#1e293b;color:#e2e8f0;outline:none}button{padding:12px 20px;border:none;border-radius:8px;background:#818cf8;color:#fff;font-weight:600;cursor:pointer}ul{list-style:none}li{display:flex;align-items:center;gap:12px;padding:12px;background:#1e293b;border-radius:8px;margin-bottom:8px}li.done span{text-decoration:line-through;opacity:.5}li span{flex:1}","action":"create"},{"name":"script.js","content":"let tasks=[];function render(){const l=document.getElementById(\'list\');l.innerHTML=tasks.map((x,i)=>\'<li class=\\\"\\'+(x.d?\'done\':\'\')+\'\\\"><input type=\\\"checkbox\\\"\\'+(x.d?\' checked\':\'\')+\' onchange=\\\"toggle(\'+i+\')\\\"><span>\'+x.t+\'</span><button onclick=\\\"del(\'+i+\')\\\">X</button></li>\').join(\'\')}function addTask(){const i=document.getElementById(\'inp\');if(!i.value.trim())return;tasks.push({t:i.value.trim(),d:false});i.value=\'\';render()}function toggle(i){tasks[i].d=!tasks[i].d;render()}function del(i){tasks.splice(i,1);render()}","action":"create"}]}\n```\n\nA complete todo app with add, check-off, and delete functionality!',
  landing: 'Here is a Landing Page!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\">\\n<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\">\\n<title>Landing Page</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<nav><div class=\\"logo\\">Brand</div><a href=\\"#\\" class=\\"btn\\">Get Started</a></nav>\\n<section class=\\"hero\\"><h1>Build Something Amazing</h1><p>The modern platform for creating beautiful web experiences.</p><a href=\\"#\\" class=\\"btn btn-lg\\">Start Free</a></section>\\n<section class=\\"features\\"><div class=\\"card\\"><h3>Fast</h3><p>Lightning-fast performance out of the box.</p></div><div class=\\"card\\"><h3>Secure</h3><p>Enterprise-grade security by default.</p></div><div class=\\"card\\"><h3>Scalable</h3><p>Grows seamlessly with your needs.</p></div></section>\\n</body>\\n</html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa}nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid #222}.logo{font-size:1.25rem;font-weight:700}.btn{padding:10px 20px;border-radius:8px;background:#818cf8;color:#fff;text-decoration:none;font-size:14px;font-weight:600}.btn-lg{padding:14px 32px;font-size:16px}.hero{text-align:center;padding:120px 20px 80px}h1{font-size:3.5rem;font-weight:800;margin-bottom:16px}.hero p{color:#888;margin-bottom:32px}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;max-width:900px;margin:0 auto;padding:60px 24px}.card{background:#111;border:1px solid #222;border-radius:12px;padding:32px}.card h3{margin-bottom:8px}.card p{color:#888;font-size:14px}","action":"create"},{"name":"script.js","content":"console.log(\'Landing page loaded\');","action":"create"}]}\n```\n\nA professional landing page with hero and features sections!',
  portfolio: 'Here is a Portfolio!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\">\\n<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\">\\n<title>Portfolio</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<nav><a class=\\"logo\\">JD</a></nav>\\n<section class=\\"hero\\"><span class=\\"tag\\">Developer</span><h1>Hi, I am John</h1><p>I build modern web experiences.</p></section>\\n<section class=\\"projects\\"><h2>Projects</h2><div class=\\"grid\\"><div class=\\"card\\"><h3>E-Commerce</h3><p>Full-stack online shop</p></div><div class=\\"card\\"><h3>Dashboard</h3><p>Analytics platform</p></div><div class=\\"card\\"><h3>Social App</h3><p>Real-time chat system</p></div></div></section>\\n</body>\\n</html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa}nav{padding:20px 40px}.logo{font-size:1.25rem;font-weight:800;color:#818cf8}.hero{text-align:center;padding:100px 24px}.tag{background:rgba(129,140,248,0.12);color:#818cf8;padding:6px 16px;border-radius:999px;font-size:13px}h1{font-size:3rem;font-weight:800;margin:20px 0 12px}.hero p{color:#888;margin-bottom:32px}.projects{max-width:900px;margin:0 auto;padding:60px 24px}h2{font-size:2rem;margin-bottom:32px;text-align:center}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}.card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px}.card h3{margin-bottom:8px}.card p{color:#888;font-size:14px}","action":"create"},{"name":"script.js","content":"console.log(\'Portfolio loaded\');","action":"create"}]}\n```\n\nA clean portfolio site with hero section and projects grid!',
  dashboard: 'Here is a Dashboard!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\">\\n<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\">\\n<title>Dashboard</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<div class=\\"sidebar\\"><h2>Dashboard</h2><a href=\\"#\\" class=\\"active\\">Overview</a><a href=\\"#\\">Analytics</a><a href=\\"#\\">Settings</a></div>\\n<div class=\\"main\\"><div class=\\"cards\\"><div class=\\"card\\"><span>Revenue</span><h3>$12,450</h3></div><div class=\\"card\\"><span>Users</span><h3>1,234</h3></div><div class=\\"card\\"><span>Orders</span><h3>567</h3></div><div class=\\"card\\"><span>Growth</span><h3>+23%</h3></div></div></div>\\n</body>\\n</html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;display:flex;min-height:100vh}.sidebar{width:220px;background:#111;border-right:1px solid #222;padding:24px}h2{font-size:1.1rem;margin-bottom:24px;color:#818cf8}.sidebar a{display:block;padding:10px 12px;border-radius:8px;color:#888;text-decoration:none;margin-bottom:4px}.sidebar a.active{background:#818cf820;color:#818cf8}.main{flex:1;padding:32px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}.card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px}.card span{font-size:13px;color:#888}.card h3{font-size:1.5rem;margin-top:8px}","action":"create"},{"name":"script.js","content":"console.log(\'Dashboard ready\');","action":"create"}]}\n```\n\nA dashboard with sidebar navigation and stats cards!',
  note: 'Created a note for you!\n\n```json\n{"notes":[{"title":"Project Ideas","content":"1. Personal Finance Tracker\\n2. Recipe Manager\\n3. Habit Tracker\\n4. Bookmark Manager\\n5. Markdown Blog"}]}\n```\n\nCheck your Notes panel!',
  calendar: 'Event scheduled!\n\n```json\n{"calendarEvents":[{"title":"Project Deadline","date":"{{DATE}}","type":"deadline","time":"17:00"}]}\n```\n\nCheck your Calendar panel!',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end(pickFallback(messages));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        stream: true,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end(pickFallback(messages));
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body?.getReader();
    if (!reader) {
      return res.end(pickFallback(messages));
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") break;
        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) res.write(content);
        } catch {
          /* skip */
        }
      }
    }
    res.end();
  } catch {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end(pickFallback(messages));
  }
}

function pickFallback(
  messages: Array<{ role: string; content: string }>
): string {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop();
  const u = (lastUserMsg?.content || "").toLowerCase();
  const fallback =
    "I am X-11, your AI coding assistant! Try asking me to build a todo app, portfolio, dashboard, e-commerce page, or landing page. Connect an OPENAI_API_KEY in the Env Vars panel for full AI power.";

  if (u.includes("todo") || u.includes("task")) return TEMPLATES.todo || fallback;
  if (u.includes("portfolio") || u.includes("personal")) return TEMPLATES.portfolio || fallback;
  if (u.includes("ecommerce") || u.includes("e-commerce") || u.includes("shop") || u.includes("store")) return TEMPLATES.dashboard || fallback;
  if (u.includes("dashboard") || u.includes("admin")) return TEMPLATES.dashboard || fallback;
  if (u.includes("landing") || u.includes("page") || u.includes("website") || u.includes("site")) return TEMPLATES.landing || fallback;
  if (u.includes("note") || u.includes("remember")) return TEMPLATES.note || fallback;
  if (u.includes("calendar") || u.includes("schedule") || u.includes("deadline") || u.includes("day off")) {
    const d = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    return (TEMPLATES.calendar || fallback).replace("{{DATE}}", d);
  }
  if (u.includes("crypto") || u.includes("web3") || u.includes("token") || u.includes("blockchain")) {
    return 'Here is a Crypto Dashboard!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\">\\n<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\">\\n<title>Crypto Dashboard</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<nav><h1>CryptoView</h1><button id=\\"connect\\">Connect Wallet</button></nav>\\n<div class=\\"cards\\"><div class=\\"card\\"><span>BTC</span><h3 id=\\"btc\\">$--</h3></div><div class=\\"card\\"><span>ETH</span><h3 id=\\"eth\\">$--</h3></div><div class=\\"card\\"><span>SOL</span><h3 id=\\"sol\\">$--</h3></div></div>\\n<script src=\\"script.js\\"></script>\\n</body>\\n</html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;padding:24px}nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}h1{color:#818cf8}button{padding:10px 20px;border:none;border-radius:8px;background:#818cf8;color:#fff;cursor:pointer;font-weight:600}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}.card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px}.card span{font-size:13px;color:#888}.card h3{font-size:1.75rem;margin-top:8px;color:#4ade80}","action":"create"},{"name":"script.js","content":"async function fetchPrices(){try{const r=await fetch(\'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd\');const d=await r.json();document.getElementById(\'btc\').textContent=\'$\'+d.bitcoin.usd.toLocaleString();document.getElementById(\'eth\').textContent=\'$\'+d.ethereum.usd.toLocaleString();document.getElementById(\'sol\').textContent=\'$\'+d.solana.usd.toLocaleString()}catch(e){console.log(\'Price fetch failed\',e)}}fetchPrices();setInterval(fetchPrices,30000);document.getElementById(\'connect\').onclick=()=>{alert(\'Wallet connection requires ThirdWeb SDK. Add your THIRDWEB_CLIENT_ID in Env Vars!\')}","action":"create"}]}\n```\n\nA crypto dashboard with live prices from CoinGecko! Add ThirdWeb env vars for wallet connection.';
  }

  return fallback;
}
