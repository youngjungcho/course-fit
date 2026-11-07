#!/bin/bash
# 이동 시간 계산기(OSRM) 준비: 한국 지도 자료를 받아 차·걷기·자전거용으로 만들어요.
# 한 번만 하면 되고, 지도를 새로 받고 싶을 때 다시 돌려요. (약 290MB 받기 + 만들기 10~30분)
#
#   bash tools/osrm-setup.sh          # 받기 + 만들기
#   bash tools/osrm-setup.sh --skip-download   # 받은 지도로 다시 만들기만
#
# 필요한 것: brew install osrm-backend  (osrm-extract, osrm-partition, osrm-customize, osrm-routed)
# 자료는 tools/osrm-data/ 에 두고 git에는 올리지 않아요(.gitignore).
set -euo pipefail
cd "$(dirname "$0")"
DIR=osrm-data
PBF="$DIR/kr.osm.pbf"
URL="https://download.geofabrik.de/asia/south-korea-latest.osm.pbf"
mkdir -p "$DIR"

command -v osrm-extract >/dev/null || { echo "osrm-backend가 없어요: brew install osrm-backend"; exit 1; }
PROFILES="$(brew --prefix osrm-backend)/share/osrm/profiles"

if [ "${1:-}" != "--skip-download" ]; then
  echo "지도 받는 중: $URL"
  curl -L --fail -o "$PBF.part" "$URL"
  mv "$PBF.part" "$PBF"
  date "+%Y-%m-%d" > "$DIR/MAP_DATE"
fi
[ -f "$PBF" ] || { echo "$PBF 가 없어요. --skip-download 없이 다시 돌려 주세요."; exit 1; }

for p in car foot bicycle; do
  echo "== $p 만드는 중"
  mkdir -p "$DIR/$p"
  ln -sf ../kr.osm.pbf "$DIR/$p/kr.osm.pbf"
  osrm-extract -p "$PROFILES/$p.lua" "$DIR/$p/kr.osm.pbf"
  osrm-partition "$DIR/$p/kr"
  osrm-customize "$DIR/$p/kr"
done
echo "끝났어요. 계산할 때는 bash tools/osrm-start.sh 로 켜요."
