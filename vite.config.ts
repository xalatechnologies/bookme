import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    port: 8000,
    host: true
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    // Bundle size optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'date-fns'],
          'query-vendor': ['@tanstack/react-query'],
          'i18n-vendor': ['react-i18next', 'i18next'],
          'map-vendor': ['mapbox-gl'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Minification with esbuild (faster than terser)
    minify: 'esbuild',
    target: 'esnext',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./postcss.config.cjs",
  },
  // Enable experimental optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-i18next',
      'i18next',
      'lucide-react',
      'date-fns',
      'mapbox-gl',
    ],
  },
});