import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const html = readFileSync(distPath, 'utf8')
const staticMarkup = `
  <div class="min-h-screen px-5 py-8 text-black">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <p class="text-sm font-medium">Drop a GPX file here, or click to choose</p>
    </div>
  </div>
`
const updated = html.replace(
  '<div id="root"></div>',
  `<div id="root">${staticMarkup}</div>`,
)
writeFileSync(distPath, updated)
