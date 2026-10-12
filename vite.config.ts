import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import fs from 'node:fs'
import path from 'node:path'

const demos = Object.fromEntries(
  fs
    .readdirSync('demo')
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace('.html', ''), path.resolve('demo', file)]),
)

export default defineConfig({
  plugins: [cloudflare()],
  resolve: {
    alias: {
      'material/': new URL('./', import.meta.url).pathname,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        ...demos,
      },
    },
  },
})
