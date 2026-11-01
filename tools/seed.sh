#!/bin/sh
# Builds the initial catalog: ~12 tracks per genre, plus extra tracks whose
# licence also allows paid gigs (no NC/ND).
cd "$(dirname "$0")/.."
for g in techno house dnb disco electro breaks hiphop dubstep trance electronica ambient; do
  node tools/add-tracks.mjs --genre "$g" --count 12 --sources archive.org,openverse
  node tools/add-tracks.mjs --genre "$g" --count 6 --license commercial --sources archive.org,openverse
done
node tools/build-catalog.mjs
