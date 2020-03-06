#!/bin/sh

set -e

rm -rf ts-tmp lib

yarn ttsc --outDir ts-tmp
yarn babel ts-tmp --out-dir lib --extensions .js --source-maps
yarn ttsc --declaration --declarationMap --emitDeclarationOnly
yarn postcss lib/**/*.css --replace -m
