// Game facts mirrored from the Lexicon Rogue source (lib/core/letters.dart, lib/core/content/glyphs.dart,
// lib/core/content/bosses.dart, lib/core/content/tomes.dart). Keep in sync when the game changes.

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
}

/** All 27 Glyphs, in catalogue order. */
export const glyphs: readonly Glyph[] = [
  { id: 'ink_blot', name: 'Ink Blot', rarity: 'common', effect: '+4 Mult' },
  { id: 'margin_note', name: 'Margin Note', rarity: 'common', effect: '+25 Base' },
  { id: 'vowel_harmony', name: 'Vowel Harmony', rarity: 'common', effect: '+2 Mult per vowel in the word' },
  { id: 'consonant_cluster', name: 'Consonant Cluster', rarity: 'common', effect: '+40 Base if the word has 3 consonants in a row' },
  { id: 'short_and_sweet', name: 'Short & Sweet', rarity: 'common', effect: '3‑tile words get +20 Base and +3 Mult' },
  { id: 'double_letter', name: 'Double Letter', rarity: 'common', effect: 'Words with a doubled letter (LL, EE…) get +6 Mult' },
  { id: 'plural', name: 'Plurality', rarity: 'common', effect: 'Words ending in S get +7 Mult' },
  { id: 'heavy_hand', name: 'Heavy Hand', rarity: 'common', effect: '+3 Mult for each tile worth 4 or more' },
  { id: 'opening_line', name: 'Opening Line', rarity: 'common', effect: 'First Play of each blind gets +12 Mult' },
  { id: 'capital_letter', name: 'Capital Letter', rarity: 'common', effect: '+30 Base if the first tile is worth 3 or more' },
  { id: 'alphabetical', name: 'Alphabetical', rarity: 'uncommon', effect: '×2 Mult if the letters are in alphabetical order (BEST, ALMOST)' },
  { id: 'palindrome', name: 'Palindrome', rarity: 'uncommon', effect: '×3 Mult on palindromes' },
  { id: 'q_without_u', name: 'Q Without U', rarity: 'uncommon', effect: 'The Qu tile becomes a plain Q; words with Q get ×2 Mult' },
  { id: 'pangrammer', name: 'Pangrammer', rarity: 'uncommon', effect: '+1 Mult for each distinct letter played this blind' },
  { id: 'thesaurus', name: 'Thesaurus', rarity: 'uncommon', effect: 'Gains +1 Mult permanently each time you play a 6+ tile word' },
  { id: 'ransom_note', name: 'Ransom Note', rarity: 'uncommon', effect: '+4 Mult for each different enhancement in the word' },
  { id: 'patron', name: 'Patron', rarity: 'uncommon', effect: '+1 Mult for every $4 you hold' },
  { id: 'last_gasp', name: 'Last Gasp', rarity: 'uncommon', effect: '×3 Mult on the final Play of a blind' },
  { id: 'cwm_rhythm', name: 'Cwm Rhythm', rarity: 'uncommon', effect: '×4 Mult if the word has no A, E, I, O or U' },
  { id: 'etymologist', name: 'Etymologist', rarity: 'rare', effect: 'Words ending in ‑ING, ‑TION, ‑NESS or ‑ED get ×2 Mult' },
  { id: 'lexicographer', name: 'Lexicographer', rarity: 'rare', effect: '×1.5 Mult for every Tome level above 1 on the word’s length' },
  { id: 'typo', name: 'Typo', rarity: 'rare', effect: 'Once per blind, an invalid word is accepted and scores normally' },
  { id: 'golden_ratio', name: 'Golden Ratio', rarity: 'rare', effect: 'Earn $1 per 2 letters in the word' },
  { id: 'echo_chamber', name: 'Echo Chamber', rarity: 'rare', effect: 'Retrigger the first and last tile of each word' },
  { id: 'anthology', name: 'Anthology', rarity: 'rare', effect: '×0.1 Mult for each different word played this run (from ×1)' },
  { id: 'gutenberg', name: 'Gutenberg', rarity: 'legendary', effect: 'Every played tile is permanently copied into your bag' },
  { id: 'oxford_comma', name: 'The Oxford Comma', rarity: 'legendary', effect: '×3 Mult; ×5 if you have exactly 3 Glyphs' },
]

/** Glyphs shown before "Show all": a spread across every rarity. */
export const featuredGlyphIds: readonly string[] = [
  'ink_blot', 'vowel_harmony', 'double_letter', 'palindrome', 'alphabetical', 'last_gasp',
  'etymologist', 'echo_chamber', 'oxford_comma',
]

export interface Boss {
  name: string
  rule: string
  /** Earliest ante the boss can appear in (1 when unrestricted). */
  minAnte: number
  /** Only appears in this ante. */
  onlyAnte?: number
}

/** The 13 Boss Blinds. */
export const bosses: readonly Boss[] = [
  { name: 'The Silencer', rule: 'Vowels score 0 Base', minAnte: 1 },
  { name: 'The Pedant', rule: 'Words under 5 letters score nothing', minAnte: 2 },
  { name: 'The Miser', rule: 'Hand size −2', minAnte: 2 },
  { name: 'The Mirror', rule: 'Can’t play a word you’ve already played this run', minAnte: 1 },
  { name: 'The Censor', rule: 'One random letter is banned each Play', minAnte: 1 },
  { name: 'The Inquisitor', rule: 'Your leftmost Glyph is disabled', minAnte: 1 },
  { name: 'The Fog', rule: 'Tile values are hidden', minAnte: 1 },
  { name: 'The Tax', rule: '−$1 per Swap used', minAnte: 1 },
  { name: 'The Tide', rule: 'Played tiles return to your hand face-down', minAnte: 1 },
  { name: 'The Rhymer', rule: 'Each word must end with the same 2 letters as the last, or it scores half', minAnte: 1 },
  { name: 'The Archivist', rule: 'Common words score ×2; obscure ones ×0.5', minAnte: 3 },
  { name: 'The Weight', rule: 'Each Play reduces Mult by 1 for the rest of the blind', minAnte: 2 },
  { name: 'The Final Word', rule: 'Only 1 Play; target ×0.5', minAnte: 8, onlyAnte: 8 },
]

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
