import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render } from './entries/ssr'

const root = resolve(import.meta.dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

function filesUnder(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = `${dir}${name}`
    return statSync(join(root, path)).isDirectory() ? filesUnder(`${path}/`) : [path]
  })
}

const sources = [
  'index.html',
  'privacy/index.html',
  'README.md',
  ...filesUnder('src/'),
  ...filesUnder('public/').filter((f) => /\.(txt|svg)$/.test(f) && !f.endsWith('OFL.txt')),
]
const rendered = [render('home'), render('privacy')]

describe('trademark rule', () => {
  it('never names other games', () => {
    // Split so this test file doesn't trip itself.
    const banned = new RegExp(['Bal' + 'atro', 'Scr' + 'abble', 'Wor' + 'dle'].join('|'), 'i')
    for (const file of sources) expect(read(file), file).not.toMatch(banned)
    for (const html of rendered) expect(html).not.toMatch(banned)
  })
})

describe('no third-party requests', () => {
  // Resources the browser would fetch automatically (scripts, styles, fonts, images, iframes).
  const external = [
    /<(?:script|img|iframe|source|video|audio)\b[^>]*\b(?:src|srcset)="(?:https?:)?\/\//i,
    /<link\b(?=[^>]*\brel="(?:stylesheet|preload|icon|apple-touch-icon|preconnect|dns-prefetch|modulepreload)")[^>]*\bhref="(?:https?:)?\/\//i,
    /url\(\s*['"]?(?:https?:)?\/\//i,
    /@import\s+['"]?(?:url\()?\s*['"]?(?:https?:)?\/\//i,
    /fonts\.(?:googleapis|gstatic)\.com/i,
    /google-analytics|googletagmanager|gtag\(/i,
  ]

  it('loads nothing from other origins', () => {
    const files = ['index.html', 'privacy/index.html', 'src/styles.css']
    for (const file of files) for (const pattern of external) expect(read(file), `${file} ${pattern}`).not.toMatch(pattern)
    for (const html of rendered) for (const pattern of external) expect(html).not.toMatch(pattern)
  })

  it('self-hosts Alegreya with its licence', () => {
    const css = read('src/styles.css')
    expect(css).toMatch(/@font-face\s*{[^}]*Alegreya[^}]*url\('\/fonts\/Alegreya-ExtraBold\.ttf'\)/)
    expect(read('public/fonts/OFL.txt')).toContain('SIL OPEN FONT LICENSE')
  })

  it('sets no cookies and uses no storage', () => {
    for (const file of filesUnder('src/').filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts'))) {
      expect(read(file), file).not.toMatch(/document\.cookie|localStorage|sessionStorage|indexedDB/)
    }
  })
})
