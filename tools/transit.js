// 버스·지하철 표 만들기: 장소끼리 대중교통으로 몇 분 걸리는지, 몇 번을 어디서 타고 내리는지.
//   node tools/transit.js aewol            # 제주 지역 하나 (travel.js의 bus… 칸을 새로 써요)
//   node tools/transit.js busan            # 부산 (transit.js를 새로 써요)
//   node tools/transit.js all              # 대중교통 지역 모두
//   node tools/transit.js aewol --compare  # 쓰지 않고 지금 표와 비교만
// 먼저 node tools/transit-fetch.js <jeju|busan> 으로 자료를 받아 두세요.
// 장소 순서(ids)는 travel.js와 같아야 해요: 장소를 더하거나 뺐으면 node tools/travel.js <지역> 을 먼저 돌려요.
//
// 계산 방법 (2026-10 처음 만든 방법 그대로)
//   걷기(정류장까지) + 기다리기(배차 간격의 절반) + 타기 + 걷기(정류장에서). 바로 가는 버스, 없으면 1번 갈아타기.
//   걷는 길 = 직선거리 × 1.3, 시속 4.5km, 정류장은 1.2km 안. 갈아탈 때는 150m(부산 250m) 안 정류장까지 걸어요.
//   갈아타기는 바로 가는 것보다 5분 넘게 빨라야 써요(짐·헤매는 시간).
//   제주 버스: 정류장 사이 직선거리 합 ÷ 시속 30km (시간표의 102번 공항→애월 약 37분에 맞춘 값), 배차는 시간표의 낮(9~20시) 간격.
//   부산 버스: 시속 20km(도심), 배차는 TAGO 노선 정보의 간격. 지하철은 부산교통공사 역간 시간(이동+정차), 타러 가는 3분 더해요.
//   휠체어(제주만): 저상버스가 있는 노선만, 시속 3km로 걷고 정류장은 600m 안, 저상버스는 일부라 배차 간격만큼 기다려요, 갈아타기 부담 10분.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const compare = args.includes("--compare");
const target = args.find((a) => !a.startsWith("--"));
if (!target) { console.error("사용법: node tools/transit.js <지역 id | all> [--compare]"); process.exit(1); }
const REGIONS = new Function(fs.readFileSync(path.join(ROOT, "regions.js"), "utf8") + ";return REGIONS")();
const CITY_OF = (r) => (r.area === "제주" ? "jeju" : r.area === "부산" ? "busan" : null);
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

