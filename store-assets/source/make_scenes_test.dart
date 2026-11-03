// Builds the game states the promo clips are recorded from: a profile past onboarding, and one run per scene.
// source/scenes.sh copies this into the game repo's test/ folder and runs it there (so it uses the real rules
// and dictionary), writing profile.json and run-<scene>.json into SCENES_OUT, and printing what each scene's
// word scores so the clips' numbers can be checked against the game.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:lexicon_rogue/core/content/glyphs.dart';
import 'package:lexicon_rogue/core/daily.dart';
import 'package:lexicon_rogue/core/meta.dart';
import 'package:lexicon_rogue/core/run.dart';
import 'package:lexicon_rogue/core/streak.dart';
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

    // 8. Daily streak: 9 days running into 28 October 2026 (the emulator's real date; shortcut: re-date this
    // when re-recording on another day), and today's Daily one word from clearing ante 1's Boss. Clearing it
    // makes the streak 10, which fills the first freeze slot.
    const today = '2026-10-28';
    final days = [for (var d = 19; d <= 27; d++) '2026-10-$d'];
    final streakProfile = Profile.fromJson(profile.toJson())
      ..dailyStreak = (DailyStreak()
        ..days = 9
        ..best = 9
        ..slots = [9]
        ..counted = days.toSet()
        ..done = days.toSet()
        ..settledThrough = '2026-10-27');
    write('profile-streak', streakProfile.toJson());
    final daily = RunState(dailyConfig(today))
      ..money = 9
      ..glyphs.addAll(['ink_blot'].map(GlyphState.new))
      ..nextBlind = BlindKind.boss;
    daily.selectBlind();
    setHand(daily, 'S T R E A K S O');
    daily.blind!
      ..playsLeft = 1
      ..playsUsed = 3
      ..score = (daily.blind!.target * 0.8).roundToDouble();
    scenes['streak'] = daily;
    words['streak'] = 'STREAKS';
    // ignore: avoid_print
    print('streak: boss ${daily.blind!.bossId} target ${daily.blind!.target} score ${daily.blind!.score}');

    // 9. The real Daily for today, from the game's own config (no run saved: the game starts it from the Daily
    // tab). This plays ante 1 the way the bot would and prints each word with its hand slots, so the clip can be
    // played on the device with the same taps. Profile: no streak yet, so clearing ante 1 makes it 1.
    write('profile-daily', profile.toJson());
    final real = RunState(dailyConfig(today, unlockedGlyphs: profile.unlockedGlyphs, ranked: true));
    while (real.antesCleared < 1 && real.phase != RunPhase.lost) {
      if (real.phase == RunPhase.blindSelect) {
        real.selectBlind();
        // ignore: avoid_print
        print('daily: ${real.blind!.kind.name} target ${real.blind!.target} boss ${real.blind!.bossId}');
      }
      while (real.phase == RunPhase.blind) {
        final b = real.blind!;
        final best = real.bestPlay(dict, limit: 200)!;
        final slots = [for (final id in best.ids) b.hand.indexWhere((t) => t.id == id)];
        // ignore: avoid_print
        print('daily:   hand ${b.hand.map((t) => t.letter).join()} -> ${best.word} slots ${slots.join(',')} = ${best.score} (score ${b.score} + plays ${b.playsLeft})');
        real.play(best.ids, dict);
      }
      if (real.phase == RunPhase.cashOut) real.collect();
      if (real.phase == RunPhase.shop && real.antesCleared < 1) real.leaveShop();
    }
    // ignore: avoid_print
    print('daily: phase ${real.phase.name} total ${real.totalScore} money ${real.money}');

    // 10. Streak freezes, staged for a POV. "held": 10 days to yesterday with the freeze that 10 days earns.
    // "frozen": the same streak but yesterday missed; the game itself spends the freeze when it loads.
    Profile streakOf(List<String> counted, {int freezes = 0, List<int> slots = const []}) =>
        Profile.fromJson(profile.toJson())
          ..dailyStreak = (DailyStreak()
            ..days = counted.length
            ..best = counted.length
            ..freezes = freezes
            ..slots = [...slots]
            ..counted = counted.toSet()
            ..done = counted.toSet()
            ..settledThrough = counted.last);
    write('profile-held', streakOf([for (var d = 18; d <= 27; d++) '2026-10-$d'], freezes: 1, slots: [0]).toJson());
    write('profile-frozen', streakOf([for (var d = 17; d <= 26; d++) '2026-10-$d'], freezes: 1, slots: [0]).toJson());
    RunState bossDaily(String hand) {
      final r = RunState(dailyConfig(today))
        ..money = 9
        ..glyphs.addAll(['ink_blot'].map(GlyphState.new))
        ..nextBlind = BlindKind.boss;
      r.selectBlind();
      setHand(r, hand);
      r.blind!
        ..playsLeft = 1
        ..playsUsed = 3
        ..score = (r.blind!.target * 0.8).roundToDouble();
      return r;
    }
    scenes['held'] = bossDaily('F R O Z E N S A');
    scenes['frozen'] = bossDaily('F R O Z E N S A');
    words['frozen'] = 'FROZEN';

    // 11. The last ante's Boss: The Final Word (ante 8 only: 1 Play, target ×0.5), with a late-run build of five
    // Glyphs and a levelled 8-letter Tome. "final-pick" is the blind select; "final" the hand.
    RunState finalBoss({bool select = true}) {
      final r = scene(
        seed: 18,
        ante: 8,
        money: 31,
        glyphs: ['ink_blot', 'vowel_harmony', 'heavy_hand', 'etymologist', 'echo_chamber'],
        blind: BlindKind.boss,
        boss: 'final_word',
        select: false,
      )..tomeLevels[8] = 3;
      r.anteResults.addAll(List.filled(7, AnteResult.clear));
      if (select) {
        r.selectBlind();
        setHand(r, 'F:glass I N I S:rubric H E D');
      }
      return r;
    }
    scenes['final-pick'] = finalBoss(select: false);
    scenes['final'] = finalBoss();
    words['final'] = 'FINISHED';
    // ignore: avoid_print
    print('final: target ${scenes['final']!.blind!.target} plays ${scenes['final']!.blind!.playsLeft}');

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
