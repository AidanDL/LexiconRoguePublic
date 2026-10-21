// Exports the game's Glyphs, Inks and Boss Blinds to JSON for the site's Codex page.
// scripts/sync-catalog.sh copies this into the game repo's test/ folder and runs it there, so it reads the real
// catalogues instead of a hand-kept copy. Output path: the CATALOG_OUT environment variable.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:lexicon_rogue/core/content/bosses.dart';
import 'package:lexicon_rogue/core/content/glyphs.dart';
import 'package:lexicon_rogue/core/content/inks.dart';
import 'package:lexicon_rogue/ui/icons/icon_credits.g.dart';

void main() {
  test('export catalog', () {
    final sources = (jsonDecode(File('tool/icons/sources.json').readAsStringSync()) as Map<String, Object?>)
        .cast<String, Map<String, Object?>>();
    // game-icons.net icon name -> credited author, as the in-app credits list them.
    final authorOf = {
      for (final a in gameIconAuthors)
        for (final i in a.icons) i: a,
    };
    String? credit(String icon) {
      final src = sources[icon];
      final author = src == null ? null : authorOf[src['icon']];
      return author == null ? null : '${author.name} (${author.license})';
    }

    String? unlock(GlyphDef g) {
      if (!g.startsLocked) return null;
      if (g.unlockHint != null) return g.unlockHint;
      return g.unlockCost > 0 ? '${g.unlockCost} Quills in the Library' : null;
    }

    String use(InkDef i) {
      if (i.needsTargets) {
        final n = i.minTargets == i.targets
            ? '${i.targets}'
            : '${i.minTargets == 0 ? 'up to' : '${i.minTargets}–'} ${i.targets}'.replaceAll('– ', '–');
        return 'Aim at $n tile${i.targets == 1 ? '' : 's'}';
      }
      return i.inBlind ? 'During a blind' : 'Any time, even in the shop';
    }

    final out = {
      'glyphs': [
        for (final g in glyphCatalog)
          {
            'id': g.id,
            'name': g.name,
            'rarity': g.rarity.name,
            'effect': g.text,
            if (unlock(g) case final u?) 'unlock': u,
          },
      ],
      'inks': [
        for (final i in inkCatalog)
          {
            'id': i.id,
            'name': i.name,
            'icon': i.icon,
            'effect': i.text,
            'use': use(i),
            if (credit(i.icon) case final c?) 'credit': c,
          },
      ],
      'bosses': [
        for (final b in bossCatalog)
          {
            'id': b.id,
            'name': b.name,
            'rule': b.rule,
            'minAnte': b.minAnte,
            if (b.onlyAnte != null) 'onlyAnte': b.onlyAnte,
          },
      ],
    };
    File(Platform.environment['CATALOG_OUT']!).writeAsStringSync(
      '${const JsonEncoder.withIndent('  ').convert(out)}\n',
    );
  });
}
