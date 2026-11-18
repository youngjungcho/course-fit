// 버스·지하철 타는 곳·내리는 곳 위치를 모아 regions/<지역 id>/stops.json 으로 써요 (지도에 정류장을 찍을 때 써요).
//   node tools/bus-stops.js aewol        # 한 지역
//   node tools/bus-stops.js all          # 대중교통 표가 있는 지역 모두
// 출처: 국토교통부 TAGO 버스노선정보·버스정류소정보 (.env의 DATA_GO_KR_KEY).
// 노선(번호)마다 지나는 정류장 목록을 받아서 이름이 같은 곳을 찾고, 여러 곳이면 그 정류장을 쓰는 장소에서 가장 가까운 곳을 골라요.
// 지하철역은 TAGO에 같은 이름의 버스 정류장이 있으면 그 위치를 써요 (역 입구 근처라 지도에서 위치를 보여 주는 데는 충분해요).
// 버스 표(busPlans)를 다시 만들면 이것도 다시 돌려요.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const key = fs.readFileSync(path.join(ROOT, ".env"), "utf8").match(/^DATA_GO_KR_KEY=(.*)$/m)[1].trim();
const CITY = { 제주: 39, 부산: 21 };
const DAY = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const REGIONS = new Function(fs.readFileSync(path.join(ROOT, "regions.js"), "utf8") + ";return REGIONS")();
const read = (f) => { const p = path.join(ROOT, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : ""; };
const km = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 111 * Math.cos(a.lat * Math.PI / 180));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tago = async (svc, op, q) => {
  const u = `https://apis.data.go.kr/1613000/${svc}/${op}?serviceKey=${encodeURIComponent(key)}&_type=json&numOfRows=1000&${new URLSearchParams(q)}`;
  for (let t = 0; t < 3; t++) {
    const j = await (await fetch(u)).json().catch(() => null);
    if (j?.response?.body) { let it = j.response.body.items?.item ?? []; return Array.isArray(it) ? it : [it]; }
    await sleep(600);
  }
  return [];
};
const baseName = (n) => String(n).replace(/\[.*?\]|\(.*?\)/g, "").trim();
const sameName = (a, b) => a === b || baseName(a) === baseName(b);
// 노선 번호 → 그 노선(갈래 포함)이 지나는 정류장 목록 [{name, lat, lng}]
const routeCache = {};
async function routeStops(city, no) {
  const k = `${city}:${no}`;
  if (routeCache[k]) return routeCache[k];
  const routes = (await tago("BusRouteInfoInqireService", "getRouteNoList", { cityCode: city, routeNo: no }))
    .filter((x) => String(x.routeno) === no || String(x.routeno).startsWith(no + "-") || String(x.routeno).startsWith(no + "("));
  const out = [];
  for (const rt of routes) {
    for (const x of await tago("BusRouteInfoInqireService", "getRouteAcctoThrghSttnList", { cityCode: city, routeId: rt.routeid }))
      if (+x.gpslati) out.push({ name: x.nodenm, lat: +x.gpslati, lng: +x.gpslong });
    await sleep(60);
  }
  return (routeCache[k] = out);
}
// 노선에서 못 찾으면(지하철역 등) 이름으로 찾아요
async function byName(city, name) {
  const items = await tago("BusSttnInfoInqireService", "getSttnNoList", { cityCode: city, nodeNm: baseName(name) });
  return items.filter((x) => sameName(x.nodenm, name)).map((x) => ({ lat: +x.gpslati, lng: +x.gpslong }));
}

