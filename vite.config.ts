import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

// Read package.json synchronously
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', // Папка, де з'явиться готовий проект після npm run build
    assetsDir: 'assets', // Папка для JS/CSS всередині dist
  },
  server: {
    proxy: {
      // Коли ви викликаєте '/api/v5', Vite перенаправляє це на сервер
      '/api/v5': {
        target: 'https://test.kantorfk.com', // АДРЕСА ВАШОГО РЕАЛЬНОГО СЕРВЕРА
        changeOrigin: true, // Змінює заголовок Host на адресу сервера
        secure: false, // Дозволяє працювати, якщо є проблеми з SSL
        // Опційно: переписуємо шлях, якщо потрібно
        // rewrite: (path) => path.replace(/^\/api\/v4/, '/api/v4')
      },
    },
  },
  define: {
    // Expose the version as a global constant in your code
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
