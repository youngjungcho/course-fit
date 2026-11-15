#!/bin/bash
# 올리기 전 검사: GitHub Actions가 올릴 때마다 돌려요. 이 컴퓨터에서도 같은 걸 돌릴 수 있어요: bash tools/ci-check.sh
set -e
cd "$(dirname "$0")/.."
echo "== 1. 장소 자료 검사"
node tools/lint-places.js > /tmp/lint.txt || { cat /tmp/lint.txt; exit 1; }
grep "■" /tmp/lint.txt
echo "== 2. 화면 버전과 sw.js 버전이 같은지"
a=$(grep -o 'REGION_VERSION = "[^"]*"' index.html | cut -d'"' -f2)
b=$(grep -o 'const VERSION = "[^"]*"' sw.js | cut -d'"' -f2)
[ "$a" = "$b" ] || { echo "index.html $a ≠ sw.js $b — 둘을 같게 올려 주세요"; exit 1; }
echo "버전 $a"
echo "== 3. 지역 안내 페이지가 장소 자료와 맞는지"
node tools/build-pages.js > /dev/null
git diff --quiet -- course/ || { git diff --stat -- course/; echo "지역 안내 페이지가 낡았어요: node tools/build-pages.js 를 돌려 함께 올려 주세요"; exit 1; }
echo "== 4. 코스 규칙 검사 (빠른 모드)"
for r in $(node -e 'console.log(new Function(require("fs").readFileSync("regions.js","utf8")+";return REGIONS")().map(r=>r.id).join(" "))'); do
  REGION=$r QUICK=1 node tools/check.js
done
echo "모두 통과"
