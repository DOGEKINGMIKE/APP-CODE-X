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
            const lastMsg = messages
              ?.filter((m: { role: string }) => m.role === "user")
              .pop();
            const u = (lastMsg?.content || "").toLowerCase();

            let response =
              "I am X-11, your AI coding assistant! Try asking me to build a todo app, portfolio, dashboard, or landing page. Connect an OPENAI_API_KEY in Env Vars for full AI power.";

            // Pattern-match keywords to provide useful fallback responses
            if (u.includes("todo") || u.includes("task")) {
              response = "Here is a Todo App! I have generated a complete todo application with add, check-off, and delete functionality. Check your files panel for index.html, style.css, and script.js.";
            } else if (u.includes("landing") || u.includes("website") || u.includes("page")) {
              response = "Here is a Landing Page! I have generated a professional landing page with hero section and features grid.";
            } else if (u.includes("portfolio") || u.includes("personal")) {
              response = "Here is a Portfolio! I have generated a clean portfolio site with hero and projects sections.";
            } else if (u.includes("dashboard") || u.includes("admin")) {
              response = "Here is a Dashboard! I have generated a dashboard with sidebar navigation and stats cards.";
            } else if (u.includes("note") || u.includes("remember")) {
              response = "Created a note for you! Check your Notes panel.";
            } else if (u.includes("calendar") || u.includes("schedule")) {
              response = "Event scheduled! Check your Calendar panel.";
            } else if (u.includes("crypto") || u.includes("web3") || u.includes("blockchain")) {
              response = "Here is a Crypto Dashboard! Add ThirdWeb env vars for wallet connection.";
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
