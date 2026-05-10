import { defineConfig } from 'vitest/config';

export default defineConfig({
  testEnvironment: 'jsdom',
  include: ['tests/**/*.test.js'],
});
