#!/bin/zsh
# Records every clip the promo and shorts use (see ../README.md). Takes about six minutes.
set -e
cd ${0:A:h}
./scenes.sh >/dev/null
r() { ./record.sh "$@" | tail -1; }
r blazing   blazing       16 -- wait:0.8 word:0,1,2,3,4,5,6 wait:0.6 play
r order     order-before  12 -- wait:0.8 word:0,1,2,3,4,5,6,7 wait:0.6 play
r order     order-after   16 -- wait:0.8 drag:270,621,90,621 wait:0.8 word:0,1,2,3,4,5,6,7 wait:0.6 play
r big       big           20 -- wait:0.8 word:0,1,2,3,4,5,6 wait:0.6 play
r silencer-pick silencer-pick 6 -- wait:1.8 540,1447
r silencer  silencer      14 -- wait:0.8 word:0,1,2,3,4,5,6 wait:0.6 play
r monotype  monotype      18 -- wait:0.8 988,567 wait:1.4 785,1898 wait:2 word:0,2,3,4,5,6,7 wait:0.6 play
r anagram   anagram       15 -- wait:2.5 word:6,0,3,4,1,5,2,7 wait:0.6 play
r shop      shop          10 -- wait:1 914,1453 wait:2 540,1466
OPEN=wait:0 r streak streak 20 340,1960 wait:1.5 swipe:540,1400,540,1000 wait:1 -- wait:2.2 540,1716 wait:2 word:0,1,2,3,4,5,6 wait:0.6 play wait:5 73,132 wait:1 736,1203 wait:4
OPEN=wait:0 r daily daily-real 72 340,1960 wait:1.5 -- wait:1 540,1716 wait:2.5 778,790 wait:2 word:7,1,3,6,5,2,4 wait:0.5 play wait:7 540,1290 wait:2.5 716,1939 wait:2.5 777,1092 wait:2 word:7,6,1,2,4,3 wait:0.5 play wait:6.5 word:2,7,1,6,4,5,0 wait:0.5 play wait:7 540,1290 wait:2.5 716,1939 wait:2.5 540,1499 wait:2 word:5,4,1,6,3,0,2 wait:0.5 play wait:7 73,132 wait:1 736,1203 wait:2 swipe:540,1400,540,1000 wait:3
OPEN=wait:0 r frozen frozen 20 340,1960 wait:1.5 swipe:540,1400,540,1000 wait:1 -- wait:2.5 540,1716 wait:2 word:0,1,2,3,4,5 wait:0.6 play wait:5 73,132 wait:1 736,1203 wait:4
OPEN=wait:0 r held held 9 340,1960 wait:1.5 swipe:540,1400,540,1000 wait:1 -- wait:3.5 540,1716 wait:3
r final-pick final-pick 6 -- wait:2.5 540,1445 wait:2
r final final 18 -- wait:1.5 word:0,1,2,3,4,5,6,7 wait:0.6 play wait:13
