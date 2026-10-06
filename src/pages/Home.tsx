import type { ReactNode } from 'react'
import { ScoreDemo } from '../components/ScoreDemo'
import { Page } from '../components/SiteChrome'
import { StoreBadge } from '../components/StoreBadge'
import { Chips, Tile } from '../components/Tile'
import { bosses, featuredGlyphIds, glyphs, rarityInfo, type Glyph } from '../content/game'
import { asset, paths } from '../paths'
import { site } from '../site.config'

interface Shot {
  file: string
  alt: string
  caption: string
}

const screenshots: readonly Shot[] = [
  {
    file: '1_home',
    caption: 'Start a run or today’s Daily',
    alt: 'Home screen: the Lexicon Rogue title, New run and Daily #279 buttons, and Library, Codex, Store and Settings.',
  },
  {
    file: '2_compose',
    caption: 'Spell from your hand of tiles',
    alt: 'A Small Blind with a target of 150. FOCAL is spelled in the word tray, previewing 31 Base × 3 Mult = 93.',
  },
  {
    file: '3_scoring',
    caption: 'Every number shows its work',
    alt: 'Scoring FOCAL: the tiles light up one by one, “5 letters +2 Mult”, then 31 Base × 3 Mult.',
  },
  {
    file: '4_shop',
    caption: 'Buy Glyphs, packs and Vouchers',
    alt: 'The shop: Consonant Cluster and Alphabetical Glyphs for sale, Tome and Ink packs, and the Connoisseur Voucher.',
  },
  {
    file: '5_blinds',
    caption: 'Three blinds an ante, then a Boss',
    alt: 'Choosing a blind: Small Blind (target 150), Big Blind (225) and The Rhymer boss blind (300).',
  },
]

const HERO_WORD = ['S', 'P', 'E', 'L', 'L'] as const

function Screenshot({ shot, eager = false, sizes }: { shot: Shot; eager?: boolean; sizes: string }) {
  const set = (ext: string) => `${asset(`screens/${shot.file}-360.${ext}`)} 360w, ${asset(`screens/${shot.file}-720.${ext}`)} 720w`
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={asset(`screens/${shot.file}-720.png`)}
        alt={shot.alt}
        width="360"
        height="720"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  )
}

function GlyphCard({ glyph }: { glyph: Glyph }) {
  const rarity = rarityInfo[glyph.rarity]
  return (
    <li className={`glyph-card rarity-${glyph.rarity}`}>
      <img src={asset(`glyphs/${glyph.id}.svg`)} alt="" width="56" height="56" loading="lazy" />
      <h3>{glyph.name}</h3>
      <p className="glyph-rarity">
        <span aria-hidden="true">{rarity.shape}</span> {rarity.label}
      </p>
      <p className="glyph-effect">{glyph.effect}</p>
    </li>
  )
}

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          {intro ? <p className="lede">{intro}</p> : null}
        </header>
        {children}
      </div>
    </section>
  )
}

