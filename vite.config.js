import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist",
      beforeWriteFile: (filePath, content) => {
        const normalized = filePath.replaceAll("\\", "/");

        // Ensure downstream consumers get the global `google.payments.api.*` types
        // (provided by `@google-pay/button-react`) when they import `@amos.com/pay-js-sdk/react`.
        if (normalized.endsWith("/dist/react.d.ts")) {
          const importLine = 'import "@google-pay/button-react";\n';
          if (!content.startsWith(importLine)) {
            return { content: importLine + content };
          }
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        react: "src/react.tsx",
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  esbuild: {
    keepNames: true,
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "test/",
        "vite.config.js",
      ],
    },
  },
  optimizeDeps: {
    include: ["@testing-library/user-event"],
  },
});
