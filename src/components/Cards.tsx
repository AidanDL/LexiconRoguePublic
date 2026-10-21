import { rarityInfo, type Boss, type Glyph } from '../content/game'
import { asset } from '../paths'

/** A Glyph on parchment: illustration, name, rarity (shape + label) and effect. */
export function GlyphCard({ glyph }: { glyph: Glyph }) {
  const rarity = rarityInfo[glyph.rarity]
  return (
    <li className={`glyph-card rarity-${glyph.rarity}`}>
      <img src={asset(`glyphs/${glyph.id}.svg`)} alt="" width="56" height="56" loading="lazy" decoding="async" />
      <h3>{glyph.name}</h3>
      <p className="glyph-rarity">
        <span aria-hidden="true">{rarity.shape}</span> {rarity.label}
      </p>
      <p className="glyph-effect">{glyph.effect}</p>
      {glyph.unlock ? (
        <p className="glyph-unlock">
          <span className="visually-hidden">Unlock: </span>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {glyph.unlock}
        </p>
      ) : null}
    </li>
  )
}

/** A Boss Blind under a wax seal, with the antes it can appear in. */
export function BossCard({ boss }: { boss: Boss }) {
  return (
    <li className="boss-card">
      <span className="seal" aria-hidden="true">
        ✦
      </span>
      <div>
        <h3>{boss.name}</h3>
        <p>{boss.rule}</p>
        {boss.onlyAnte ? <p className="boss-when">Ante {boss.onlyAnte} only</p> : boss.minAnte > 1 ? <p className="boss-when">From ante {boss.minAnte}</p> : null}
      </div>
    </li>
  )
}
