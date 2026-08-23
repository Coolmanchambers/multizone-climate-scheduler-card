import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: 'src/multizone-climate-scheduler-card.ts',
      formats: ['es'],
      fileName: () => 'multizone-climate-scheduler-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Bundle everything (including Lit) - never rely on HA's internal Lit.
      external: [],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
