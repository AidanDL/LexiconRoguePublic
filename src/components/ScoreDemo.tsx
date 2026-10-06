import { useLayoutEffect, useRef, useState } from 'react'
import { demoRack, demoWords } from '../content/demoWords'
import { demoGlyphs, formatScore, lengthBonus, letterValues, scoreWord, type DemoGlyph } from '../content/game'
import { playFrom, snapshot, type Snapshot } from '../motion'
import { asset } from '../paths'

/** A rack tile, identified by its slot so the two Ls stay distinct. */
interface RackTile {
  slot: number
  letter: string
}

const rack: readonly RackTile[] = demoRack.map((letter, slot) => ({ slot, letter }))

function TileButton({ tile, label, onPress }: { tile: RackTile; label: string; onPress: () => void }) {
  return (
    <button type="button" className="tile tile-md tile-button" data-flip={`t${tile.slot}`} aria-label={label} onClick={onPress}>
      <span className="tile-letter" aria-hidden="true">
        {tile.letter}
      </span>
      <span className="tile-value" aria-hidden="true">
        {letterValues[tile.letter]}
      </span>
    </button>
  )
}

function GlyphChip({ glyph, position }: { glyph: DemoGlyph; position: number }) {
  return (
    <li className="demo-glyph" data-flip={glyph.id}>
      <img src={asset(`glyphs/${glyph.id}.svg`)} alt="" width="40" height="40" />
      <span>
        <strong>
          <span className="visually-hidden">{position}. </span>
          {glyph.name}
        </strong>
        <small>{glyph.effect}</small>
      </span>
    </li>
  )
}

/** "Try a hand": tap tiles to spell, watch Base × Mult, then swap the Glyph order. */
export function ScoreDemo() {
  const [spelled, setSpelled] = useState<number[]>([])
  const [order, setOrder] = useState<DemoGlyph['id'][]>(['ink_blot', 'etymologist'])
  const root = useRef<HTMLDivElement>(null)
  const before = useRef<Snapshot | null>(null)

  // Measure before every change, animate after React has laid out the new positions.
  const change = (apply: () => void) => {
    before.current = snapshot(root.current)
    apply()
  }
  useLayoutEffect(() => {
    if (!before.current) return
    playFrom(root.current, before.current)
    before.current = null
  }, [spelled, order])

  const word = spelled.map((slot) => rack[slot].letter).join('')
  const glyphs = order.map((id) => demoGlyphs[id])
  const valid = word.length >= 3 && demoWords.has(word)
  const score = scoreWord(word, valid ? glyphs : [])
  const tileSum = [...word].reduce((sum, l) => sum + (letterValues[l] ?? 0), 0)
  const bonus = lengthBonus[Math.min(Math.max(word.length, 3), 8)]

  let status: string
  if (word.length === 0) status = 'Tap tiles to spell a word.'
  else if (word.length < 3) status = 'Words need at least 3 letters.'
  else if (!valid) status = `${word} isn’t in the dictionary.`
  else if (word.length === 8) status = `${word}, all 8 tiles. LEXICON!`
  else status = `${word} scores ${formatScore(score.total)}.`

  const add = (slot: number) => change(() => setSpelled((s) => [...s, slot]))
  const remove = (slot: number) => change(() => setSpelled((s) => s.filter((x) => x !== slot)))
  const clear = () => change(() => setSpelled([]))
  const swap = () => change(() => setOrder((o) => [o[1], o[0]]))

  return (
    <div className="demo" ref={root}>
      <div className="demo-glyph-row">
        <p className="demo-label" id="demo-glyphs-label">
          Your Glyphs fire left to right
        </p>
        <div className="demo-glyph-controls">
          <ol className="demo-glyphs" aria-labelledby="demo-glyphs-label">
            {glyphs.map((g, i) => (
              <GlyphChip key={g.id} glyph={g} position={i + 1} />
            ))}
          </ol>
          <button type="button" className="button button-quiet swap-button" onClick={swap}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Swap order
          </button>
        </div>
      </div>

      <div className="demo-board">
        <div className="demo-tray" aria-label="Word tray">
          {spelled.length === 0 ? <span className="demo-tray-hint" aria-hidden="true">Word tray</span> : null}
          {spelled.map((slot) => (
            <TileButton key={slot} tile={rack[slot]} label={`Remove ${rack[slot].letter}`} onPress={() => remove(slot)} />
          ))}
        </div>

        <div className={valid ? 'demo-score is-valid' : 'demo-score'}>
          <span className="chips">
            <span className="chip chip-base" aria-label={`Base ${score.base}`}>
              {valid ? score.base : '–'}
            </span>
            <span className="chips-times" aria-hidden="true">
              ×
            </span>
            <span className="chip chip-mult" aria-label={`Mult ${score.mult}`}>
              {valid ? score.mult : '–'}
            </span>
          </span>
          <span className="demo-total" aria-hidden="true">
            = {valid ? formatScore(score.total) : '0'}
          </span>
        </div>

        <p className="demo-status" role="status" aria-live="polite">
          {status}
        </p>
        {valid ? (
          <p className="demo-work">
            Tiles {tileSum} · {word.length} letters +{bonus.base} Base
            {bonus.mult ? ` +${bonus.mult} Mult` : ''}
            {glyphs.map((g) => {
              const fires = g.id === 'ink_blot' || /(ING|TION|NESS|ED)$/.test(word)
              return fires ? ` · ${g.name} ${g.id === 'ink_blot' ? '+4' : '×2'}` : ''
            })}
          </p>
        ) : (
          <p className="demo-work">Every number shows its work.</p>
        )}

        <div className="demo-rack" aria-label="Your tiles">
          {rack.map((tile) =>
            spelled.includes(tile.slot) ? (
              <span key={tile.slot} className="tile-slot" aria-hidden="true" />
            ) : (
              <TileButton key={tile.slot} tile={tile} label={`${tile.letter}, worth ${letterValues[tile.letter]}`} onPress={() => add(tile.slot)} />
            ),
          )}
        </div>
        <div className="demo-actions">
          <button type="button" className="button button-quiet" onClick={clear} disabled={spelled.length === 0}>
            Clear
          </button>
        </div>
      </div>
      <p className="demo-hint">
        Try <strong>SPELLING</strong>, then swap the Glyphs. +Mult before ×Mult is where the magic happens.
      </p>
    </div>
  )
}
