#!/usr/bin/env python3
"""Copies the game's real art into public/ and makes web-sized versions.

Usage:  python3 scripts/make-assets.py [path/to/LexiconRogue]   (default: ../LexiconRogue)

Reads only from the game repo. Writes:
  public/fonts/       Alegreya Regular/Bold/ExtraBold + OFL.txt (self-hosted)
  public/icons/       favicon.ico, icon-32/180/192/512.png, logo-64/128 (header)
  public/og-image.png Feature graphic, used as the Open Graph / Twitter card image
  public/glyphs/      The 27 Glyph SVGs (ink on transparent, for parchment cards)
  public/screens/     Phone screenshots as AVIF + WebP at 360w/720w, plus a 720w PNG fallback

Needs Pillow (with AVIF support, Pillow >= 11.2). Re-run whenever the game's art changes, then commit.
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GAME = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (ROOT.parent / 'LexiconRogue')
PUBLIC = ROOT / 'public'

SCREENS = ['1_home', '2_compose', '3_scoring', '4_shop', '5_blinds']
WIDTHS = [360, 720]


def out(*parts: str) -> Path:
    path = PUBLIC.joinpath(*parts)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def main() -> None:
    if not (GAME / 'pubspec.yaml').exists():
        sys.exit(f'Not the Lexicon Rogue repo: {GAME}')

    for name in ['Alegreya-Regular.ttf', 'Alegreya-Bold.ttf', 'Alegreya-ExtraBold.ttf', 'OFL.txt']:
        shutil.copyfile(GAME / 'assets/fonts' / name, out('fonts', name))

    icon = Image.open(GAME / 'assets/icon/icon.png').convert('RGB')
    icon512 = Image.open(GAME / 'store/icon_512.png').convert('RGB')
    for size in [32, 180, 192]:
        icon.resize((size, size), Image.LANCZOS).save(out('icons', f'icon-{size}.png'), optimize=True)
    icon512.save(out('icons', 'icon-512.png'), optimize=True)
    icon.save(out('icons', 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    for size in [64, 128]:
        small = icon.resize((size, size), Image.LANCZOS)
        small.save(out('icons', f'logo-{size}.png'), optimize=True)
        small.save(out('icons', f'logo-{size}.webp'), quality=90)

    shutil.copyfile(GAME / 'store/feature_graphic.png', out('og-image.png'))

    glyphs = sorted((GAME / 'assets/glyphs').glob('*.svg'))
    for svg in glyphs:
        shutil.copyfile(svg, out('glyphs', svg.name))

    for name in SCREENS:
        shot = Image.open(GAME / 'store/screenshots' / f'{name}.png').convert('RGB')
        for width in WIDTHS:
            height = round(shot.height * width / shot.width)
            small = shot.resize((width, height), Image.LANCZOS)
            small.save(out('screens', f'{name}-{width}.avif'), quality=60)
            small.save(out('screens', f'{name}-{width}.webp'), quality=80, method=6)
            if width == WIDTHS[-1]:
                small.save(out('screens', f'{name}-{width}.png'), optimize=True)

    print(f'Copied fonts, icons, {len(glyphs)} glyphs and {len(SCREENS)} screenshots from {GAME}')


if __name__ == '__main__':
    main()