function Icon({ name }: { name: 'ad' | 'coin' | 'trophy' | 'offline' }) {
  const paths: Record<typeof name, ReactNode> = {
    ad: <path d="M5 12l4 4 10-10" />,
    coin: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
        <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" />
      </>
    ),
    offline: (
      <>
        <path d="M4 9a12 12 0 0 1 16 0M7 12.5a7.5 7.5 0 0 1 10 0M10 16a3 3 0 0 1 4 0" />
        <path d="M3 3l18 18" />
      </>
    ),
  }
  return (
    <svg className="promise-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

/** The Lexicon Rogue landing page. */
export function Home() {
  const featured = featuredGlyphIds.map((id) => glyphs.find((g) => g.id === id)!)
  const rest = glyphs.filter((g) => !featuredGlyphIds.includes(g.id))

  return (
    <Page page="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">A roguelike word game for Android</p>
            <h1 id="hero-title">{site.gameName}</h1>
            <hr className="gold-rule" />
            <p className="tagline">{site.tagline}</p>
            <div className="hero-tiles" aria-hidden="true">
              {HERO_WORD.map((l, i) => (
                <Tile key={i} letter={l} size="lg" />
              ))}
            </div>
            <div className="hero-chips" aria-hidden="true">
              <Chips base={29} mult={7} />
            </div>
            <p className="hero-blurb">
              Spell words from a hand of letter tiles to beat rising score targets, then spend your winnings on Glyphs
              that bend the scoring rules until your run is gloriously, absurdly broken.
            </p>
            <div className="cta-row">
              <StoreBadge />
              <a className="button button-quiet" href="#how-it-plays">
                How it plays
              </a>
            </div>
            <p className="fine">Free to play · Ads are optional rewards · Plays offline</p>
          </div>
          <div className="hero-phone">
            <div className="phone">
              <Screenshot shot={screenshots[1]} eager sizes="(min-width: 960px) 300px, 240px" />
            </div>
          </div>
        </div>
      </section>

      <Section
        id="how-it-plays"
        eyebrow="How it plays"
        title="Every word is a weapon"
        intro="A run is eight antes of three blinds each. Beat each blind’s score target before you run out of Plays."
      >
        <ol className="steps">
          <li>
            <span className="step-num" aria-hidden="true">
              1
            </span>
            <h3>Spell</h3>
            <p>Draw 8 letter tiles and spell the best word you can. Longer and rarer words hit harder, and using all eight is a LEXICON.</p>
          </li>
          <li>
            <span className="step-num" aria-hidden="true">
              2
            </span>
            <h3>Base × Mult</h3>
            <p>
              Tiles add <span className="ink-base">Base</span>, word length adds Base and{' '}
              <span className="ink-mult">Mult</span>, and your score is the two multiplied. No hidden maths.
            </p>
          </li>
          <li>
            <span className="step-num" aria-hidden="true">
              3
            </span>
            <h3>Order matters</h3>
            <p>Glyphs fire left to right. Drag them into the perfect order: +Mult before ×Mult turns a good word into a huge one.</p>
          </li>
        </ol>
        <h3 className="demo-title">Try a hand</h3>
        <ScoreDemo />
      </Section>

      <Section
        id="glyphs"
        eyebrow="27 Glyphs"
        title="Bend the scoring rules"
        intro="Glyphs are the illuminations in the margins of your run. Collect up to five, then put them in the right order."
      >
        <ul className="glyph-grid">
          {featured.map((g) => (
            <GlyphCard key={g.id} glyph={g} />
          ))}
        </ul>
        <details className="more-glyphs">
          <summary className="button button-quiet">
            <span className="when-closed">Show all {glyphs.length} Glyphs</span>
            <span className="when-open">Show fewer Glyphs</span>
          </summary>
          <ul className="glyph-grid">
            {rest.map((g) => (
              <GlyphCard key={g.id} glyph={g} />
            ))}
          </ul>
        </details>
        <p className="aside">
          Enhance your tiles too (Gold, Glass, Stone, Wild, Inked and Echo), level up word lengths with Tomes, rewrite
          your bag with Inks and grab permanent Vouchers.
        </p>
      </Section>

      <Section
        id="bosses"
        eyebrow="13 Boss Blinds"
        title="Then the rules fight back"
        intro="Every ante ends with a Boss Blind that changes the rules for one round. Read the seal before you play."
      >
        <ul className="boss-grid">
          {bosses.map((b) => (
            <li key={b.name} className="boss-card">
              <span className="seal" aria-hidden="true">
                ✦
              </span>
              <div>
                <h3>{b.name}</h3>
                <p>{b.rule}</p>
                {b.onlyAnte ? <p className="boss-when">Ante {b.onlyAnte} only</p> : b.minAnte > 1 ? <p className="boss-when">From ante {b.minAnte}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="daily" eyebrow="Daily Run" title="Same tiles for everyone, every day">
        <div className="daily-grid">
          <div className="daily-copy">
            <p>
              Each day brings one seeded run: the same bag, the same draws and the same shop for every player. Keep
              your streak alive, then share a result card that shows how far you got without spoiling the tiles.
            </p>
            <ul className="ticks">
              <li>Runs take 12–20 minutes; a blind takes 2–5.</li>
              <li>No timers, ever. Think as long as you like.</li>
              <li>Endless mode for when 8 antes isn’t enough.</li>
              <li>Unlock new Bags, Stakes and Glyphs in the Library.</li>
            </ul>
          </div>
          <figure className="share-card">
            <pre aria-label="Example share card: Lexicon Rogue Daily number 279, five antes cleared or close and lost on ante 6, best word SPELLING for 2,964 points.">
              {'Lexicon Rogue · Daily #279\n🟩🟩🟨🟩🟩🟥  Ante 6\nBest word: SPELLING  2,964 pts\nBuild: 🖋️🏺🔤'}
            </pre>
            <figcaption>A share card. Green cleared, yellow scraped through, red ended the run.</figcaption>
          </figure>
        </div>
      </Section>

      <Section id="screenshots" eyebrow="Screenshots" title="A scriptorium in your pocket">
        <ul className="gallery">
          {screenshots.map((s) => (
            <li key={s.file}>
              <figure>
                <div className="phone">
                  <Screenshot shot={s} sizes="(min-width: 960px) 200px, 220px" />
                </div>
                <figcaption>{s.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="fair-play" eyebrow="Fair play" title="Friendly by design">
        <ul className="promises">
          <li>
            <Icon name="ad" />
            <h3>Ads are optional rewards</h3>
            <p>Watch one for a shop reroll, a revive, a free Ink or double Quills, only if you want to. After any purchase, interstitials never appear again.</p>
          </li>
          <li>
            <Icon name="coin" />
            <h3>No paid random items</h3>
            <p>Packs show what’s inside and are bought with in-game coins. Everything can be earned by playing.</p>
          </li>
          <li>
            <Icon name="trophy" />
            <h3>Fair Daily leaderboards</h3>
            <p>No ad or purchase affects Daily leaderboard scores. Every player gets the same tiles and the same shop.</p>
          </li>
          <li>
            <Icon name="offline" />
            <h3>Plays offline</h3>
            <p>No connection needed to play. Leaderboards, achievements and cloud save join in when you’re online.</p>
          </li>
        </ul>
        <p className="aside">
          Reduced motion, large tiles and full haptics and sound controls are in Settings. Read exactly what data the
          game handles in the <a href={paths.privacy}>privacy policy</a>.
        </p>
      </Section>

      <section className="closing" aria-labelledby="closing-title">
        <div className="container">
          <img className="closing-icon" src={asset('icons/logo-128.png')} alt="" width="88" height="88" loading="lazy" />
          <h2 id="closing-title">Grab your quill. The scriptorium is open.</h2>
          <StoreBadge />
        </div>
      </section>
    </Page>
  )
}
