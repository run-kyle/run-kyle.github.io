#!/bin/sh
# Regenerate the research sections from data/profile.json, then build cv.pdf.
set -e
cd "$(dirname "$0")"
python3 gen_research.py
for i in 1 2; do
  pdflatex -interaction=nonstopmode -halt-on-error cv.tex >/dev/null
done
rm -f cv.aux cv.log cv.out
echo "cv.pdf built"
