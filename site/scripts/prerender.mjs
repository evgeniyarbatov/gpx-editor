import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const html = readFileSync(distPath, 'utf8')
const staticMarkup = `
  <div class="min-h-screen px-6 py-10 text-black">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header class="flex flex-col gap-3">
        <h1 class="text-4xl font-semibold tracking-tight">GPX Editor for Ultrarunners</h1>
        <p class="max-w-3xl text-sm text-black/70">
          Built for long-distance runners who want absolute control over ultra GPX
          files. Split huge tracks, reverse direction, and pin a precise starting
          point for race planning.
        </p>
      </header>
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold">Precision tools for long-distance GPX</h2>
        <ul class="mt-3 flex flex-col gap-2 text-sm text-black/70">
          <li>Split large GPX files into smaller segments.</li>
          <li>Reverse routes for out-and-back planning.</li>
          <li>Start from exact coordinates for accurate splits.</li>
        </ul>
      </section>
    </div>
  </div>
`
const updated = html.replace(
  '<div id="root"></div>',
  `<div id="root">${staticMarkup}</div>`,
)
writeFileSync(distPath, updated)
