import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // server: {
  //   proxy: {
  //     '/api' : 'https://localhost:5000', ///redirect frontend api calls to the backend, makes it easier
  //   },
  // }
})
