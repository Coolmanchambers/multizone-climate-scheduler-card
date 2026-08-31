import { defineConfig } from 'vitest/config';

// `vite build --mode dev` produces dist/multizone-climate-scheduler-card-dev.js
// registering a parallel `-dev` element (see src/const.ts) so a development
// copy can coexist with the HACS-installed release on the same HA instance.
export default defineConfig(({ mode }) => ({
  define: {
    __MZCS_DEV__: JSON.stringify(mode === 'dev'),
  },
  // LAN-visible dev harness, so a phone or the wall panel can open it for
  // narrow-width validation (items 31/35). Dev server only; no effect on build.
  server: {
    host: true,
  },
  build: {
    target: 'es2022',
    // Lib-mode ES output skips minification by default; forcing it cuts the
    // bundle ~21% with identifiers/behavior untouched (scan S13-perf).
    minify: 'esbuild',
    lib: {
      entry: 'src/multizone-climate-scheduler-card.ts',
      formats: ['es'],
      fileName: () => (mode === 'dev' ? 'multizone-climate-scheduler-card-dev.js' : 'multizone-climate-scheduler-card.js'),
    },
    outDir: 'dist',
    // The dev bundle sits NEXT TO the tracked release bundle - never wipe it.
    emptyOutDir: mode !== 'dev',
    rollupOptions: {
      // Bundle everything (including Lit) - never rely on HA's internal Lit.
      external: [],
      // Single-file output: dynamic imports (the editor) must inline, because
      // only dist/multizone-climate-scheduler-card.js is tracked/served.
      output: { inlineDynamicImports: true },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}));
