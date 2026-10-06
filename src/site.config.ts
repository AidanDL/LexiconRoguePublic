/** Marker for values the owner must fill in before the site goes live. */
export const PLACEHOLDER = '__FILL_ME_IN__'

/** Everything site-specific lives here. */
export interface SiteConfig {
  /** Game name as shown to players. */
  gameName: string
  /** One-line hook. */
  tagline: string
  /** Who publishes the game (shown in the footer and privacy policy). */
  developerName: string
  /** Where players and reviewers can reach the developer about privacy. */
  contactEmail: string
  /** Google Play listing; leave as PLACEHOLDER until the app is live to show "Coming soon". */
  playStoreUrl: string
  /**
   * Public origin + base path the site is served from, e.g. "https://littlefathom.com/lexicon-rogue/".
   * Optional: when set, the build writes absolute og:image / canonical URLs (social previews need them).
   */
  siteUrl: string
  /** Android application id. */
  androidPackage: string
  /** Date the privacy policy last changed, ISO yyyy-mm-dd. Change it whenever the policy text changes. */
  privacyLastUpdated: string
  /** Year shown in the footer copyright. */
  copyrightYear: number
}

export const site: SiteConfig = {
  gameName: 'Lexicon Rogue',
  tagline: 'Spell words. Bend the rules. Break the score.',
  developerName: 'Little Fathom',
  contactEmail: 'info@littlefathom.com',
  playStoreUrl: PLACEHOLDER,
  siteUrl: PLACEHOLDER,
  androidPackage: 'com.littlefathom.lexicon_rogue',
  privacyLastUpdated: '2026-10-06',
  copyrightYear: 2026,
}

/** Names of fields that must be filled before launch. `playStoreUrl` / `siteUrl` may stay unset for now. */
export function unsetPlaceholders(config: SiteConfig = site): (keyof SiteConfig)[] {
  const required: (keyof SiteConfig)[] = ['developerName', 'contactEmail']
  return required.filter((key) => config[key] === PLACEHOLDER)
}

/** Whether the Play Store link is live yet. */
export function isOnPlayStore(config: SiteConfig = site): boolean {
  return config.playStoreUrl !== PLACEHOLDER && config.playStoreUrl.startsWith('https://')
}

/** The public site URL (always ending in "/"), or null while unset. */
export function publicSiteUrl(config: SiteConfig = site): string | null {
  if (config.siteUrl === PLACEHOLDER || !config.siteUrl.startsWith('https://')) return null
  return config.siteUrl.endsWith('/') ? config.siteUrl : `${config.siteUrl}/`
}

/** Display text for a value that may still be a placeholder. */
export function display(value: string, fallback: string): string {
  return value === PLACEHOLDER ? fallback : value
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "2026-10-06" → "6 October 2026" (no Intl, so server and client render identically). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d || m > 12) throw new Error(`Bad ISO date: ${iso}`)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
