// File: vite.config.js
// Configuration file for Vite, our frontend build tool.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
});
