// Renders a 512×512 PNG per Play Billing product, drawn with the game's own Seal, Quill and No-Ads icons.
// source/iap-icons.sh copies this into the game repo's test/ folder and runs it there, writing
// <product id>.png into ICONS_OUT.
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lexicon_rogue/core/number_format.dart';
import 'package:lexicon_rogue/services/store/store_service.dart';
import 'package:lexicon_rogue/ui/icons/game_icon.dart';
import 'package:lexicon_rogue/ui/theme.dart';
import 'package:lexicon_rogue/ui/widgets/common.dart';

const _px = 512.0;

Future<void> _loadFonts() async {
  for (final (family, files) in [
    ('Fraunces', ['Fraunces-Bold', 'Fraunces-Black']),
    ('IBM Plex Sans', ['IBMPlexSans-Regular', 'IBMPlexSans-Bold']),
  ]) {
    final loader = FontLoader(family);
    for (final f in files) {
      loader.addFont(rootBundle.load('assets/fonts/$f.ttf'));
    }
    await loader.load();
  }
}

/// Desk background with a warm glow, a thin gold frame, and [child] centred.
Widget _card({required Widget child, String? amount, String? label}) =>
    Container(
      width: _px,
      height: _px,
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          radius: 0.8,
          colors: [Color(0xFF4A3426), Palette.desk],
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Palette.gold.withValues(alpha: 0.55),
            width: 4,
          ),
          borderRadius: BorderRadius.circular(40),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            child,
            if (amount != null) ...[
              const SizedBox(height: 18),
              Text(
                amount,
                style: const TextStyle(
                  fontFamily: 'Fraunces',
                  fontWeight: FontWeight.w900,
                  fontSize: 96,
                  height: 1,
                  color: Palette.parchment,
                ),
              ),
              Text(
                label!.toUpperCase(),
                style: const TextStyle(
                  fontFamily: 'IBM Plex Sans',
                  fontWeight: FontWeight.w700,
                  fontSize: 30,
                  letterSpacing: 6,
                  color: Palette.gold,
                ),
              ),
            ],
          ],
        ),
      ),
    );

/// 1–4 overlapping Seals or Quills, fanned like the Store's pack tiles, scaled up.
Widget _pile(int count, {required bool seal}) {
  const size = 170.0, step = 62.0;
  return SizedBox(
    width: size + (count - 1) * step,
    height: size + 24,
    child: Stack(
      children: [
        for (var k = 0; k < count; k++)
          Positioned(
            left: k * step,
            top: k.isEven ? 24 : 0,
            child: seal
                ? const SealIcon(size: size)
                : const GameIcon('quill', size: size),
          ),
      ],
    ),
  );
}

Map<String, Widget> _icons() => {
  ProductIds.removeAds: _card(
    amount: 'No Ads',
    label: 'Forever',
    child: const NoAdsIcon(size: 230),
  ),
  for (final (i, MapEntry(:key, :value)) in ProductIds.seals.entries.indexed)
    key: _card(
      amount: formatNumber(value),
      label: 'Seals',
      child: _pile(i + 1, seal: true),
    ),
  for (final (i, MapEntry(:key, :value)) in ProductIds.quills.entries.indexed)
    key: _card(
      amount: formatNumber(value),
      label: 'Quills',
      child: _pile(i + 1, seal: false),
    ),
};

void main() {
  final out = Platform.environment['ICONS_OUT'] ?? 'build/iap-icons';

  testWidgets('render IAP icons', (tester) async {
    await tester.runAsync(_loadFonts);
    tester.view
      ..physicalSize = const Size.square(_px)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    Directory(out).createSync(recursive: true);

    final icons = _icons();
    expect(icons.keys.toSet(), ProductIds.all.toSet());
    for (final MapEntry(key: id, value: icon) in icons.entries) {
      final key = GlobalKey();
      await tester.pumpWidget(
        Directionality(
          textDirection: TextDirection.ltr,
          child: DefaultTextStyle(
            style: const TextStyle(fontFamily: 'IBM Plex Sans'),
            child: RepaintBoundary(key: key, child: icon),
          ),
        ),
      );
      // The quill is an SVG, decoded off the test clock.
      await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 300)));
      await tester.pump();
      final boundary =
          key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final bytes = await tester.runAsync(() async {
        final image = await boundary.toImage();
        return image.toByteData(format: ui.ImageByteFormat.png);
      });
      File('$out/$id.png').writeAsBytesSync(bytes!.buffer.asUint8List());
      // ignore: avoid_print
      print('$id: $out/$id.png');
    }
  });
}
