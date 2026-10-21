// Game facts from the Lexicon Rogue source. Glyphs, Inks and Bosses come from catalog.json, exported from the game
// by scripts/sync-catalog.sh; letter values and the length bonus are mirrored from lib/core/letters.dart and
// lib/core/content/tomes.dart by hand. Re-run the sync when the game changes.
import catalog from './catalog.json'

/** Letter values (lib/core/letters.dart). */
export const letterValues: Readonly<Record<string, number>> = {
  E: 1, A: 1, I: 1, O: 1, N: 1, R: 1, S: 1, T: 1,
  L: 2, U: 2, D: 2,
  G: 3, H: 3, C: 3, M: 3, P: 3,
  B: 4, F: 4, W: 4, Y: 4,
  K: 5, V: 5,
  J: 8, X: 8,
  Q: 10, Z: 10,
}

/** Length bonus added after the tiles score (lib/core/content/tomes.dart). */
export const lengthBonus: Readonly<Record<number, { base: number; mult: number }>> = {
  3: { base: 5, mult: 0 },
  4: { base: 10, mult: 1 },
  5: { base: 20, mult: 2 },
  6: { base: 35, mult: 3 },
  7: { base: 55, mult: 5 },
  8: { base: 100, mult: 8 },
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

/** Rarity label and its colourblind-safe shape, as in the game. */
export const rarityInfo: Readonly<Record<Rarity, { label: string; shape: string }>> = {
  common: { label: 'Common', shape: '●' },
  uncommon: { label: 'Uncommon', shape: '◆' },
  rare: { label: 'Rare', shape: '★' },
  legendary: { label: 'Legendary', shape: '✦' },
}

export interface Glyph {
  /** Matches the SVG file name in public/glyphs/. */
  id: string
  name: string
  rarity: Rarity
  effect: string
  /** How a Glyph that starts locked is unlocked. */
  unlock?: string
}

/** Every Glyph, in the game's catalogue order. */
export const glyphs: readonly Glyph[] = catalog.glyphs as Glyph[]

export interface Ink {
  id: string
  name: string
  /** Matches the SVG file name in public/inks/ (a one-colour game-icons.net style icon). */
  icon: string
  effect: string
  /** When it can be used and what it is aimed at. */
  use: string
  /** game-icons.net author and licence; absent for Little Fathom's own icons. */
  credit?: string
}

/** Every Ink, in the game's catalogue order. */
export const inks: readonly Ink[] = catalog.inks

/** Glyphs shown before "Show all": a spread across every rarity. */
export const featuredGlyphIds: readonly string[] = [
  'ink_blot', 'vowel_harmony', 'double_letter', 'palindrome', 'alphabetical', 'last_gasp',
  'etymologist', 'echo_chamber', 'oxford_comma',
]

export interface Boss {
  id: string
  name: string
  rule: string
  /** Earliest ante the boss can appear in (1 when unrestricted). */
  minAnte: number
  /** Only appears in this ante. */
  onlyAnte?: number
}

/** Every Boss Blind. */
export const bosses: readonly Boss[] = catalog.bosses

/** A Glyph the scoring demo can fire. */
export interface DemoGlyph {
  id: 'ink_blot' | 'etymologist'
  name: string
  effect: string
  apply: (word: string, mult: number) => number
}

export const demoGlyphs: Readonly<Record<DemoGlyph['id'], DemoGlyph>> = {
  ink_blot: { id: 'ink_blot', name: 'Ink Blot', effect: '+4 Mult', apply: (_w, m) => m + 4 },
  etymologist: {
    id: 'etymologist',
    name: 'Etymologist',
    effect: '×2 Mult on ‑ING, ‑TION, ‑NESS, ‑ED',
    apply: (w, m) => (['ING', 'TION', 'NESS', 'ED'].some((e) => w.endsWith(e)) ? m * 2 : m),
  },
}

export interface Score {
  base: number
  mult: number
  total: number
}

/** Base × Mult as the game scores a plain word: tiles, then the length bonus, then Glyphs left to right. */
export function scoreWord(word: string, glyphOrder: readonly DemoGlyph[] = []): Score {
  if (word.length === 0) return { base: 0, mult: 0, total: 0 }
  let base = 0
  for (const letter of word) base += letterValues[letter] ?? 0
  let mult = 1
  const bonus = lengthBonus[Math.min(Math.max(word.length, 3), 8)]
  base += bonus.base
  mult += bonus.mult
  for (const glyph of glyphOrder) mult = glyph.apply(word, mult)
  return { base, mult, total: Math.round(base * mult) }
}

/** "2964" → "2,964". */
export function formatScore(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
