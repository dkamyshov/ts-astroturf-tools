#!/bin/sh

set -e

cd typescript-babel && yarn && cd ..
cd typescript-webpack && yarn && cd .. 