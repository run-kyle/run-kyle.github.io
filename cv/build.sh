#!/bin/sh
# Regenerate the data-driven sections, then build cv.pdf.
# Any failure stops the script and prints where to look.
set -e
cd "$(dirname "$0")"
python3 gen_research.py
for i in 1 2; do
  if ! pdflatex -interaction=nonstopmode -halt-on-error cv.tex >/dev/null; then
    echo "pdflatex failed; first error:" >&2
    grep -m3 -A4 '^!' cv.log >&2
    exit 1
  fi
done
rm -f cv.aux cv.log cv.out
echo "cv.pdf built"
