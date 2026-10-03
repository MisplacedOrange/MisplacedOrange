import react from '@vitejs/plugin-react';

export default {
  base: './',
  plugins: [react()],
  // Keep the canonical local URL on port 5173; fail instead of changing ports.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
};
