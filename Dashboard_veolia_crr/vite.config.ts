import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // listen on all interfaces so other devices on the LAN can reach it
    host: "0.0.0.0",
    port: 8081,
    hmr: {
      overlay: false,
      // Use the same host as the page (localhost or IP) to avoid WS connection
      // failures that cause infinite full-page reload loops.
      // When you open http://localhost:8081 → WS uses localhost; when you open
      // http://192.168.0.42:8081 from another device → WS uses that IP.
      clientPort: 8081,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
