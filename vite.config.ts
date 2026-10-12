import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('./', import.meta.url))
const demoDir = fileURLToPath(new URL('./demo', import.meta.url))

const demos = Object.fromEntries(
  fs
    .readdirSync(demoDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace('.html', ''), path.resolve(demoDir, file)]),
)

export default defineConfig({
  plugins: [cloudflare()],
  resolve: {
    alias: {
      'material/': rootDir,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
        ...demos,
      },
    },
  },
})
