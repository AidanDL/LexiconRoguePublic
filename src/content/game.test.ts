import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { demoRack, demoWords } from './demoWords'
import { bosses, demoGlyphs, featuredGlyphIds, glyphs, inks, scoreWord } from './game'

const svgsIn = (dir: string) => readdirSync(resolve(import.meta.dirname, '../../public', dir)).filter((f) => f.endsWith('.svg'))

describe('game content', () => {
  it('has every Glyph, each with its illustration', () => {
    expect(glyphs.length).toBeGreaterThan(100)
    expect(svgsIn('glyphs').sort()).toEqual(glyphs.map((g) => `${g.id}.svg`).sort())
    for (const id of featuredGlyphIds) expect(glyphs.some((g) => g.id === id)).toBe(true)
  })

  it('has every Ink, each with its icon', () => {
    expect(inks.length).toBeGreaterThan(30)
    expect(svgsIn('inks').sort()).toEqual([...new Set(inks.map((i) => `${i.icon}.svg`))].sort())
  })

  it('has all 13 Boss Blinds', () => {
    expect(bosses).toHaveLength(13)
  })

  it('scores like the game: tiles + length bonus, then Glyphs left to right', () => {
    // FOCAL in the store screenshot: 31 Base × 3 Mult.
    expect(scoreWord('FOCAL')).toEqual({ base: 31, mult: 3, total: 93 })
    // SPELL with Ink Blot, as on the feature graphic: 29 × 7.
    expect(scoreWord('SPELL', [demoGlyphs.ink_blot])).toMatchObject({ base: 29, mult: 7 })
    const { ink_blot, etymologist } = demoGlyphs
    expect(scoreWord('SPELLING', [ink_blot, etymologist]).total).toBe(114 * 26)
    expect(scoreWord('SPELLING', [etymologist, ink_blot]).total).toBe(114 * 22)
  })

  it('accepts the demo rack’s words and only those', () => {
    expect(demoRack.join('').split('').sort().join('')).toBe('EGILLNPS')
    expect(demoWords.has('SPELLING')).toBe(true)
    expect(demoWords.has('SPELL')).toBe(true)
    expect(demoWords.has('SPELLS')).toBe(false)
    expect(demoWords.has('PENIS')).toBe(false)
  })
})
