import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/server/**/*.test.ts'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'json-summary'],
      include: ['src/server/domain/**/*.ts', 'src/server/http/auth.ts'],
    },
  },
});
