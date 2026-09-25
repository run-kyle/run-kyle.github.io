#!/bin/sh
# Build cv.pdf from cv.tex. Runs twice so hyperref settles its references.
set -e
cd "$(dirname "$0")"
for i in 1 2; do
  pdflatex -interaction=nonstopmode -halt-on-error cv.tex >/dev/null
done
rm -f cv.aux cv.log cv.out
echo "cv.pdf built"
