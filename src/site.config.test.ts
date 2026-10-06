import { describe, expect, it } from 'vitest'
import { formatDate, isOnPlayStore, PLACEHOLDER, publicSiteUrl, site, unsetPlaceholders } from './site.config'

describe('site config', () => {
  it('reports every required field still set to the placeholder', () => {
    const missing = unsetPlaceholders({ ...site, contactEmail: PLACEHOLDER, developerName: PLACEHOLDER })
    expect(missing).toEqual(expect.arrayContaining(['contactEmail', 'developerName']))
  })

  it('reports nothing once the required fields are filled', () => {
    expect(unsetPlaceholders(site)).toEqual([])
  })

  it('knows the studio, contact and Android package', () => {
    expect(site.developerName).toBe('Little Fathom')
    expect(site.contactEmail).toBe('info@littlefathom.com')
    expect(site.androidPackage).toBe('com.littlefathom.lexicon_rogue')
  })

  it('only treats an https Play URL as live', () => {
    expect(isOnPlayStore({ ...site, playStoreUrl: PLACEHOLDER })).toBe(false)
    expect(isOnPlayStore({ ...site, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.littlefathom.lexicon_rogue' })).toBe(true)
  })

  it('normalises the public site URL', () => {
    expect(publicSiteUrl({ ...site, siteUrl: PLACEHOLDER })).toBeNull()
    expect(publicSiteUrl({ ...site, siteUrl: 'https://example.com/lexicon' })).toBe('https://example.com/lexicon/')
  })

  it('formats the policy date without locale surprises', () => {
    expect(formatDate('2026-10-06')).toBe('6 October 2026')
    expect(() => formatDate('06/10/2026')).toThrow()
  })
})
