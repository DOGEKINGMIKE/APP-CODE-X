import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";
import { readFileSync } from "fs";

function apiMiddleware(): Plugin {
  return {
    name: "api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end('{"error":"Method not allowed"}');
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => (body += chunk.toString()));
        req.on("end", () => {
          try {
            // Load fallback responses from a JSON file to avoid escaping issues
            let templates: Record<string, string> = {};
            try {
              const raw = readFileSync(
                path.resolve(__dirname, "api/fallback-templates.json"),
                "utf-8"
              );
              templates = JSON.parse(raw);
            } catch {
              // no templates file
            }

            const { messages } = JSON.parse(body);
            const lastMsg = messages
              ?.filter((m: any) => m.role === "user")
              .pop();
            const u = (lastMsg?.content || "").toLowerCase();

            let r =
              "I am X-11, your AI coding assistant! Try asking me to build a todo app, portfolio, dashboard, or landing page. Connect an OPENAI_API_KEY in Env Vars for full AI power.";

            if (u.includes("todo") || u.includes("task")) {
              r = templates.todo || r;
            } else if (
              u.includes("landing") ||
              u.includes("page") ||
              u.includes("website")
            ) {
              r = templates.landing || r;
            } else if (u.includes("portfolio") || u.includes("personal")) {
              r = templates.portfolio || r;
            } else if (u.includes("note") || u.includes("remember")) {
              r = templates.note || r;
            } else if (
              u.includes("calendar") ||
              u.includes("schedule") ||
              u.includes("deadline")
            ) {
              const d = new Date(Date.now() + 7 * 86400000)
                .toISOString()
                .split("T")[0];
              r = templates.calendar
                ? templates.calendar.replace("{{DATE}}", d)
                : r;
            }

            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(r);
          } catch {
            res.statusCode = 400;
            res.end('{"error":"Invalid request"}');
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
