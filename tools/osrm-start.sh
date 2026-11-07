#!/bin/bash
# 이동 시간 계산기(OSRM) 켜기/끄기. 차 5001, 걷기 5002, 자전거 5003 포트를 써요.
#   bash tools/osrm-start.sh        # 켜기 (이미 켜져 있으면 그대로)
#   bash tools/osrm-start.sh stop   # 끄기
set -euo pipefail
cd "$(dirname "$0")"
DIR=osrm-data

if [ "${1:-}" = "stop" ]; then
  pkill -f "osrm-routed.*$DIR" && echo "껐어요." || echo "켜진 게 없어요."
  exit 0
fi

port=5001
for p in car foot bicycle; do
  [ -f "$DIR/$p/kr.osrm.mldgr" ] || { echo "$p 자료가 없어요. 먼저 bash tools/osrm-setup.sh"; exit 1; }
  if curl -s "http://localhost:$port/" >/dev/null 2>&1; then
    echo "$p: 이미 켜져 있어요 ($port)"
  else
    nohup osrm-routed --algorithm mld --max-table-size 1000 -p $port "$DIR/$p/kr" > "$DIR/$p.log" 2>&1 &
    echo "$p: 켜는 중 ($port)"
  fi
  port=$((port + 1))
done
# 켜질 때까지 기다려요 (최대 1분)
for i in $(seq 1 60); do
  ok=0
  for port in 5001 5002 5003; do curl -s "http://localhost:$port/nearest/v1/x/126.98,37.57" | grep -q '"code":"Ok"' && ok=$((ok + 1)); done
  [ $ok -eq 3 ] && { echo "준비됐어요."; exit 0; }
  sleep 1
done
echo "1분 안에 안 켜졌어요. tools/osrm-data/*.log 를 확인해 주세요."; exit 1