function km(a, b) {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------- 도시 자료 읽기 (노선·정류장) ----------
const cityCache = {};
function loadCity(city) {
  if (cityCache[city]) return cityCache[city];
  const DIR = path.join(__dirname, "transit-data", city);
  if (!fs.existsSync(path.join(DIR, "routes.json"))) throw new Error(`자료가 없어요. 먼저: node tools/transit-fetch.js ${city}`);
  const P = city === "jeju"
    ? { BUS_KMH: 30, XFER_M: 150, DEFAULT_INTERVAL: 60 }
    : { BUS_KMH: 20, XFER_M: 250, DEFAULT_INTERVAL: 20 };
  const INTERVALS = city === "jeju" ? JSON.parse(fs.readFileSync(path.join(DIR, "intervals.json"))) : null;
  const LOW_FLOOR = new Set(city === "jeju"
    ? fs.readFileSync(path.join(DIR, "lowfloor.csv"), "utf8").trim().split("\n").slice(1).map((l) => l.split(",")).filter((c) => Number(c[1]) > 0).flatMap((c) => c[0].split("+").map((x) => x.trim()))
    : []);
  const stops = {}, routes = [];
  let noInterval = 0, skipped = 0;
  for (const f of fs.readdirSync(path.join(DIR, "rstops"))) {
    let items, info;
    try {
      items = JSON.parse(fs.readFileSync(path.join(DIR, "rstops", f))).response.body.items.item;
      info = JSON.parse(fs.readFileSync(path.join(DIR, "rinfo", f))).response.body.items.item;
    } catch { continue; }
    if (!items) continue;
    if (!Array.isArray(items)) items = [items];
    items.sort((a, b) => a.nodeord - b.nodeord);
    const seq = [], cum = [0];
    for (const s of items) {
      if (!+s.gpslati) continue;
      stops[s.nodeid] ??= { lat: +s.gpslati, lng: +s.gpslong, name: s.nodenm };
      if (seq.length) cum.push(cum[cum.length - 1] + km(stops[seq[seq.length - 1]], stops[s.nodeid]) / P.BUS_KMH * 60);
      seq.push(s.nodeid);
    }
    if (seq.length < 2) continue;
    let no, interval;
    if (city === "jeju") {
      no = String(info?.routeno ?? "");
      if (INTERVALS[no] === null) { skipped++; continue; } // 낮에 안 다니는 노선
      interval = INTERVALS[no];
      if (interval === undefined) { interval = P.DEFAULT_INTERVAL; noInterval++; }
    } else {
      no = String(info?.routeno ?? "").replace(/\(.*\)/, "");
      interval = Number(info?.intervaltime);
      if (!interval) { interval = P.DEFAULT_INTERVAL; noInterval++; }
    }
    routes.push({ id: f.replace(".json", ""), no, interval, seq, cum, board: 0, low: LOW_FLOOR.has(no) });
  }
  // 부산 지하철: 호선을 노선처럼 넣어요
  const xferSub = [];
  if (city === "busan") {
    const SR = JSON.parse(fs.readFileSync(path.join(DIR, "subway-distance.json")));
    const SW = JSON.parse(fs.readFileSync(path.join(DIR, "subway-stations.json")));
    const line = (c) => c[0] === "8" ? "동해선" : c.length === 3 && c[0] === "9" ? "경전철" : c.length === 3 && "234".includes(c[0]) ? c[0] + "호선" : "1호선";
    const SUB_INT = { "1호선": 6, "2호선": 6, "3호선": 8, "4호선": 10, "동해선": 25, "경전철": 8 };
    const adj = {};
    for (const r of SR) {
      if (r.exchange === "Y") { xferSub.push(["S" + r.startSc, "S" + r.endSc, Number(r.time) / 60]); continue; }
      (adj[r.startSc] ??= []).push([r.endSc, (Number(r.time) + Number(r.stoppingTime)) / 60]);
    }
    for (const [c, v] of Object.entries(SW)) if (v.lat != null) stops["S" + c] = { lat: v.lat, lng: v.lng, name: v.name + "역" };
    for (const ln of Object.keys(SUB_INT)) {
      const cs = Object.keys(adj).filter((c) => line(c) === ln && stops["S" + c]);
      const ends = cs.filter((c) => adj[c].filter(([x]) => stops["S" + x]).length === 1);
      for (const e of ends) {
        const seq = [e], cum = [0], seen = new Set([e]);
        for (let cur = e; ;) { const nx = (adj[cur] ?? []).find(([c]) => !seen.has(c) && stops["S" + c]); if (!nx) break; seen.add(nx[0]); seq.push(nx[0]); cum.push(cum[cum.length - 1] + nx[1]); cur = nx[0]; }
        if (seq.length > 1) routes.push({ id: ln + e, no: ln, interval: SUB_INT[ln], seq: seq.map((c) => "S" + c), cum, board: 3, low: false });
      }
    }
  }
  const stopIds = Object.keys(stops);
  const byStop = {};
  routes.forEach((r, ri) => r.seq.forEach((s, k) => (byStop[s] ??= []).push([ri, k])));
  // 갈아탈 수 있는 가까운 정류장
  const near = {}, grid = {};
  const cell = (p) => `${Math.floor(p.lat * 200)},${Math.floor(p.lng * 200)}`;
  for (const s of stopIds) { near[s] = []; (grid[cell(stops[s])] ??= []).push(s); }
  for (const a of stopIds) {
    const p = stops[a], gy = Math.floor(p.lat * 200), gx = Math.floor(p.lng * 200);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      for (const b of grid[`${gy + dy},${gx + dx}`] || []) { const d = km(p, stops[b]) * 1000; if (d <= P.XFER_M) near[a].push([b, d]); }
  }
  for (const [a, b, m] of xferSub) if (near[a]) near[a].push([b, null, m]);
  const date = fs.existsSync(path.join(DIR, "FETCH_DATE")) ? fs.readFileSync(path.join(DIR, "FETCH_DATE"), "utf8").trim() : "날짜 모름";
  console.log(`${city}: 노선 ${routes.length}개 (배차 간격 모름 ${noInterval}${skipped ? `, 낮에 안 다녀서 뺌 ${skipped}` : ""}), 정류장 ${stopIds.length}곳, 자료 ${date}`);
  return (cityCache[city] = { city, stops, stopIds, routes, byStop, near, date });
}

// ---------- 표 계산 ----------
function compute(C, pts, wheel) {
  const ROAD = 1.3, WALK_KMH = wheel ? 3 : 4.5, MAX_WALK_M = wheel ? 600 : 1200, WAIT_SHARE = wheel ? 1 : 0.5, XFER_EXTRA = wheel ? 10 : 5;
  const walkMin = (a, b) => km(a, b) * ROAD / WALK_KMH * 60;
  const { stops, stopIds, routes, byStop, near } = C;
  const usable = routes.map((r) => !wheel || r.low);
  const ride = (start) => {
    const best = {};
    for (const [s, t0] of Object.entries(start))
      for (const [ri, k] of byStop[s] || []) {
        if (!usable[ri]) continue;
        const r = routes[ri], t = t0 + r.interval * WAIT_SHARE + r.board;
        for (let j = k + 1; j < r.seq.length; j++) {
          const arr = t + r.cum[j] - r.cum[k], x = r.seq[j];
          if (!best[x] || arr < best[x].t) best[x] = { t: arr, r: ri, from: s };
        }
      }
    return best;
  };
  const nearStops = pts.map((p) => stopIds.map((s) => [s, walkMin(p, stops[s]), km(p, stops[s]) * 1000]).filter(([, , d]) => d <= MAX_WALK_M));
  const nm = (id) => stops[id].name.replace(/\[.\]$/, "");
  const xferWalk = (a, b, d, m) => m ?? (d * ROAD / 1000 / WALK_KMH * 60);
  const bus = [], how = [], plan = [];
  for (let i = 0; i < pts.length; i++) {
    const start = {};
    for (const [s, w] of nearStops[i]) start[s] = Math.min(start[s] ?? Infinity, w);
    const one = ride(start);
    const xs = {}, xfrom = {};
    for (const [s, v] of Object.entries(one))
      for (const [b, d, m] of near[s]) { const t = v.t + xferWalk(s, b, d, m); if (t < (xs[b] ?? Infinity)) { xs[b] = t; xfrom[b] = s; } }
    const two = ride(xs);
    const row = [], hrow = [], prow = [];
    for (let j = 0; j < pts.length; j++) {
      if (i === j) { row.push(0); hrow.push(""); prow.push(""); continue; }
      let b1 = Infinity, b2 = Infinity, r1 = null, s1 = null, s2 = null, w1 = 0, w2 = 0;
      for (const [s, w] of nearStops[j]) {
        if (one[s] && one[s].t + w < b1) { b1 = one[s].t + w; r1 = routes[one[s].r].no; s1 = s; w1 = w; }
        if (two[s] && two[s].t + w < b2) { b2 = two[s].t + w; s2 = s; w2 = w; }
      }
      if (b2 + XFER_EXTRA < b1) {
        row.push(Math.ceil(b2 + XFER_EXTRA)); hrow.push("갈아타기");
        const y = two[s2].from, x = xfrom[y], first = one[x];
        prow.push([routes[first.r].no, nm(first.from), Math.ceil(start[first.from]), nm(x), routes[two[s2].r].no, nm(y), nm(s2), Math.ceil(w2)].join("|"));
      } else if (b1 < Infinity) {
        row.push(Math.ceil(b1)); hrow.push(r1);
        prow.push([r1, nm(one[s1].from), Math.ceil(start[one[s1].from]), nm(s1), Math.ceil(w1)].join("|"));
      } else { row.push(null); hrow.push(""); prow.push(""); }
    }
    bus.push(row); how.push(hrow); plan.push(prow);
  }
  return { bus, how, plan };
}

// ---------- 지역 하나 ----------
function readRegion(r) {
  const dir = path.join(ROOT, "regions", r.id);
  const travelSrc = fs.readFileSync(path.join(dir, "travel.js"), "utf8");
  const transitFile = path.join(dir, "transit.js");
  const D = new Function(fs.readFileSync(path.join(dir, "places.js"), "utf8") + travelSrc + (fs.existsSync(transitFile) ? fs.readFileSync(transitFile, "utf8") : "") + ";return { PLACES, STARTS, TRAVEL }")();
  return { dir, travelSrc, transitFile, ...D };
}
const rows = (m) => "[\n" + m.map((r) => "    " + JSON.stringify(r)).join(",\n") + "\n  ]";
// 지금 표와 얼마나 같은지
function diff(oldM, newM) {
  if (!oldM) return "지금 표 없음";
  let same = 0, near5 = 0, n = 0, nullChange = 0;
  oldM.forEach((row, i) => row.forEach((v, j) => {
    if (i === j) return;
    const w = newM[i][j];
    if (v === null || w === null) { if (v !== w) nullChange++; return; }
    n++; if (v === w) same++; if (Math.abs(v - w) <= 5) near5++;
  }));
  return `같은 칸 ${Math.round(same / n * 100)}% · 5분 안 ${Math.round(near5 / n * 100)}% · 갈 수 있음/없음 바뀜 ${nullChange}칸`;
}

function run(r) {
  const city = CITY_OF(r);
  if (!city || r.noBus) return console.log(`${r.id}: 대중교통 표를 만들지 않는 지역이에요`);
  const C = loadCity(city);
  const R = readRegion(r);
  const where = Object.fromEntries([...R.STARTS.map((s) => ["start:" + s.id, s]), ...R.PLACES.map((p) => [p.id, p])]);
  const missing = R.TRAVEL.ids.filter((id) => !where[id]);
  const extra = Object.keys(where).filter((id) => where[id].lat != null && !R.TRAVEL.ids.includes(id));
  if (missing.length || extra.length) throw new Error(`${r.id}: travel.js 장소 순서가 places.js와 달라요. 먼저 node tools/travel.js ${r.id}`);
  const pts = R.TRAVEL.ids.map((id) => ({ id, lat: where[id].lat, lng: where[id].lng }));
  const t0 = Date.now();
  const B = compute(C, pts, false);
  const W = city === "jeju" ? compute(C, pts, true) : null;
  const plans = [""], idx = new Map([["", 0]]);
  const enc = (m) => m.map((rw) => rw.map((p) => { if (!p) return null; if (!idx.has(p)) { idx.set(p, plans.length); plans.push(p); } return idx.get(p); }));
  const bp = enc(B.plan), wp = W ? enc(W.plan) : null;
  console.log(`${r.id}: ${pts.length}곳 계산 ${Math.round((Date.now() - t0) / 1000)}초 · 버스 ${diff(R.TRAVEL.bus, B.bus)}${W ? ` · 휠체어 ${diff(R.TRAVEL.busWheel, W.bus)}` : ""}`);
  if (compare) return;
  if (city === "jeju") {
    // travel.js에서 bus… 칸만 바꿔요 (차·걷기·자전거는 그대로)
    let src = R.travelSrc;
    const cut = src.search(/,\s*\n\s*bus\s*:/);
    if (cut > 0) src = src.slice(0, cut) + "\n};\n";
    src = src.replace(/\n\};\s*$/, `,\n  bus: ${rows(B.bus)},\n  busNo: ${rows(B.how)},\n  busWheel: ${rows(W.bus)},\n  busWheelNo: ${rows(W.how)},\n  busPlan: ${rows(bp)},\n  busWheelPlan: ${rows(wp)},\n  busPlans: ${JSON.stringify(plans)}\n};\n`);
    src = src.replace(/^\/\/ 버스:.*\n(\/\/ {2,}.*\n)*/m, "");
    src = src.replace(/(const TRAVEL = \{)/, `// 버스: 국토교통부 TAGO 노선·정류장 + 제주버스정보시스템 시간표(낮 9~20시 배차 간격)로 ${today} 계산했어요 (자료 ${C.date}). tools/transit.js
//   정류장까지 걷기(1.2km 안) + 기다리기(배차 간격의 절반) + 타기 + 걷기. 바로 가는 버스, 없으면 1번 갈아타기.
//   실시간 도착 정보가 아니라 평균이에요. 칸 설명은 regions/aewol/travel.js 맨 위를 보세요.
$1`);
    fs.writeFileSync(path.join(R.dir, "travel.js"), src);
  } else {
    const head = `// 대중교통: 국토교통부 TAGO 노선·정류장·배차 간격 + 부산교통공사 역간 소요시간으로 ${today} 계산한 평균이에요 (자료 ${C.date}, 역 위치 © OpenStreetMap contributors). tools/transit.js
// 지하철 배차 간격과 버스 속도(시속 20km)는 어림값이에요. 저상버스 자료는 없어 휠체어 칸은 만들지 않았어요.
// 뚜벅이를 고를 때만 불러와요 (regions.js의 splitTransit). 칸 설명은 regions/aewol/travel.js 맨 위를 보세요.
`;
    fs.writeFileSync(R.transitFile, head + `Object.assign(TRAVEL, {\n  bus: ${rows(B.bus)},\n  busNo: ${rows(B.how)},\n  busPlan: ${rows(bp)},\n  busPlans: ${JSON.stringify(plans)}\n});\n`);
  }
  console.log(`${r.id}: 썼어요 (경로 ${plans.length - 1}가지). 정류장 지도도 다시: node tools/bus-stops.js ${r.id}`);
}

const list = target === "all" ? REGIONS.filter((r) => CITY_OF(r) && !r.noBus) : REGIONS.filter((r) => r.id === target);
if (!list.length) { console.error(`지역 ${target}가 regions.js에 없어요`); process.exit(1); }
try { for (const r of list) run(r); } catch (e) { console.error(e.message); process.exit(1); }
