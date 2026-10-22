// Builds the game states the promo clips are recorded from: a profile past onboarding, and one run per scene.
// source/scenes.sh copies this into the game repo's test/ folder and runs it there (so it uses the real rules
// and dictionary), writing profile.json and run-<scene>.json into SCENES_OUT, and printing what each scene's
// word scores so the clips' numbers can be checked against the game.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:lexicon_rogue/core/content/glyphs.dart';
import 'package:lexicon_rogue/core/meta.dart';
import 'package:lexicon_rogue/core/run.dart';
import 'package:lexicon_rogue/core/tile.dart';

import 'core/helpers.dart';

/// Puts exactly these tiles in hand, in order. Spec: "B L A Z:echo I N G E" (letter, optional :enhancement).
void setHand(RunState r, String spec) {
  final b = r.blind!;
  final pool = [...b.hand, ...b.drawPile];
  final hand = <Tile>[];
  for (final part in spec.split(' ')) {
    final [l, ...rest] = part.split(':');
    final enh = rest.isEmpty ? null : Enhancement.values.byName(rest.first);
    final i = pool.indexWhere((t) => t.letter == l && t.enhancement == null);
    final Tile t;
    if (i >= 0) {
      t = pool.removeAt(i)..enhancement = enh;
    } else {
      t = Tile(id: r.nextTileId++, letter: l, enhancement: enh);
      r.bag.add(t);
    }
    hand.add(t);
  }
  b.hand
    ..clear()
    ..addAll(hand);
  b.drawPile
    ..clear()
    ..addAll(pool);
}

/// Stacks the draw pile so the next draws are these letters (first drawn first).
void stackDraws(RunState r, String letters) {
  final b = r.blind!;
  for (final l in letters.split('').reversed) {
    final i = b.drawPile.indexWhere((t) => t.letter == l && t.enhancement == null);
    final t = i >= 0 ? b.drawPile.removeAt(i) : (Tile(id: r.nextTileId++, letter: l)..also(r.bag.add));
    b.drawPile.add(t);
  }
}

extension<T> on T {
  T also(void Function(T) f) {
    f(this);
    return this;
  }
}

RunState scene({
  required int seed,
  int ante = 1,
  List<String> glyphs = const [],
  List<String> inks = const [],
  int money = 4,
  BlindKind blind = BlindKind.small,
  String? boss,
  String? hand,
  bool select = true,
}) {
  final r = RunState(RunConfig(seed: seed))
    ..ante = ante
    ..money = money
    ..nextBlind = blind
    ..glyphs.addAll(glyphs.map(GlyphState.new))
    ..inks.addAll(inks);
  if (boss != null) r.bossId = boss;
  if (select) {
    r.selectBlind();
    if (hand != null) setHand(r, hand);
  }
  return r;
}

void main() {
  test('write scenes', () {
    final dict = loadDictionary();
    final out = Directory(Platform.environment['SCENES_OUT']!)..createSync(recursive: true);
    void write(String name, Map<String, Object?> json) =>
        File('${out.path}/$name.json').writeAsStringSync(jsonEncode(json));

    final profile = Profile()
      ..runs = 12
      ..tutorialSeen.addAll(['onboarded', 'tour_done', 'select', 'blind', 'scoring', 'boss', 'ink', 'cashout', 'shop', 'lost', 'summary']);
    // Music off: the clips carry only sound effects, and the edit lays the game's music track under them whole.
    profile.settings.musicVolume = 0;
    write('profile', profile.toJson());

    // Word each scene plays, for the printed check.
    final words = <String, String>{};
    final scenes = <String, RunState>{};

    // 1. Spelling a word and watching it score (the core loop), early run.
    scenes['blazing'] = scene(seed: 11, glyphs: ['ink_blot', 'etymologist'], hand: 'B L A Z I N G E');
    words['blazing'] = 'BLAZING';

    // 2. Glyph order: Etymologist (×2) first, then Ink Blot (+4); dragging Ink Blot first doubles the +4 too.
    scenes['order'] = scene(seed: 12, glyphs: ['etymologist', 'ink_blot'], hand: 'S P E L L I N G');
    words['order'] = 'SPELLING';

    // 3. Late-run build that breaks the score: The Oxford Comma is ×5 with exactly 3 Glyphs, and Glass tiles
    // double the Mult each.
    scenes['big'] = scene(
      seed: 13,
      ante: 6,
      money: 23,
      glyphs: ['etymologist', 'echo_chamber', 'oxford_comma'],
      hand: 'J:glass A:rubric Z:glass Z:glass I:rubric N G:glass E',
    );
    words['big'] = 'JAZZING';

    // 4. The Silencer boss: vowels score 0 Base, so play a word with none (Cwm Rhythm loves it).
    scenes['silencer-pick'] = scene(seed: 14, ante: 2, money: 9, glyphs: ['ink_blot', 'cwm_rhythm'], blind: BlindKind.boss, boss: 'silencer', select: false);
    scenes['silencer'] = scene(seed: 14, ante: 2, money: 9, glyphs: ['ink_blot', 'cwm_rhythm'], blind: BlindKind.boss, boss: 'silencer', hand: 'R H Y T H M S A');
    words['silencer'] = 'RHYTHMS';

    // 5. Monotype: every tile in hand gains +2 Base for good.
    scenes['monotype'] = scene(seed: 15, ante: 2, money: 7, glyphs: ['vowel_harmony', 'heavy_hand'], inks: ['monotype'], hand: 'Q U I C K E S T');
    words['monotype'] = 'QUICKEST';

    // 6. An 8-tile anagram: find the word.
    scenes['anagram'] = scene(seed: 16, ante: 3, money: 12, glyphs: ['ink_blot', 'short_and_sweet', 'margin_note'], hand: 'T N E R A G S R');
    words['anagram'] = 'STRANGER';

    // 7. The shop after a blind, with a Glyph pack of rares and a legendary to choose from.
    final shop = scene(seed: 17, ante: 3, money: 14, glyphs: ['ink_blot', 'vowel_harmony'], hand: 'S T O N E S A R');
    shop.blind!.score = shop.blind!.target - 1;
    shop.play(shop.tilesForWord('STONES')!, dict);
    shop.collect();
    shop.shop!.packs[0] = ShopPack(kind: PackKind.glyph, price: 6, options: ['palindrome', 'oxford_comma', 'echo_chamber']);
    shop.money = 14;
    scenes['shop'] = shop;

    for (final MapEntry(:key, :value) in scenes.entries) {
      write('run-$key', value.toJson());
      final w = words[key];
      if (w == null) continue;
      final ids = value.tilesForWord(w);
      final pv = ids == null ? null : value.preview(ids, dict);
      // ignore: avoid_print
      print('$key: $w ${pv == null ? 'NOT IN HAND' : pv.valid ? '${pv.result!.base} x ${pv.result!.mult} = ${pv.result!.total}' : 'invalid: ${pv.reason}'}');
    }
  });
}
