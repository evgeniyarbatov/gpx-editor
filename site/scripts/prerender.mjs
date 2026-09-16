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
          Simplify a track until it fits your watch, then split it. The map
          shows how far the simplified line drifts from the original.
        </p>
      </header>
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold">Watch-friendly ultra GPX</h2>
        <ul class="mt-3 flex flex-col gap-2 text-sm text-black/70">
          <li>Simplify tracks until point count and file count fit Polar and Garmin.</li>
          <li>See the original track next to the simplified line before you download.</li>
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
