import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'singlefile' && viteSingleFile(),
    mode === 'singlefile' && {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/<link rel="icon".*?>/g, '').replace(/<link rel="manifest".*?>/g, '')
      }
    }
  ],
  build: {
    outDir: mode === 'singlefile' ? 'dist-single' : 'dist',
  },
  define: {
    'process.env.IS_SINGLE_FILE': mode === 'singlefile',
  }
}))
