#!/bin/sh
cd "$(dirname "$0")/.."
for g in techno house dnb disco electro breaks hiphop dubstep trance electronica ambient; do
  node tools/add-tracks.mjs --genre "$g" --count 6 --license commercial --sources archive.org
done
node tools/build-catalog.mjs
