import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    // @blocknote/mantine ships its own nested @mantine/core.
    // Excluding these prevents esbuild from trying to pre-bundle them,
    // which would fail because @mantine/core is not a direct dependency.
    exclude: ['@blocknote/core', '@blocknote/mantine', '@blocknote/react'],
  },

  // -----------------------------------------
  // SERVER CONFIG
  // -----------------------------------------
  server: {
    port: 3030,
    cors: {
      origin: ["http://localhost:3030"],
      credentials: true,
    },
  },

  // -----------------------------------------
  // GLOBAL DEFINES
  // -----------------------------------------
  define: {
    global: {}, // Needed for some old libs
  },

  // -----------------------------------------
  // PATH ALIASES
  // -----------------------------------------
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@context": path.resolve(__dirname, "src/lib/context"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@constants": path.resolve(__dirname, "src/lib/constants"),
      "@api": path.resolve(__dirname, "src/services/api"),
      "@query": path.resolve(__dirname, "src/services/query"),
      "@store": path.resolve(__dirname, "src/services/store"),
      "@public": path.resolve(__dirname, "public/images"),
      "@assets": path.resolve(__dirname, "assets"),
    },
  },

  // -----------------------------------------
  // JS / JSX Optimization
  // -----------------------------------------
  esbuild: {
    drop: ["console", "debugger"], // Removes console & debugger in prod
  },

  // -----------------------------------------
  // CSS Config
  // -----------------------------------------
  css: {
    devSourcemap: false,
  },

  // -----------------------------------------
  // BUILD CONFIG
  // -----------------------------------------
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.split("node_modules/")[1].split("/")[0]
          }
        },
      },
    },
  },

  // -----------------------------------------
  // VITEST CONFIG (Optimized)
  // -----------------------------------------
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "src/setup-tests.js",

    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],

    // Speeds up test runs
    isolate: true,
    clearMocks: true,
    restoreMocks: true,

    coverage: {
      provider: "v8",
      reporter: ["html", "text", "json-summary"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,

      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },

      exclude: [
        "**/public/**",
        "**/.storybook/**",
        "**/dist/**",
        "**/src/pages/auth/**",
        "**/src/pages/misc/**",
        "**/src/pages/vendor/**",
        "**/src/pages/music/**",
        "**/src/pages/jd/utils/**",
        "**/src/pages/dashboard/home-page/**",
        "**/src/pages/ai-assistance/**",
        "**/src/pages/ai-assistance/components/**",
        "**/src/components/**",
        "**/src/utils/**",
        "**/src/route/**",
        "**/src/services/**",
        "**/src/hooks/**",
        "**/src/lib/**",
        "**/src/firebase/**",
      ],
    },
  },
})
