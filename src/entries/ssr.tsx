import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Codex } from '../pages/Codex'
import { Home } from '../pages/Home'
import { Privacy } from '../pages/Privacy'

export { publicSiteUrl, unsetPlaceholders } from '../site.config'

/** Pages that are pre-rendered at build time. */
export type PageId = 'home' | 'codex' | 'privacy'

/** Renders [page] to static HTML for the build-time pre-render step. */
export function render(page: PageId): string {
  const app = { home: <Home />, codex: <Codex />, privacy: <Privacy /> }[page]
  return renderToString(<StrictMode>{app}</StrictMode>)
}
