import { letterValues } from '../content/game'

/** A parchment letter tile with its value in the corner, drawn like the game's tiles. Decorative by default. */
export function Tile({ letter, size = 'md' }: { letter: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`tile tile-${size}`}>
      <span className="tile-letter">{letter}</span>
      <span className="tile-value">{letterValues[letter]}</span>
    </span>
  )
}

/** The blue Base chip × red Mult chip pair. */
export function Chips({ base, mult, dim = false }: { base: number | string; mult: number | string; dim?: boolean }) {
  return (
    <span className={dim ? 'chips is-dim' : 'chips'}>
      <span className="chip chip-base">
        <span className="visually-hidden">Base </span>
        {base}
      </span>
      <span className="chips-times" aria-hidden="true">
        ×
      </span>
      <span className="visually-hidden">times </span>
      <span className="chip chip-mult">
        <span className="visually-hidden">Mult </span>
        {mult}
      </span>
    </span>
  )
}
