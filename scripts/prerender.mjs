// Injects server-rendered HTML into the built pages, makes social-preview URLs absolute when the public
// site URL is configured, then removes the temporary SSR bundle.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, unsetPlaceholders, publicSiteUrl, structuredData } = await import(new URL('../dist-ssr/ssr.js', import.meta.url).href)

const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/')
const siteUrl = publicSiteUrl()

const pages = [
  { id: 'home', file: 'dist/index.html', path: '' },
  { id: 'codex', file: 'dist/codex/index.html', path: 'codex/' },
  { id: 'privacy', file: 'dist/privacy/index.html', path: 'privacy/' },
]

for (const { id, file, path } of pages) {
  const full = root + file
  let html = await readFile(full, 'utf8')
  if (!html.includes('<!--app-html-->')) throw new Error(`${file} has no <!--app-html--> marker`)
  html = html.replace('<!--app-html-->', render(id))
  if (siteUrl) {
    // og:image / twitter:image must be absolute for link previews; add canonical + og:url too.
    html = html.replace(
      /(<meta (?:property|name)="(?:og:image|twitter:image)" content=")([^"]+)"/g,
      (_, start, url) => `${start}${new URL(url.startsWith(base) ? url.slice(base.length) : url, siteUrl)}"`,
    )
    const page = new URL(path, siteUrl).href
    html = html.replace('</head>', `  <link rel="canonical" href="${page}" />\n    <meta property="og:url" content="${page}" />\n  </head>`)
    if (id === 'home') {
      const json = JSON.stringify(structuredData()).replaceAll('<', '\\u003c')
      html = html.replace('</head>', `  <script type="application/ld+json">${json}</script>\n  </head>`)
    }
  }
  await writeFile(full, html)
  console.log(`pre-rendered ${file}`)
}

// Crawlers: allow everything and point at the sitemap (which needs absolute URLs, so only with siteUrl).
let robots = 'User-agent: *\nAllow: /\n'
if (siteUrl) {
  const urls = pages.map(({ path }) => `  <url><loc>${new URL(path, siteUrl).href}</loc></url>`).join('\n')
  await writeFile(root + 'dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  robots += `\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`
  console.log('wrote dist/sitemap.xml')
}
await writeFile(root + 'dist/robots.txt', robots)

await rm(root + 'dist-ssr', { recursive: true, force: true })

const missing = unsetPlaceholders()
if (missing.length > 0) {
  const bar = '!'.repeat(72)
  console.warn(`\n${bar}\n  Placeholders still unset in src/site.config.ts: ${missing.join(', ')}\n  Fill them in before submitting the privacy policy URL.\n${bar}\n`)
}
if (!siteUrl) console.log('note: siteUrl is unset in src/site.config.ts, so og:image stays relative (set it for rich link previews).')
