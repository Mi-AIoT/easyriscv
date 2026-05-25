#!/bin/bash
# Build both English and Chinese versions of Easy RISC-V
# SPDX-License-Identifier: CC0-1.0 OR 0BSD

export PATH="$HOME/bin:$PATH"

DATE_VAR="$(date --utc +"%F %R")"

echo "Building English version..."
pandoc --toc --template=template.html --lua-filter=filter.lua --variable=date:"$DATE_VAR" -o index.html index.md

echo "Building Chinese version..."
pandoc --toc --template=template.html --lua-filter=filter.lua --variable=date:"$DATE_VAR" -o index-zh.html index-zh.md

echo "Done. Built: index.html, index-zh.html"
