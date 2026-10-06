// GENERATED from the game's ENABLE word list (assets/dict/en.txt): every 3–8 letter word that can be
// spelled from the demo rack S P E L L I N G, minus words the game masks on public surfaces.

/** Letters on the demo rack (shuffled so the 8-letter word isn't spelled out). */
export const demoRack = ['L', 'E', 'S', 'P', 'I', 'N', 'G', 'L'] as const

/** Words the demo accepts. */
export const demoWords: ReadonlySet<string> = new Set(
  `
    EGIS ELL ELLS ELS ENG ENGS ENS GEL GELS GEN GENIP GENIPS GENS GIE GIEN GIES GILL GILLS GIN GINS GIP
    GIPS GLEN GLENS ILL ILLS INGLE INGLES INS ISLE LEG LEGS LEI LEIS LENIS LENS LIE LIEN LIENS LIES LIN
    LINE LINES LING LINGS LINS LIP LIPS LIS LISLE LISP NIL NILL NILLS NILS NIP NIPS PEG PEGS PEIN PEINS
    PEN PENS PENSIL PES PIE PIES PIG PIGS PILE PILES PILL PILLS PIN PINE PINES PING PINGS PINS PIS PLIE
    PLIES PSI SEG SEGNI SEI SEL SELL SELLING SEN SENGI SIGN SILL SIN SINE SING SINGE SINGLE SIP SIPE
    SLING SLIP SLIPE SNELL SNIP SNIPE SPEIL SPELL SPELLING SPIEL SPILE SPILL SPIN SPINE SPINEL SPLINE
  `.trim().split(/\s+/),
)
