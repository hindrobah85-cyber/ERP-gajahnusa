import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 3007
  },
  resolve: {
    alias: {
      '$lib': '/src/lib',
      '$components': '/src/components'
    }
  }
})
