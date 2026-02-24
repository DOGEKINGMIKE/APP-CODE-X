import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

// Development-only middleware to handle /api/chat requests locally
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
            const userContent = (lastMsg?.content || "").toLowerCase();

            let response =
              "I'm X-11, your AI coding assistant! Try asking me to build a todo app, landing page, or any web project.";

            if (userContent.includes("todo") || userContent.includes("task")) {
              response = `Here's a Todo App!\n\n\`\`\`json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\"><title>Todo App</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head>\\n<body><div class=\\"app\\"><h1>Todo App</h1><div class=\\"input-group\\"><input type=\\"text\\" id=\\"todoInput\\" placeholder=\\"Add a task...\\" /><button onclick=\\"addTodo()\\">Add</button></div><ul id=\\"todoList\\"></ul></div><script src=\\"script.js\\"><\\/script></body></html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;justify-content:center;padding:40px 20px}.app{max-width:480px;width:100%}h1{font-size:2rem;margin-bottom:24px;text-align:center;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.input-group{display:flex;gap:8px;margin-bottom:24px}input{flex:1;padding:12px 16px;border:1px solid #334155;border-radius:8px;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none}input:focus{border-color:#818cf8}button{padding:12px 20px;border:none;border-radius:8px;background:#818cf8;color:white;font-weight:600;cursor:pointer}button:hover{background:#6366f1}ul{list-style:none}li{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1e293b;border-radius:8px;margin-bottom:8px}li.done span{text-decoration:line-through;opacity:0.5}li span{flex:1}li button{background:#ef4444;padding:6px 12px;font-size:12px}","action":"create"},{"name":"script.js","content":"let todos=[];function render(){const list=document.getElementById('todoList');list.innerHTML=todos.map((t,i)=>\`<li class=\\"\${t.done?'done':''}\\"><input type=\\"checkbox\\" \${t.done?'checked':''} onchange=\\"toggle(\${i})\\" /><span>\${t.text}</span><button onclick=\\"remove(\${i})\\">Delete</button></li>\`).join('')}function addTodo(){const input=document.getElementById('todoInput');if(!input.value.trim())return;todos.push({text:input.value.trim(),done:false});input.value='';render()}function toggle(i){todos[i].done=!todos[i].done;render()}function remove(i){todos.splice(i,1);render()}document.getElementById('todoInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo()})","action":"create"}]}\n\`\`\`\n\nI've created a complete Todo App with add, toggle, and delete!`;
            } else if (
              userContent.includes("landing") ||
              userContent.includes("page")
            ) {
              response = `Here's a modern landing page!\n\n\`\`\`json\n{"files":[{"name":"index.html","content":"<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1.0\\"><title>Landing Page</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head>\\n<body><nav><div class=\\"logo\\">Brand</div><div class=\\"nav-links\\"><a href=\\"#features\\">Features</a><a href=\\"#\\" class=\\"btn\\">Get Started</a></div></nav><section class=\\"hero\\"><h1>Build Something Amazing</h1><p>The modern platform for creating beautiful web experiences.</p><div class=\\"hero-actions\\"><a href=\\"#\\" class=\\"btn btn-primary\\">Start Free</a><a href=\\"#\\" class=\\"btn btn-outline\\">Learn More</a></div></section><section id=\\"features\\" class=\\"features\\"><h2>Features</h2><div class=\\"grid\\"><div class=\\"card\\"><h3>Fast</h3><p>Lightning-fast performance.</p></div><div class=\\"card\\"><h3>Secure</h3><p>Enterprise-grade security.</p></div><div class=\\"card\\"><h3>Scalable</h3><p>Grows with your needs.</p></div></div></section><script src=\\"script.js\\"><\\/script></body></html>","action":"create"},{"name":"style.css","content":"*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fafafa}nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid #222}.logo{font-size:1.25rem;font-weight:700}.nav-links{display:flex;align-items:center;gap:24px}.nav-links a{color:#888;text-decoration:none;font-size:14px}.nav-links a:hover{color:#fff}.btn{padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none}.btn-primary{background:#fff;color:#000}.btn-outline{border:1px solid #333;color:#fff}.hero{text-align:center;padding:120px 20px 80px}h1{font-size:3.5rem;font-weight:800;margin-bottom:16px;background:linear-gradient(135deg,#fff,#888);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.hero p{font-size:1.125rem;color:#888;max-width:500px;margin:0 auto 32px}.hero-actions{display:flex;justify-content:center;gap:12px}.features{padding:80px 40px;text-align:center}.features h2{font-size:2rem;margin-bottom:40px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:900px;margin:0 auto}.card{background:#111;border:1px solid #222;border-radius:12px;padding:32px;text-align:left}.card h3{font-size:1.25rem;margin-bottom:8px}.card p{color:#888;font-size:14px;line-height:1.6}","action":"create"},{"name":"script.js","content":"console.log('Landing page loaded!')","action":"create"}]}\n\`\`\`\n\nA sleek landing page with hero section, nav, and feature cards!`;
            }

            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(response);
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
    hmr: {
      overlay: false,
    },
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
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
});
