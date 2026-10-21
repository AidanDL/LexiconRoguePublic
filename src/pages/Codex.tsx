import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { BossCard, GlyphCard } from '../components/Cards'
import { Page } from '../components/SiteChrome'
import { bosses, glyphs, inks, rarityInfo, type Ink, type Rarity } from '../content/game'
import { springTransition } from '../motion'
import { asset } from '../paths'

const tabs = [
  { id: 'glyphs', label: 'Glyphs', count: glyphs.length, noun: ['Glyph', 'Glyphs'] },
  { id: 'inks', label: 'Inks', count: inks.length, noun: ['Ink', 'Inks'] },
  { id: 'bosses', label: 'Bosses', count: bosses.length, noun: ['Boss', 'Bosses'] },
] as const

type TabId = (typeof tabs)[number]['id']
const rarities = Object.keys(rarityInfo) as Rarity[]

const isTab = (s: string): s is TabId => tabs.some((t) => t.id === s)

/** Case-insensitive match on any of [fields]. */
function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase()
  return q === '' || fields.some((f) => f?.toLowerCase().includes(q))
}

function InkCard({ ink }: { ink: Ink }) {
  return (
    <li className="ink-card">
      <span className="ink-badge" aria-hidden="true">
        <span className="ink-icon" style={{ '--mask': `url(${asset(`inks/${ink.icon}.svg`)})` } as CSSProperties} />
      </span>
      <div>
        <h3>{ink.name}</h3>
        <p>{ink.effect}</p>
        <p className="ink-use">{ink.use}</p>
      </div>
    </li>
  )
}

/** Glyphs, Inks and Boss Blinds: every one in the game, with a segmented control, search and a rarity filter. */
export function Codex() {
  const [tab, setTab] = useState<TabId>('glyphs')
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState<Rarity | 'all'>('all')
  const [spring, setSpring] = useState<string>()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchId = useId()

  // The tab lives in the URL (/codex/#inks) so it can be linked to and survives a reload.
  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1)
      if (isTab(h)) setTab(h)
    }
    fromHash()
    // The thumb only springs once the tab from the URL has been painted, so it doesn't slide in on load.
    requestAnimationFrame(() => requestAnimationFrame(() => setSpring(springTransition())))
    addEventListener('hashchange', fromHash)
    return () => removeEventListener('hashchange', fromHash)
  }, [])

  const choose = (id: TabId) => {
    setTab(id)
    history.replaceState(null, '', `#${id}`)
  }

  // Arrow keys move between segments, as in a native tab bar.
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key]
    if (step === undefined) return
    e.preventDefault()
    const next = (i + step + tabs.length) % tabs.length
    choose(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  const index = tabs.findIndex((t) => t.id === tab)
  const current = tabs[index]

  const shownGlyphs = glyphs.filter((g) => (rarity === 'all' || g.rarity === rarity) && matches(query, g.name, g.effect, g.unlock))
  const shownInks = inks.filter((i) => matches(query, i.name, i.effect, i.use))
  const shownBosses = bosses.filter((b) => matches(query, b.name, b.rule))
  const shown = { glyphs: shownGlyphs.length, inks: shownInks.length, bosses: shownBosses.length }[tab]
  const filtered = shown !== current.count
  const credits = [...new Set(inks.flatMap((i) => (i.credit ? [i.credit.replace(/ \(.*\)$/, '')] : [])))].sort()

  return (
    <Page page="codex">
      <header className="codex-head container">
        <p className="eyebrow">The Codex</p>
        <h1>Every Glyph, Ink and Boss</h1>
        <p className="lede">
          {glyphs.length} Glyphs to bend the scoring, {inks.length} Inks to rewrite your tiles and {bosses.length} Boss
          Blinds that fight back.
        </p>
      </header>

      <div className="codex-bar">
        <div className="container codex-bar-row">
          <div className="segmented" role="tablist" aria-label="Codex sections" style={{ '--i': index, '--n': tabs.length, '--spring': spring } as CSSProperties}>
            <span className="segmented-thumb" aria-hidden="true" />
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={t.id === tab}
                aria-controls={`panel-${t.id}`}
                tabIndex={t.id === tab ? 0 : -1}
                onClick={() => choose(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t.label} <span className="segment-count">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="codex-search">
            <label className="visually-hidden" htmlFor={searchId}>
              Search the Codex
            </label>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 20 20" />
            </svg>
            <input id={searchId} type="search" placeholder="Search names and effects" autoComplete="off" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container codex-body">
        <div className="codex-meta">
          {tab === 'glyphs' ? (
            <div className="rarity-filter" role="group" aria-label="Filter by rarity">
              {(['all', ...rarities] as const).map((r) => (
                <button key={r} type="button" className={`filter-chip${r === 'all' ? '' : ` rarity-${r}`}`} aria-pressed={rarity === r} onClick={() => setRarity(r)}>
                  {r === 'all' ? (
                    'All'
                  ) : (
                    <>
                      <span className="chip-shape" aria-hidden="true">
                        {rarityInfo[r].shape}
                      </span>
                      {rarityInfo[r].label}
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : null}
          <p className="codex-count" aria-live="polite">
            {filtered ? `${shown} of ${current.count} ${current.noun[1]}` : `${current.count} ${current.noun[1]}`}
          </p>
        </div>

        <section id="panel-glyphs" role="tabpanel" aria-labelledby="tab-glyphs" hidden={tab !== 'glyphs'}>
          <ul className="glyph-grid">
            {shownGlyphs.map((g) => (
              <GlyphCard key={g.id} glyph={g} />
            ))}
          </ul>
        </section>

        <section id="panel-inks" role="tabpanel" aria-labelledby="tab-inks" hidden={tab !== 'inks'}>
          <p className="codex-intro">Inks are single-use: find them in packs, then use them to change your tiles, your bag or the blind.</p>
          <ul className="ink-grid">
            {shownInks.map((i) => (
              <InkCard key={i.id} ink={i} />
            ))}
          </ul>
          <p className="codex-credit">
            Ink icons by {credits.join(', ')} from <a href="https://game-icons.net" rel="noopener">game-icons.net</a> (
            <a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener">
              CC BY 3.0
            </a>
            ), and by Little Fathom.
          </p>
        </section>

        <section id="panel-bosses" role="tabpanel" aria-labelledby="tab-bosses" hidden={tab !== 'bosses'}>
          <p className="codex-intro">Every ante ends with a Boss Blind that changes the rules for one round.</p>
          <ul className="boss-grid">
            {shownBosses.map((b) => (
              <BossCard key={b.id} boss={b} />
            ))}
          </ul>
        </section>

        {shown === 0 ? (
          <div className="codex-empty">
            <p>
              No {current.noun[1]} match “{query.trim()}”{tab === 'glyphs' && rarity !== 'all' ? ` among ${rarityInfo[rarity].label} Glyphs` : ''}.
            </p>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => {
                setQuery('')
                setRarity('all')
              }}
            >
              Clear search
            </button>
          </div>
        ) : null}
      </div>
    </Page>
  )
}
