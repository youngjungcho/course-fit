// 장소 자료 검사: regions/<지역>/places.js가 칸 규칙을 지키는지, regions.js·travel.js와 맞는지 봐요.
//   node tools/lint-places.js gangneung     # 한 지역
//   node tools/lint-places.js               # 모든 지역
// "오류"는 꼭 고쳐야 하고(화면이 틀리거나 깨져요), "주의"는 확인해 볼 것, 마지막 줄은 빈 칸(null) 비율이에요.
// 칸 설명은 regions/aewol/places.js 맨 위를 보세요.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const REGIONS = new Function(read("regions.js") + ";return REGIONS;")();

const TYPES = ["식당", "카페", "볼거리", "공원", "쇼핑"];
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const REQUIRED = ["id", "name", "type", "desc", "stayMin", "cost", "open", "close", "closedDays", "lat", "lng", "dog", "stroller", "stepFree", "solo", "station", "bikeRack", "evChargerMin", "parking", "kakaoId", "note", "sources"];
const TRI = ["dog", "stroller", "stepFree", "solo", "bikeRack", "parking"]; // true / false / null
const OPTIONAL = ["lastOrder", "hoursByDay", "beachSeason", "seasonalHours", "breaks", "dogRule", "forDogs", "dogReview", "strollerReview", "indoor", "zone"];
const isTime = (v) => typeof v === "string" && /^([01]\d|2[0-4]):[0-5]\d$/.test(v);
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

