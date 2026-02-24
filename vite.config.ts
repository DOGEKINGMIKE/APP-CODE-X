import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

function apiMiddleware(): Plugin {
  return {
    name: "api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => (body += chunk.toString()));
        req.on("end", () => {
          try {
            const { messages } = JSON.parse(body);
            const lastMsg = messages?.filter((m: any) => m.role === "user").pop();
            const u = (lastMsg?.content || "").toLowerCase();

            let r = "I'm X-11, your AI coding assistant! Try asking me to build a todo app, portfolio, dashboard, e-commerce page, or any web project. Connect an OPENAI_API_KEY in Env Vars for full AI power.";

            if (u.includes("todo") || u.includes("task")) {
              r = 'Here\'s a Todo App!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html><html lang=\\"en\\"><head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\"><title>Todo</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head><body><div class=\\"app\\"><h1>My Tasks</h1><div class=\\"input-group\\"><input id=\\"i\\" placeholder=\\"Add task...\\"><button onclick=\\"add()\\">Add</button></div><ul id=\\"l\\"></ul></div><script src=\\"script.js\\"></script></body></html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;justify-content:center;padding:40px 16px}.app{max-width:480px;width:100%}h1{font-size:2rem;margin-bottom:24px;text-align:center;color:#818cf8}.input-group{display:flex;gap:8px;margin-bottom:20px}input{flex:1;padding:12px;border:1px solid#334155;border-radius:8px;background:#1e293b;color:#e2e8f0;outline:none}button{padding:12px 20px;border:none;border-radius:8px;background:#818cf8;color:#fff;font-weight:600;cursor:pointer}ul{list-style:none}li{display:flex;align-items:center;gap:12px;padding:12px;background:#1e293b;border-radius:8px;margin-bottom:8px}li.d span{text-decoration:line-through;opacity:.5}li span{flex:1}","action":"create"},{"name":"script.js","content":"let t=[];function render(){document.getElementById(\'l\').innerHTML=t.map((x,i)=>`<li class=\\"${x.d?\'d\':\'\\'}\\"><input type=checkbox ${x.d?\'checked\':\'\'} onchange=\\"tog(${i})\\"><span>${x.t}</span><button onclick=\\"del(${i})\\">X</button></li>`).join(\'\')}function add(){const i=document.getElementById(\'i\');if(!i.value.trim())return;t.push({t:i.value.trim(),d:false});i.value=\'\';render()}function tog(i){t[i].d=!t[i].d;render()}function del(i){t.splice(i,1);render()}document.getElementById(\'i\').onkeydown=e=>{if(e.key===\'Enter\')add()};","action":"create"}]}\n```\n\nBuilt a complete Todo App with add, toggle, and delete!';
            } else if (u.includes("landing") || u.includes("page") || u.includes("website") || u.includes("site")) {
              r = 'Here\'s a landing page!\n\n```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html><html lang=\\"en\\"><head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\"><title>Landing</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head><body><nav><div class=\\"logo\\">Brand</div><a href=\\"#\\" class=\\"btn\\">Get Started</a></nav><section class=\\"hero\\"><h1>Build Something Amazing</h1><p>The modern platform for beautiful web experiences.</p><a href=\\"#\\" class=\\"btn btn-lg\\">Start Free</a></section><section class=\\"features\\"><div class=\\"card\\"><h3>Fast</h3><p>Lightning performance.</p></div><div class=\\"card\\"><h3>Secure</h3><p>Enterprise security.</p></div><div class=\\"card\\"><h3>Scalable</h3><p>Grows with you.</p></div></section></body></html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa}nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid#222}.logo{font-size:1.25rem;font-weight:700}.btn{padding:10px 20px;border-radius:8px;background:#818cf8;color:#fff;text-decoration:none;font-size:14px;font-weight:600}.btn-lg{padding:14px 32px;font-size:16px}.hero{text-align:center;padding:120px 20px 80px}h1{font-size:3.5rem;font-weight:800;margin-bottom:16px}.hero p{color:#888;margin-bottom:32px}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;max-width:900px;margin:0 auto;padding:60px 24px}.card{background:#111;border:1px solid#222;border-radius:12px;padding:32px}","action":"create"},{"name":"script.js","content":"console.log(\'Ready!\');","action":"create"}]}\n```\n\nBuilt a landing page with nav, hero, and features!';
            } else if (u.includes("note") || u.includes("remember")) {
              r = 'Created a note for you!\n\n```json\n{"notes":[{"title":"Project Ideas","content":"1. Personal Finance Tracker\\n2. Recipe Manager\\n3. Habit Tracker\\n4. Bookmark Manager\\n5. Markdown Blog"}]}\n```\n\nCheck your Notes panel!';
            } else if (u.includes("calendar") || u.includes("schedule") || u.includes("deadline") || u.includes("day off")) {
              const d = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
              r = `Scheduled!\n\n\`\`\`json\n{"calendarEvents":[{"title":"Project Deadline","date":"${d}","type":"deadline","time":"17:00"}]}\n\`\`\`\n\nCheck your Calendar!`;
            } else if (u.includes("portfolio") || u.includes("personal")) {
              r = 'Building a portfolio! ```json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html><html><head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\"><title>Portfolio</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head><body><nav><a class=\\"logo\\">JD</a></nav><section class=\\"hero\\"><span class=\\"tag\\">Developer</span><h1>Hi, I\'m John</h1><p>I build modern web experiences.</p></section><section class=\\"projects\\"><h2>Projects</h2><div class=\\"grid\\"><div class=\\"card\\"><h3>E-Commerce</h3><p>Full-stack shop</p></div><div class=\\"card\\"><h3>Dashboard</h3><p>Analytics platform</p></div><div class=\\"card\\"><h3>Social App</h3><p>Real-time chat</p></div></div></section></body></html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa}nav{padding:20px 40px}.logo{font-size:1.25rem;font-weight:800;color:#818cf8}.hero{text-align:center;padding:100px 24px}.tag{background:#818cf820;color:#818cf8;padding:6px 16px;border-radius:999px;font-size:13px}h1{font-size:3rem;font-weight:800;margin:20px 0 12px}.hero p{color:#888;margin-bottom:32px}.projects{max-width:900px;margin:0 auto;padding:60px 24px}h2{font-size:2rem;margin-bottom:32px;text-align:center}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}.card{background:#18181b;border:1px solid#27272a;border-radius:12px;padding:24px}.card h3{margin-bottom:8px}.card p{color:#888;font-size:14px}","action":"create"},{"name":"script.js","content":"console.log(\'Portfolio loaded\');","action":"create"}]}\n```\n\nBuilt a portfolio with hero, projects grid, and responsive design!';
            }

            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(r);
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid request" }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [react(), apiMiddleware()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          monaco: ["@monaco-editor/react"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
        },
      },
    },
  },
});
