import { expect, test } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { simplifyRdp } from '../src/gpx/simplify.js'
import { trackError } from '../src/gpx/error.js'
import {
  COURSE_POINT_COUNT,
  courseGpx,
  makeCoursePoints,
} from '../test/course.js'
import { parseDownloadedGpx } from '../test/parse-downloaded-gpx.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(here, 'fixtures')
const fixturePath = path.join(fixtureDir, 'course.gpx')
const fixtureXml = courseGpx(makeCoursePoints())
const original = parseDownloadedGpx(fixtureXml)

const setAccuracy = async (page, meters) => {
  await page.getByTestId('accuracy-slider').evaluate((el, value) => {
    const proto = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )
    proto.set.call(el, String(value))
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, meters)
}

const downloadAll = async (page) => {
  const links = page.locator('[data-testid="download-list"] a')
  const count = await links.count()
  const files = []
  for (let index = 0; index < count; index += 1) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      links.nth(index).click(),
    ])
    const suggested = download.suggestedFilename()
    const downloadPath = await download.path()
    files.push({
      name: suggested,
      xml: readFileSync(downloadPath, 'utf8'),
    })
  }
  return files
}

test.beforeAll(async () => {
  await mkdir(fixtureDir, { recursive: true })
  await writeFile(fixturePath, fixtureXml)
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('gpx-file-input').setInputFiles(fixturePath)
  await expect(page.getByTestId('stat-points')).toHaveAttribute(
    'data-from',
    String(COURSE_POINT_COUNT),
  )
})

test('lossless export concatenates to the original course', async ({ page }) => {
  await page.getByTestId('device-polar').click()
  await expect(page.getByTestId('stat-files')).toHaveAttribute('data-count', '2')
  await expect(page.getByTestId('stat-max-error')).toHaveAttribute(
    'data-meters',
    '0',
  )

  const files = await downloadAll(page)
  expect(files).toHaveLength(2)
  files.forEach((file) => {
    expect(file.name).toMatch(/km\.gpx$/)
    expect(file.xml).toContain('version="1.1"')
    expect(file.xml).toContain('lon="')
  })

  const exported = files.flatMap((file) => parseDownloadedGpx(file.xml))
  expect(exported).toHaveLength(COURSE_POINT_COUNT)
  expect(exported[0]).toEqual(original[0])
  expect(exported.at(-1)).toEqual(original.at(-1))
  expect(exported).toEqual(original)
})

test('simplified files stay within the accuracy budget and match the pipeline', async ({
  page,
}) => {
  await page.getByTestId('device-polar').click()
  await setAccuracy(page, 10)
  await expect(page.getByTestId('accuracy-slider')).toHaveValue('10')

  const expected = simplifyRdp(original, 10)
  const error = trackError(original, expected.indices)
  const expectedFiles = Math.ceil(expected.points.length / 500)

  await expect(page.getByTestId('stat-points')).toHaveAttribute(
    'data-to',
    String(expected.points.length),
  )
  await expect(page.getByTestId('stat-files')).toHaveAttribute(
    'data-count',
    String(expectedFiles),
  )
  const uiMax = Number(
    await page.getByTestId('stat-max-error').getAttribute('data-meters'),
  )
  expect(uiMax).toBeLessThanOrEqual(10)
  expect(uiMax).toBeCloseTo(error.max, 6)

  const files = await downloadAll(page)
  const exported = files.flatMap((file) => parseDownloadedGpx(file.xml))
  expect(exported).toEqual(expected.points)
  expect(exported[0]).toEqual(original[0])
  expect(exported.at(-1)).toEqual(original.at(-1))
  expect(exported.length).toBeLessThan(COURSE_POINT_COUNT)
})

test('reverse exports the course backwards', async ({ page }) => {
  await page.getByTestId('device-garmin').click()
  await page.getByTestId('reverse-yes').click()

  const files = await downloadAll(page)
  expect(files).toHaveLength(1)
  const exported = parseDownloadedGpx(files[0].xml)
  expect(exported).toEqual([...original].reverse())
  expect(exported[0]).toEqual(original.at(-1))
})

test('map click start drops the unused prefix from the download', async ({
  page,
}) => {
  await page.getByTestId('device-garmin').click()
  await page.getByTestId('start-beginning-no').click()
  await expect(page.locator('.pick-start .leaflet-container')).toBeVisible()

  const box = await page.locator('.leaflet-container').boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  await expect(page.getByTestId('stat-points')).not.toHaveAttribute(
    'data-from',
    String(COURSE_POINT_COUNT),
  )

  const from = Number(
    await page.getByTestId('stat-points').getAttribute('data-from'),
  )
  expect(from).toBeGreaterThan(0)
  expect(from).toBeLessThan(COURSE_POINT_COUNT)

  const files = await downloadAll(page)
  const exported = files.flatMap((file) => parseDownloadedGpx(file.xml))
  expect(exported).toHaveLength(from)
  expect(exported[0]).not.toEqual(original[0])
  expect(exported.at(-1)).toEqual(original.at(-1))
})

test('invalid GPX does not produce a download', async ({ page }) => {
  const badPath = path.join(fixtureDir, 'not-a-course.gpx')
  await writeFile(badPath, 'this is not a gpx file')
  await page.getByTestId('gpx-file-input').setInputFiles(badPath)
  await expect(page.getByTestId('parse-error')).toHaveText(
    /unable to parse gpx file|no track points found/i,
  )
  await expect(page.getByTestId('download-list')).toHaveCount(0)
  await expect(page.locator('.leaflet-container')).toHaveCount(0)
})
