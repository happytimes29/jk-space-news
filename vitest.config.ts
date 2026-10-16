import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { vitestExcludes } from "./tests/vitest-boundaries";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // Executable CLI fixtures use Node's test runner, invoked separately in verification.
    exclude: vitestExcludes,
  },
});
