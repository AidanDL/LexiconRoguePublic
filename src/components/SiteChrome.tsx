import type { ReactNode } from 'react'
import { asset, paths } from '../paths'
import { display, site } from '../site.config'

type PageId = 'home' | 'privacy'

/** Translucent sticky top bar: logo (always home) and in-page navigation. */
export function SiteHeader({ page }: { page: PageId }) {
  const anchor = (id: string) => (page === 'home' ? `#${id}` : `${paths.home}#${id}`)
  return (
    <header className="site-header">
      <div className="container header-row">
        <a className="brand" href={paths.home} aria-label={`${site.gameName} home`}>
          <picture>
            <source srcSet={`${asset('icons/logo-64.webp')} 1x, ${asset('icons/logo-128.webp')} 2x`} type="image/webp" />
            <img src={asset('icons/logo-64.png')} alt="" width="32" height="32" />
          </picture>
          <span>{site.gameName}</span>
        </a>
        <nav className="site-nav" aria-label="Main">
          <a className="optional" href={anchor('how-it-plays')}>
            How it plays
          </a>
          <a className="optional" href={anchor('glyphs')}>
            Glyphs
          </a>
          <a className="optional" href={anchor('bosses')}>
            Bosses
          </a>
          <a href={paths.privacy} aria-current={page === 'privacy' ? 'page' : undefined}>
            Privacy
          </a>
        </nav>
      </div>
    </header>
  )
}

/** Footer: copyright, contact, privacy link and credits. */
export function SiteFooter() {
  const email = display(site.contactEmail, '')
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <a className="footer-brand" href={paths.home}>
            <img src={asset('icons/logo-64.png')} alt="" width="28" height="28" loading="lazy" />
            {site.gameName}
          </a>
          <nav aria-label="Footer">
            <a href={paths.home}>Home</a>
            <a href={paths.privacy}>Privacy policy</a>
            {email ? <a href={`mailto:${email}`}>Contact</a> : null}
          </nav>
        </div>
        <p className="credits">
          Set in{' '}
          <a href={asset('fonts/OFL.txt')}>Alegreya</a> by Huerta Tipográfica (SIL Open Font License 1.1). Words from
          the ENABLE word list (public domain) and SCOWL common words. Share cards mask words from the List of Dirty,
          Naughty, Obscene, and Otherwise Bad Words by Shutterstock (
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">
            CC BY 4.0
          </a>
          ). Google Play is a trademark of Google LLC.
        </p>
        <p className="copyright">
          © {site.copyrightYear} {display(site.developerName, site.gameName)}
          {email ? (
            <>
              {' · '}
              <a href={`mailto:${email}`}>{email}</a>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  )
}

/** Skip link, header, main content and footer. */
export function Page({ page, children }: { page: PageId; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader page={page} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
