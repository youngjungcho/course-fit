# 지역 작업 도구

새 지역을 넣거나 장소를 고칠 때 쓰는 도구예요. 사이트(index.html)는 이 폴더를 쓰지 않아요.

| 파일 | 하는 일 |
|---|---|
| `osrm-setup.sh` | 이동 시간 계산기(OSRM)용 한국 지도 받기·만들기 (처음 한 번, 지도를 새로 받을 때) |
| `osrm-start.sh` | 계산기 켜기 / `stop`으로 끄기 (차 5001 · 걷기 5002 · 자전거 5003) |
| `travel.js` | 장소끼리 차·걷기·자전거 시간과 차 거리를 계산해 `regions/<지역>/travel.js`를 써요 |
| `lint-places.js` | 장소 자료가 칸 규칙을 지키는지, regions.js·travel.js와 맞는지 검사 |
| `check.js` | 조건을 바꿔 가며 코스를 짜 보고 규칙(운영시간·쉬는 날·조건·예산·시간)을 어긴 코스가 있는지 검사 |
| `places-template.js` | 새 지역 places.js 틀 |

지도 자료는 `tools/osrm-data/`에 두고 git에는 올리지 않아요 (받은 지도 290MB + 만든 자료 합쳐 약 8GB).

## 처음 한 번

```bash
brew install osrm-backend
```

```bash
bash tools/osrm-setup.sh
```

## 새 지역 넣는 순서

1. **지역 설정** — `regions.js`의 `REGIONS`에 한 줄 더해요.
   - 같은 시·도가 이미 있으면 그 묶음(`JEJU_AREA` 등)을 쓰고, 없으면 새로 만들어요: `area`, `sun`(일몰 기준 위치), `bounds`("지금 내 위치" 범위), `hub`(대표 역·공항), 택시 요금(`taxiBase`, `taxiMeter`, `taxiFarKm`) — 요금은 출처를 주석으로.
   - 버스 자료가 없으면 `noBus: true`와 `busNote`. 바다로 해가 지지 않으면 `noSeaSunset: true`.
   - 큰 도시는 `zones`(구역, 장소의 `zone` 칸과 맞춤)와 구역별 `count`.
   - `count`는 장소 수. 장소를 더하거나 빼면 같이 고쳐요.
2. **장소 모으기** — `tools/places-template.js`를 `regions/<지역 id>/places.js`로 복사해서 채워요.
   - 목표는 50곳 이상, 식당·카페·볼거리·공원이 고르게. 30곳 이하면 코스가 비거나 매번 같아져요.
   - 운영시간·시설은 카카오맵 장소 페이지 → 한국관광공사 API 순서. 모르는 건 null.
   - 후기 값은 서로 다른 글 2건 이상이 같을 때만, 최근 2년 글만. 휠체어는 후기로 채우지 않아요.
3. **검사** — 오류가 0이 될 때까지 고쳐요.
   ```bash
   node tools/lint-places.js <지역 id>
   ```
4. **이동 시간표** — 계산기를 켜고 표를 만들어요. 장소를 더하거나 위치를 고칠 때마다 다시 해요.
   ```bash
   bash tools/osrm-start.sh
   ```
   ```bash
   node tools/travel.js <지역 id>
   ```
   "가장 가까운 길에서 ○m 떨어져 있어요"가 나오면 그 장소 위치를 확인해요.
5. **코스 검사** — 동행마다 돌려서 "규칙 위반 0"을 확인해요. 빈 코스가 많은 동행은 그 조건이 확인된 장소가 부족하다는 뜻이에요.
   ```bash
   REGION=<지역 id> node tools/check.js
   ```
6. **화면 확인** — `index.html`의 `REGION_VERSION`과 `sw.js`의 `VERSION`을 같은 값으로 올리고, 로컬에서 지역 고르기 → 결과 화면까지 눌러 봐요.
7. 커밋하고 올려요. `sitemap.xml`은 지역별 페이지를 만들면 그때 더해요.

## 대중교통

- 지금 도구는 차·걷기·자전거만 만들어요. 버스·지하철 표(제주 `bus…` 칸, 부산 `transit.js`)를 만들던 스크립트는 저장소에 없어요.
- 그래서 `travel.js`는 대중교통 표가 있는 지역(제주 8곳·부산)은 덮어쓰지 않고 멈춰요. 그 지역 장소를 바꾸려면 대중교통 표까지 다시 계산하는 도구를 먼저 만들어야 해요.
  비교만 하려면 `--out` 으로 다른 곳에 써요.
- 새 지역은 처음엔 강릉처럼 `noBus: true`(차·택시로 다니는 곳)로 시작하는 걸 권해요.
