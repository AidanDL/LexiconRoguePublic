/** The site's base path ("/" normally, "/Repo/" on a GitHub Pages project site). Always ends in "/". */
export const base: string = import.meta.env.BASE_URL

/** Paths of the two pages (trailing slash so /privacy/ works on every static host). */
export const paths = { home: base, privacy: `${base}privacy/` } as const

/** URL of a file in public/ (icons, screenshots, glyphs), respecting the base path. */
export function asset(file: string): string {
  return base + file.replace(/^\//, '')
}
