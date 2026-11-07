// 장소끼리 이동 시간표 만들기: regions/<지역>/places.js의 출발지(STARTS)와 장소(PLACES)로
// 차·걷기·자전거 시간(분)과 차 거리(km)를 OSRM으로 계산해 regions/<지역>/travel.js를 새로 써요.
//
//   bash tools/osrm-start.sh                        # 계산기 켜기 (먼저)
//   node tools/travel.js gangneung                  # regions/gangneung/travel.js 새로 쓰기
//   node tools/travel.js gangneung --out /tmp/t.js  # 다른 곳에 쓰기 (비교용)
//
// 버스·지하철 칸(bus…, transit.js)은 만들지 않아요. 그 칸이 있는 지역(제주·부산)에서 장소를 바꾸면
// 대중교통 표도 다시 계산해야 해요 — 이 스크립트는 그런 지역이면 멈춰요(--force로 무시).
// 장소를 더하거나 빼거나 위치를 고치면 꼭 다시 돌려요(표의 줄·칸 순서가 장소 순서와 같아야 해요).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const region = args.find((a) => !a.startsWith("--"));
const outAt = args.indexOf("--out");
const force = args.includes("--force");
if (!region) { console.error("사용법: node tools/travel.js <지역 id> [--out 파일] [--force]"); process.exit(1); }

const regionDir = path.join(ROOT, "regions", region);
const placesFile = path.join(regionDir, "places.js");
const travelFile = outAt >= 0 ? path.resolve(args[outAt + 1]) : path.join(regionDir, "travel.js");
if (!fs.existsSync(placesFile)) { console.error(`${placesFile} 가 없어요.`); process.exit(1); }

const { PLACES, STARTS } = new Function(fs.readFileSync(placesFile, "utf8") + ";return { PLACES, STARTS };")();

// 대중교통 표가 있는 지역은 버스 칸이 장소 순서와 어긋나지 않게 확인해요
const oldTravel = path.join(regionDir, "travel.js");
if (!force && outAt < 0 && fs.existsSync(oldTravel)) {
  const t = fs.readFileSync(oldTravel, "utf8");
  if (/\bbus\s*:/.test(t) || fs.existsSync(path.join(regionDir, "transit.js"))) {
    console.error("이 지역은 버스·지하철 표가 있어요. 이 스크립트로 다시 쓰면 대중교통 표와 장소 순서가 어긋날 수 있어요.");
    console.error("대중교통까지 다시 계산할 게 아니면 --out으로 다른 곳에 써서 비교만 하세요. (무시하려면 --force)");
    process.exit(1);
  }
}

// 위치(lat·lng)가 없는 장소는 코스에 안 나와서 표에서도 빼요
const noPos = PLACES.filter((p) => typeof p.lat !== "number" || typeof p.lng !== "number");
if (noPos.length) console.warn(`위치가 없어 빼는 곳: ${noPos.map((p) => p.id).join(", ")}`);
const pts = [...STARTS.map((s) => ({ id: `start:${s.id}`, lat: s.lat, lng: s.lng })), ...PLACES.filter((p) => !noPos.includes(p)).map((p) => ({ id: p.id, lat: p.lat, lng: p.lng }))];
const dup = pts.map((p) => p.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dup.length) { console.error("id가 겹쳐요:", dup.join(", ")); process.exit(1); }
const bad = pts.filter((p) => typeof p.lat !== "number" || typeof p.lng !== "number");
if (bad.length) { console.error("출발지 위치(lat·lng)가 없어요:", bad.map((p) => p.id).join(", ")); process.exit(1); }

const PORTS = { car: 5001, foot: 5002, bicycle: 5003 };
async function table(profile, withDistance) {
  const coords = pts.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `http://localhost:${PORTS[profile]}/table/v1/${profile}/${coords}?annotations=${withDistance ? "duration,distance" : "duration"}`;
  let res;
  try { res = await fetch(url); } catch { throw new Error(`OSRM(${profile}, ${PORTS[profile]})에 연결이 안 돼요. bash tools/osrm-start.sh 로 켜 주세요.`); }
  const j = await res.json();
  if (j.code !== "Ok") throw new Error(`OSRM ${profile}: ${j.code} ${j.message ?? ""}`);
  // 길에 붙이지 못한 장소(200m 넘게 떨어짐)는 위치가 틀렸을 수 있어요
  j.sources.forEach((s, i) => { if (s.distance > 200) console.warn(`  주의(${profile}): ${pts[i].id}가 가장 가까운 길에서 ${Math.round(s.distance)}m 떨어져 있어요. 넓은 공원이 아니면 위치를 확인해 주세요.`); });
  const nulls = [];
  j.durations.forEach((row, i) => row.forEach((v, k) => { if (v === null) nulls.push(`${pts[i].id}→${pts[k].id}`); }));
  if (nulls.length) throw new Error(`OSRM ${profile}: 길이 안 이어지는 곳이 있어요 (${nulls.slice(0, 5).join(", ")}${nulls.length > 5 ? " 외" : ""})`);
  return j;
}

const min = (m) => m.map((row) => row.map((s) => Math.ceil(s / 60))); // 분은 올림 (1분 안 걸리는 곳도 1분)
const km = (m) => m.map((row) => row.map((d) => Math.round(d / 100) / 10));
const rows = (m) => "[" + m.map((r) => JSON.stringify(r)).join(",\n") + "]";

(async () => {
  const car = await table("car", true), foot = await table("foot"), bike = await table("bicycle");
  const mapDateFile = path.join(__dirname, "osrm-data", "MAP_DATE");
  const mapDate = fs.existsSync(mapDateFile) ? fs.readFileSync(mapDateFile, "utf8").trim() : "날짜 모름";
  const today = new Date().toISOString().slice(0, 10);
  const out = `// 장소끼리 이동 시간표 (분). ${today} OSRM(내 컴퓨터, ${mapDate} 지도 자료)으로 계산했어요. tools/travel.js로 만들었어요.
// 길 데이터: © OpenStreetMap contributors (ODbL) · 계산: OSRM (Open Source Routing Machine)
// 막히는 길(실시간 교통)은 반영되지 않아요.
// 장소가 바뀌면 다시 계산해야 해요: node tools/travel.js ${region}
const TRAVEL = {
  ids: ${JSON.stringify(pts.map((p) => p.id))},
  car: ${rows(min(car.durations))},
  walk: ${rows(min(foot.durations))},
  bike: ${rows(min(bike.durations))},
  carKm: ${rows(km(car.distances))}
};
`;
  fs.writeFileSync(travelFile, out);
  console.log(`${path.relative(ROOT, travelFile)} 를 썼어요: ${pts.length}곳 (출발지 ${STARTS.length} + 장소 ${pts.length - STARTS.length}), ${Math.round(out.length / 1024)}KB`);
})().catch((e) => { console.error(e.message); process.exit(1); });
