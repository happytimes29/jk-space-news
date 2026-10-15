import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // Executable CLI fixtures use Node's test runner, invoked separately in verification.
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**", "scripts/**/*.test.mjs"],
  },
});
