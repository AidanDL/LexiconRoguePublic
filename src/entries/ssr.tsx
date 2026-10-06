import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Home } from '../pages/Home'
import { Privacy } from '../pages/Privacy'

export { publicSiteUrl, unsetPlaceholders } from '../site.config'

/** Pages that are pre-rendered at build time. */
export type PageId = 'home' | 'privacy'

/** Renders [page] to static HTML for the build-time pre-render step. */
export function render(page: PageId): string {
  const app = page === 'home' ? <Home /> : <Privacy />
  return renderToString(<StrictMode>{app}</StrictMode>)
}
