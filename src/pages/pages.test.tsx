import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render as renderToHtml } from '../entries/ssr'
import { formatDate, site } from '../site.config'
import { Home } from './Home'
import { Privacy } from './Privacy'
import { policySections } from './policySections'

describe('Home', () => {
  it('shows the title, tagline and a Play Store call to action', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1, name: site.gameName })).toBeInTheDocument()
    expect(screen.getByText(site.tagline)).toBeInTheDocument()
    expect(screen.getAllByText('Google Play').length).toBeGreaterThan(0)
  })

  it('shows "coming soon" rather than a dead link while the listing is not live', () => {
    render(<Home />)
    expect(screen.getAllByText('Coming soon to').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /google play/i })).toBeNull()
  })

  it('has every section, linked from the header', () => {
    render(<Home />)
    for (const id of ['how-it-plays', 'glyphs', 'bosses', 'daily', 'screenshots', 'fair-play']) {
      expect(document.getElementById(id)).not.toBeNull()
    }
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Glyphs' })).toHaveAttribute('href', '#glyphs')
  })

  it('shows all 27 Glyphs and 13 Boss Blinds', () => {
    render(<Home />)
    const glyphs = document.querySelectorAll('.glyph-card')
    expect(glyphs).toHaveLength(27)
    expect(within(document.getElementById('bosses')!).getAllByRole('heading', { level: 3 })).toHaveLength(13)
    expect(screen.getByRole('heading', { name: 'The Oxford Comma' })).toBeInTheDocument()
  })

  it('gives every screenshot descriptive alt text and a size', () => {
    render(<Home />)
    const shots = Array.from(document.querySelectorAll<HTMLImageElement>('img[src*="screens/"]'))
    expect(shots.length).toBeGreaterThanOrEqual(5)
    for (const img of shots) {
      expect(img.alt.length).toBeGreaterThan(20)
      expect(img).toHaveAttribute('width')
      expect(img).toHaveAttribute('height')
    }
  })

  it('makes the fair-play promises', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: 'Ads are optional rewards' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No paid random items' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plays offline' })).toBeInTheDocument()
  })

  it('links to the privacy policy from header and footer', () => {
    render(<Home />)
    const links = screen.getAllByRole('link', { name: /privacy/i }).filter((a) => a.getAttribute('href') === '/privacy/')
    expect(links.length).toBeGreaterThanOrEqual(2)
  })

  it('credits the font and word lists', () => {
    render(<Home />)
    const footer = screen.getByRole('contentinfo')
    for (const credit of ['Alegreya', 'ENABLE', 'SCOWL', 'CC BY 4.0']) expect(footer.textContent).toContain(credit)
  })
})

describe('Scoring demo', () => {
  const tap = (name: string) => fireEvent.click(screen.getAllByRole('button', { name })[0])

  it('scores a spelled word and lets the Glyph order change the result', () => {
    render(<Home />)
    for (const l of 'SPELLING') tap(`${l}, worth ${l === 'P' || l === 'G' ? 3 : l === 'L' ? 2 : 1}`)
    expect(screen.getByRole('status')).toHaveTextContent('SPELLING, all 8 tiles. LEXICON!')
    expect(screen.getByLabelText('Mult 26')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /swap order/i }))
    expect(screen.getByLabelText('Mult 22')).toBeInTheDocument()
  })

  it('rejects non-words and can be cleared', () => {
    render(<Home />)
    tap('S, worth 1')
    tap('L, worth 2')
    tap('G, worth 3')
    expect(screen.getByRole('status')).toHaveTextContent('SLG isn’t in the dictionary.')
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByRole('status')).toHaveTextContent('Tap tiles to spell a word.')
  })
})

describe('Privacy policy', () => {
  it('has every section in order, with a table of contents', () => {
    render(<Privacy />)
    const article = screen.getByRole('article')
    const headings = within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(policySections.map(([, h]) => h))
    const toc = screen.getByRole('complementary')
    for (const [id] of policySections) expect(within(toc).getAllByRole('link').some((a) => a.getAttribute('href') === `#${id}`)).toBe(true)
  })

  it('names every service the app uses and links Google’s policies', () => {
    render(<Privacy />)
    const text = document.body.textContent!
    for (const service of [
      'Google AdMob',
      'User Messaging Platform',
      'Firebase Analytics',
      'Firebase Crashlytics',
      'Firebase Remote Config',
      'Google Play Games',
      'Google Play Billing',
      'Shorebird',
    ]) {
      expect(text).toContain(service)
    }
    expect(screen.getAllByRole('link', { name: 'Google Privacy Policy' })[0]).toHaveAttribute('href', 'https://policies.google.com/privacy')
    expect(screen.getByRole('link', { name: /How Google uses information from sites or apps/ })).toHaveAttribute(
      'href',
      'https://policies.google.com/technologies/partner-sites',
    )
  })

  it('states the facts Play Console and AdMob reviewers look for', () => {
    render(<Privacy />)
    const text = document.body.textContent!
    expect(text).toContain('Settings → Privacy options')
    expect(text).toContain('Settings → Reset progress')
    expect(text).toContain('Interstitial ads are never shown to players who have made any purchase')
    expect(text).toContain('We never receive your payment card')
    expect(text).toContain('13 and over')
    expect(text).toContain('do not sell your personal information')
    expect(text).toMatch(/encrypted in transit/i)
    for (const permission of ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED', 'AD_ID', 'BILLING']) {
      expect(text).toContain(permission)
    }
    expect(text).toMatch(/not.{0,20}access your location, contacts, camera, microphone/)
  })

  it('names the developer and links the contact email, with no placeholders left', () => {
    render(<Privacy />)
    const mail = screen.getAllByRole('link', { name: site.contactEmail })
    expect(mail[0]).toHaveAttribute('href', `mailto:${site.contactEmail}`)
    expect(document.body.textContent).toContain(site.developerName)
    expect(document.querySelector('.placeholder')).toBeNull()
  })

  it('states the effective date and the Android package', () => {
    render(<Privacy />)
    const time = document.querySelector('time')!
    expect(time).toHaveAttribute('dateTime', site.privacyLastUpdated)
    expect(time).toHaveTextContent(formatDate(site.privacyLastUpdated))
    expect(screen.getByText(site.androidPackage)).toBeInTheDocument()
  })

  it('offers a way back home', () => {
    render(<Privacy />)
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(crumbs).getByRole('link', { name: site.gameName })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: `← Back to ${site.gameName}` })).toHaveAttribute('href', '/')
  })
})

describe('pre-render', () => {
  it('renders both pages to static HTML with their content', () => {
    const home = renderToHtml('home')
    expect(home).toContain(site.tagline)
    expect(home).toContain('The Silencer')
    const privacy = renderToHtml('privacy')
    expect(privacy).toContain('Privacy policy')
    expect(privacy).toContain('Advertising (Google AdMob)')
    expect(privacy).toContain(site.contactEmail)
  })
})