async function run(r) {
  const city = CITY[r.area];
  if (!city) return console.log(`${r.id}: 대중교통 표가 없는 지역이에요`);
  const src = read(`regions/${r.id}/places.js`) + read(`regions/${r.id}/travel.js`) + read(`regions/${r.id}/transit.js`);
  const D = new Function(src + ";return { PLACES, STARTS, TRAVEL }")();
  const { TRAVEL } = D;
  if (!TRAVEL.busPlans) return console.log(`${r.id}: 버스 표(busPlans)가 없어요`);
  const where = Object.fromEntries([...D.PLACES, ...D.STARTS].map((p) => [p.id.startsWith("start:") ? p.id : p.id, p]));
  const placeAt = (i) => { const id = TRAVEL.ids[i]; return where[id.replace(/^start:/, "")]; };
  // 정류장 이름마다 그 정류장을 쓰는 장소들(가까운 곳을 고를 기준)
  const refs = {}, lines = {};
  const add = (name, p, no, w) => { if (!name) return; if (p?.lat) (refs[name] ??= []).push({ lat: p.lat, lng: p.lng, w: +w || 0 }); (lines[name] ??= new Set()).add(no); };
  for (const field of ["busPlan", "busWheelPlan"]) {
    const M = TRAVEL[field];
    if (!M) continue;
    M.forEach((row, i) => row.forEach((k, j) => {
      if (k === null || k === undefined || !TRAVEL.busPlans[k]) return;
      const c = TRAVEL.busPlans[k].split("|");
      const from = placeAt(i), to = placeAt(j);
      if (c.length === 5) { add(c[1], from, c[0], c[2]); add(c[3], to, c[0], c[4]); }
      else { add(c[1], from, c[0], c[2]); add(c[3], null, c[0]); add(c[5], null, c[4]); add(c[6], to, c[4], c[7]); } // 갈아타는 곳은 노선으로만 찾아요
    }));
  }
  const names = Object.keys(lines);
  const swFile = path.join(__dirname, "transit-data", r.area === "부산" ? "busan" : "jeju", "subway-stations.json");
  const SUBWAY = {};
  if (fs.existsSync(swFile)) for (const v of Object.values(JSON.parse(fs.readFileSync(swFile)))) if (v.lat != null && !v.guess) SUBWAY[v.name + "역"] = { lat: v.lat, lng: v.lng };
  const stops = {}, miss = [];
  for (const name of names) {
    let cand = [];
    for (const no of lines[name]) if (!/호선|경전철/.test(no)) cand.push(...(await routeStops(city, no)).filter((x) => sameName(x.name, name)));
    if (!cand.length && SUBWAY[name]) cand = [SUBWAY[name]]; // 지하철역: tools/transit-fetch.js가 모은 역 위치
    if (!cand.length) cand = await byName(city, name);
    if (!cand.length) { miss.push(name); continue; }
    // 쓰는 장소들과의 거리 평균이 가장 작은 곳. 갈아타는 곳만 쓰이는 정류장은 노선 위 첫 후보(같은 이름은 길 양쪽이라 몇십 m 차이)
    const best = refs[name]?.length ? cand.map((c) => ({ c, d: refs[name].reduce((s, p) => s + km(c, p), 0) / refs[name].length })).sort((a, b) => a.d - b.d)[0] : { c: cand[0], d: 0 };
    // 표에 적힌 걷는 시간(분)과 맞지 않게 먼 정류장은 빼요 (이름이 같은 다른 정류장일 수 있어요. 그 구간은 곧은 선으로 그려요)
    const tooFar = (refs[name] ?? []).some((p) => km(best.c, p) > Math.max(1.5, p.w * 0.12));
    if (best.d > 15 || tooFar) { miss.push(`${name}(위치가 걷는 시간과 안 맞음)`); continue; }
    stops[name] = [+best.c.lat.toFixed(5), +best.c.lng.toFixed(5)];
  }
  const out = { source: `국토교통부 TAGO 버스노선정보·버스정류소정보 (${DAY})`, stops };
  fs.writeFileSync(path.join(ROOT, `regions/${r.id}/stops.json`), JSON.stringify(out) + "\n");
  console.log(`${r.id}: 정류장 ${names.length}곳 중 ${Object.keys(stops).length}곳 위치 찾음${miss.length ? ` · 못 찾음 ${miss.length}: ${miss.slice(0, 8).join(", ")}${miss.length > 8 ? " …" : ""}` : ""}`);
}

(async () => {
  const arg = process.argv[2];
  if (!arg) { console.log("node tools/bus-stops.js <지역 id | all>"); process.exit(1); }
  const list = arg === "all" ? REGIONS.filter((r) => !r.noBus) : REGIONS.filter((r) => r.id === arg);
  if (!list.length) { console.log(`지역 ${arg}가 regions.js에 없어요`); process.exit(1); }
  for (const r of list) await run(r);
})();