function lint(r) {
  const errs = [], warns = [];
  const dir = `regions/${r.id}`;
  if (!fs.existsSync(path.join(ROOT, dir, "places.js"))) return { errs: [`${dir}/places.js 가 없어요`], warns, nulls: "" };
  const D = new Function(read(`${dir}/places.js`) + ";return { PLACES, STARTS, COASTLINE: typeof COASTLINE !== 'undefined' ? COASTLINE : null };")();
  const { PLACES, STARTS } = D;
  const E = (p, m) => errs.push(`${p ? p.id ?? p.name : "-"}: ${m}`), W = (p, m) => warns.push(`${p ? p.id : "-"}: ${m}`);
  const b = r.bounds, inside = (o) => o.lat >= b.latMin && o.lat <= b.latMax && o.lng >= b.lngMin && o.lng <= b.lngMax;

  // 지역 설정
  if (r.count !== PLACES.length) E(null, `regions.js count ${r.count} ≠ 장소 ${PLACES.length}곳`);
  if (!Array.isArray(D.COASTLINE) || D.COASTLINE.length !== 2 || D.COASTLINE.some((c) => !c.lat || !c.lng)) E(null, "COASTLINE은 해안선 양 끝 두 점이어야 해요 (바다/산 구분에 써요)");
  if (!STARTS.some((s) => s.id === "airport")) E(null, `STARTS에 id "airport"(대표 역·공항)가 없어요 — hub가 이걸 써요`);
  for (const h of r.extraHubs ?? []) if (!STARTS.some((s) => s.id === h.start)) E(null, `extraHubs ${h.id}의 출발지 ${h.start}가 STARTS에 없어요`);
  for (const s of STARTS) {
    for (const k of ["id", "emoji", "label", "name", "lat", "lng"]) if (s[k] == null) E(null, `출발지 ${s.id ?? "?"}에 ${k}가 없어요`);
    if (s.lat != null && !inside(s)) W(null, `출발지 ${s.id}가 지역 범위(bounds) 밖이에요`);
  }
  if (r.zones) {
    const zs = r.zones.map((z) => z.id);
    for (const z of r.zones) {
      const n = PLACES.filter((p) => p.zone === z.id).length;
      if (z.count !== n) E(null, `regions.js 구역 ${z.id} count ${z.count} ≠ 장소 ${n}곳`);
      for (const nz of z.near) if (!zs.includes(nz)) E(null, `구역 ${z.id}의 near에 없는 구역 ${nz}`);
    }
    PLACES.filter((p) => !zs.includes(p.zone)).forEach((p) => E(p, `zone "${p.zone}"가 regions.js 구역에 없어요`));
  }

  // 장소마다
  const ids = new Set(STARTS.map((s) => `start:${s.id}`));
  for (const p of PLACES) {
    for (const k of REQUIRED) if (!(k in p)) E(p, `${k} 칸이 없어요 (모르면 null)`);
    for (const k of Object.keys(p)) if (!REQUIRED.includes(k) && !OPTIONAL.includes(k)) W(p, `모르는 칸 ${k}`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id ?? "")) E(p, "id는 영어 소문자·숫자·-만 써요");
    if (ids.has(p.id)) E(p, "id가 겹쳐요"); ids.add(p.id);
    if (!TYPES.includes(p.type)) E(p, `type "${p.type}"는 ${TYPES.join("·")} 중 하나여야 해요`);
    if (!p.desc || p.desc.length > 40) W(p, `desc가 비었거나 길어요(${p.desc?.length ?? 0}자)`);
    if (!(Number.isInteger(p.stayMin) && p.stayMin >= 10 && p.stayMin <= 240)) E(p, `stayMin ${p.stayMin}이 이상해요`);
    if (!(p.cost === null || (Number.isInteger(p.cost) && p.cost >= 0))) E(p, `cost ${p.cost}는 0 이상 정수나 null`);
    for (const k of ["open", "close", "lastOrder"]) if (p[k] != null && !isTime(p[k])) E(p, `${k} "${p[k]}"는 "HH:MM"`);
    if ((p.open == null) !== (p.close == null)) E(p, "open과 close는 둘 다 있거나 둘 다 null");
    if (isTime(p.open) && isTime(p.close) && toMin(p.close) <= toMin(p.open)) W(p, `close ${p.close}가 open ${p.open}보다 빨라요 (자정 넘김이면 "24:00"으로)`);
    if (isTime(p.lastOrder) && isTime(p.close) && toMin(p.lastOrder) > toMin(p.close)) E(p, "lastOrder가 close보다 늦어요");
    if (p.lastOrder && !["식당", "카페"].includes(p.type)) W(p, "lastOrder는 식당·카페에만 써요");
    if (!(p.closedDays === null || (Array.isArray(p.closedDays) && p.closedDays.every((d) => DAYS.includes(d))))) E(p, `closedDays ${JSON.stringify(p.closedDays)}는 ["월"] 같은 요일 목록, 없으면 [], 모르면 null`);
    for (const [d, v] of Object.entries(p.hoursByDay ?? {})) if (!DAYS.includes(d) || !(v === null || (Array.isArray(v) && v.length === 2 && v.every(isTime)))) E(p, `hoursByDay ${d}가 이상해요`);
    for (const br of p.breaks ?? []) if (!(Array.isArray(br) && br.length === 2 && br.every(isTime) && toMin(br[0]) < toMin(br[1]))) E(p, `breaks ${JSON.stringify(br)}가 이상해요`);
    if (p.beachSeason && !(p.beachSeason.length === 2 && p.beachSeason.every((x) => /^\d\d-\d\d$/.test(x)))) E(p, "beachSeason은 [\"MM-DD\", \"MM-DD\"]");
    if (typeof p.lat !== "number" || typeof p.lng !== "number") W(p, "위치(lat·lng)가 없어서 코스에서 빠져요");
    else if (!inside(p)) E(p, `위치가 지역 범위(bounds) 밖이에요 (${p.lat}, ${p.lng})`);
    for (const k of TRI) if (![true, false, null].includes(p[k])) E(p, `${k}는 true/false/null`);
    if (p.forDogs && p.dog !== true) E(p, "forDogs면 dog가 true여야 해요");
    if (p.indoor && ["식당", "카페"].includes(p.type)) W(p, "indoor는 공원·볼거리에 써요 (식당·카페는 늘 실내로 봐요)");
    if (!(p.station === null || typeof p.station === "string")) E(p, `station은 "○○ 정류장 걸어서 N분" 같은 글이나 null`);
    if (!(p.evChargerMin === null || (Number.isInteger(p.evChargerMin) && p.evChargerMin >= 0))) E(p, "evChargerMin은 분(정수)이나 null");
    if (!(p.kakaoId === null || /^\d+$/.test(String(p.kakaoId)))) E(p, `kakaoId "${p.kakaoId}"는 숫자`);
    if (!Array.isArray(p.sources)) E(p, "sources는 목록이어야 해요");
    else if (!p.sources.length) W(p, "sources(정보를 찾은 곳)가 비었어요");
    if (/map\.naver\.com|naver\.me/.test((p.sources ?? []).join(" "))) W(p, "네이버 지도는 쓰지 않기로 했어요 (블로그 후기는 괜찮아요)");
  }
  // 가까이 붙은 같은 장소(위치 30m 안, 이름 비슷) — 겹쳐 넣었을 수 있어요
  for (let i = 0; i < PLACES.length; i++) for (let k = i + 1; k < PLACES.length; k++) {
    const a = PLACES[i], c = PLACES[k];
    if (a.lat == null || c.lat == null) continue;
    const m = Math.hypot((a.lat - c.lat) * 111000, (a.lng - c.lng) * 88000);
    if (m < 30 && a.type === c.type) W(a, `${c.id}와 ${Math.round(m)}m 거리예요 (같은 곳 아닌가요?)`);
  }

  // 이동 시간표에 장소가 다 있는지
  const tf = `${dir}/travel.js`;
  if (!fs.existsSync(path.join(ROOT, tf))) E(null, `${tf}가 없어요 — node tools/travel.js ${r.id}`);
  else {
    const T = new Function(read(tf) + ";return TRAVEL;")();
    const want = [...STARTS.map((s) => `start:${s.id}`), ...PLACES.filter((p) => typeof p.lat === "number").map((p) => p.id)]; // 위치 없는 곳은 표에 없어요
    if (JSON.stringify([...T.ids].sort()) !== JSON.stringify([...want].sort())) { // 화면은 id로 찾아서 순서는 달라도 돼요
      const miss = want.filter((x) => !T.ids.includes(x)), extra = T.ids.filter((x) => !want.includes(x));
      E(null, `travel.js 장소 목록이 places.js와 달라요${miss.length ? ` (표에 없음: ${miss.slice(0, 5).join(", ")})` : ""}${extra.length ? ` (표에만 있음: ${extra.slice(0, 5).join(", ")})` : ""} — 다시 계산하세요`);
    }
    for (const k of ["car", "walk", "bike", "carKm"]) if (!T[k] || T[k].length !== T.ids.length) E(null, `travel.js ${k} 표 크기가 안 맞아요`);
  }

  // 빈 칸 비율 (24시간·늘 여는 곳은 open이 null이어도 빈 칸이 아니라 따로 셀 수 없어서 그대로 세요)
  const pct = (k) => `${k} ${Math.round(PLACES.filter((p) => p[k] === null).length / PLACES.length * 100)}%`;
  const nulls = ["cost", "open", "closedDays", "dog", "stroller", "stepFree", "solo", "parking", "bikeRack"].map(pct).join(" · ");
  const byType = TYPES.map((t) => `${t} ${PLACES.filter((p) => p.type === t).length}`).join(" · ");
  return { errs, warns, nulls, byType, n: PLACES.length };
}

const only = process.argv[2];
const targets = only ? REGIONS.filter((r) => r.id === only) : REGIONS;
if (!targets.length) { console.error(`지역 ${only}가 regions.js에 없어요`); process.exit(1); }
let total = 0;
for (const r of targets) {
  const { errs, warns, nulls, byType, n } = lint(r);
  total += errs.length;
  console.log(`\n■ ${r.name} (${r.id}) 장소 ${n ?? "?"}곳 — 오류 ${errs.length}, 주의 ${warns.length}`);
  errs.forEach((e) => console.log("  오류 " + e));
  warns.slice(0, only ? 100 : 8).forEach((w) => console.log("  주의 " + w));
  if (!only && warns.length > 8) console.log(`  … 주의 ${warns.length - 8}개 더 (node tools/lint-places.js ${r.id})`);
  if (byType) console.log(`  종류: ${byType}`);
  if (nulls) console.log(`  빈 칸: ${nulls}`);
}
process.exit(total ? 1 : 0);
