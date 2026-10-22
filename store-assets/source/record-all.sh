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
