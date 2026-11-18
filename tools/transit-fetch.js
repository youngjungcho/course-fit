// 버스·지하철 표를 계산할 자료를 받아 tools/transit-data/<도시>/ 에 둬요 (git에는 안 올려요).
//   node tools/transit-fetch.js jeju     # 제주 버스 (30분쯤)
//   node tools/transit-fetch.js busan    # 부산 버스·지하철 (20분쯤)
// 받은 뒤에는 node tools/transit.js <지역 id> 로 표를 만들어요.
//
// 받는 것
//  - 국토교통부 TAGO 버스노선정보: 노선 목록, 노선별 지나는 정류장(순서·위치), 노선 정보(배차 간격)  ← .env의 DATA_GO_KR_KEY
//  - 제주: 제주버스정보시스템(bus.jeju.go.kr) 노선별 시간표 엑셀 → 낮(9~20시) 배차 간격 (TAGO에 간격이 없어서)
//          제주특별자치도 저상버스 운행노선 현황(공공데이터포털 파일, 2024-12-31) → 휠체어 코스용 노선
//  - 부산: 부산교통공사 역간 소요시간(B551542/distance), 역 위치는 OpenStreetMap
// 이미 받은 파일은 건너뛰어요. 새로 받고 싶으면 그 도시 폴더를 지우고 다시 돌려요.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CITY = { jeju: 39, busan: 21 };
const city = process.argv[2];
if (!CITY[city]) { console.error("사용법: node tools/transit-fetch.js <jeju|busan>"); process.exit(1); }
const DIR = path.join(__dirname, "transit-data", city);
for (const d of ["rstops", "rinfo"]) fs.mkdirSync(path.join(DIR, d), { recursive: true });
const key = fs.readFileSync(path.join(ROOT, ".env"), "utf8").match(/^DATA_GO_KR_KEY=(.*)$/m)[1].trim().replace(/"/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "swimpyo-course-builder/1.0 (static travel site)" };

async function getText(url, opt = {}) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(30000), ...opt }); if (r.ok) return await r.text(); } catch {}
    await sleep(1500);
  }
  return null;
}
async function getJson(url, opt) { const t = await getText(url, opt); try { return t ? JSON.parse(t) : null; } catch { return null; } }
// bus.jeju.go.kr는 인증서 묶음이 빠져 있어 Node fetch가 거절해요. 컴퓨터 인증서를 쓰는 curl로 받아요(검증은 그대로 해요).
const curl = (args) => { try { return execFileSync("curl", ["-s", "-m", "40", "-A", UA["User-Agent"], ...args], { maxBuffer: 64 << 20 }); } catch { return null; } };
const items = (j) => { const it = j?.response?.body?.items?.item ?? j?.body?.items?.item ?? []; return Array.isArray(it) ? it : [it]; };
const B = "https://apis.data.go.kr/1613000/BusRouteInfoInqireService";
const q = (o) => new URLSearchParams({ serviceKey: key, _type: "json", ...o });

async function tago() {
  const f = path.join(DIR, "routes.json");
  let routes = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : null;
  if (!routes) {
    routes = [];
    for (let p = 1; ; p++) {
      const j = await getJson(`${B}/getRouteNoList?${q({ cityCode: CITY[city], numOfRows: 500, pageNo: p })}`);
      if (!j) throw new Error("노선 목록을 못 받았어요 (TAGO)");
      const it = items(j); routes.push(...it);
      if (!it.length || routes.length >= j.response.body.totalCount) break;
    }
    fs.writeFileSync(f, JSON.stringify(routes));
  }
  console.log(`노선 ${routes.length}개`);
  let n = 0, fail = 0;
  const queue = [...routes];
  const work = async () => {
    for (let r; (r = queue.shift());) {
      for (const [dir, op, extra] of [["rinfo", "getRouteInfoIem", {}], ["rstops", "getRouteAcctoThrghSttnList", { numOfRows: 1000, pageNo: 1 }]]) {
        const out = path.join(DIR, dir, `${r.routeid}.json`);
        if (fs.existsSync(out)) continue;
        const j = await getJson(`${B}/${op}?${q({ cityCode: CITY[city], routeId: r.routeid, ...extra })}`);
        if (j?.response?.body) fs.writeFileSync(out, JSON.stringify(j)); else fail++;
        await sleep(40);
      }
      if (++n % 100 === 0) console.log(`  ${n}/${routes.length} (실패 ${fail})`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, work));
  console.log(`노선별 정류장·정보 끝 (실패 ${fail}${fail ? " — 다시 돌리면 실패한 것만 받아요" : ""})`);
}

async function jejuTimetable() {
  const xl = path.join(DIR, "jbis", "xl");
  fs.mkdirSync(xl, { recursive: true });
  const groups = [];
  for (let t = 0; t <= 9; t++) {
    let j = null;
    try { j = JSON.parse(curl(["-X", "POST", "-d", `GROUTE_TYPE=${t}`, "https://bus.jeju.go.kr/publicTrafficInformation/getBusRouteNum"]) ?? "null"); } catch {}
    if (Array.isArray(j)) for (const x of j) groups.push(x.GSCHEDULE_ID);
  }
  const ids = [...new Set(groups)];
  console.log(`제주 시간표 묶음 ${ids.length}개`);
  let got = 0;
  for (const id of ids) {
    const f = path.join(xl, `${id}.xlsx`);
    if (fs.existsSync(f) && fs.statSync(f).size > 2000) continue;
    const buf = curl([`https://bus.jeju.go.kr/data/schedule/downScheduleExcel?gscheduleId=${id}`]);
    if (buf && buf.length > 2000) { fs.writeFileSync(f, buf); got++; }
    await sleep(150);
  }
  console.log(`  시간표 엑셀 새로 받음 ${got}개`);
  // 엑셀 읽기는 파이썬 openpyxl로 해요 (이 폴더에 venv를 만들어 둬요)
  const venv = path.join(__dirname, "transit-data", "venv");
  const py = path.join(venv, "bin", "python");
  if (!fs.existsSync(py)) { execFileSync("python3", ["-m", "venv", venv]); execFileSync(path.join(venv, "bin", "pip"), ["-q", "install", "openpyxl"]); }
  execFileSync(py, ["-I", path.join(__dirname, "transit-jeju-intervals.py"), path.join(DIR, "jbis", "xl"), path.join(DIR, "intervals.json")], { stdio: "inherit" });
  // 저상버스 운행노선 현황 (공공데이터포털 파일데이터 15155485)
  const lf = path.join(DIR, "lowfloor.csv");
  if (!fs.existsSync(lf)) {
    const r = await fetch("https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000003549693&fileDetailSn=1&insertDataPrcus=N", { headers: UA });
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(lf, new TextDecoder("euc-kr").decode(buf));
  }
  console.log(`  저상버스 노선표: ${fs.readFileSync(lf, "utf8").trim().split("\n").length - 1}줄`);
}

async function busanSubway() {
  const f = path.join(DIR, "subway-distance.json");
  if (!fs.existsSync(f)) {
    const rows = [];
    for (let p = 1; ; p++) {
      const j = await getJson(`https://apis.data.go.kr/B551542/distance/getDistance?serviceKey=${encodeURIComponent(key)}&act=json&numOfRows=200&pageNo=${p}`);
      if (!j) throw new Error("지하철 역간 시간을 못 받았어요 (부산교통공사)");
      const it = items(j); rows.push(...it);
      if (!it.length || rows.length >= j.body.totalCount) break;
    }
    fs.writeFileSync(f, JSON.stringify(rows));
  }
  const rows = JSON.parse(fs.readFileSync(f));
  console.log(`지하철 역간 ${rows.length}줄`);
  // 역 위치: 후보를 모은 뒤(TAGO "○○역" 버스 정류장 + 되면 OpenStreetMap 역), 이름이 같은 역이 여러 곳이면(좌천: 1호선·동해선)
  // 옆 역과 가까운 쪽을 골라요. 끝까지 못 찾은 역은 같은 노선의 앞뒤 역 사이로 어림해요.
  const sf = path.join(DIR, "subway-stations.json");
  const name = {}, adj = {};
  for (const r of rows) {
    name[r.startSc] = r.startSn; name[r.endSc] = r.endSn;
    if (r.exchange !== "Y") { (adj[r.startSc] ??= new Set()).add(r.endSc); (adj[r.endSc] ??= new Set()).add(r.startSc); }
  }
  const dist = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 91);
  const cluster = (pts) => { const out = []; for (const p of pts) { const c = out.find((c) => dist(c, p) < 0.6); if (c) { c.n++; c.lat += (p.lat - c.lat) / c.n; c.lng += (p.lng - c.lng) / c.n; } else out.push({ ...p, n: 1 }); } return out; };
  const candFile = path.join(DIR, "subway-cands.json");
  const cands = fs.existsSync(candFile) ? JSON.parse(fs.readFileSync(candFile)) : {};
  let osm = null;
  if (Object.keys(cands).length < Object.keys(name).length) {
    const ql = `[out:json][timeout:60];node["railway"~"^(station|halt)$"](34.95,128.75,35.6,129.4);out;`;
    for (const host of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
      osm = await getJson(host, { method: "POST", headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(ql) });
      if (osm?.elements) break;
    }
    const norm = (x) => String(x ?? "").replace(/\(.*?\)|\s/g, "").replace(/역$/, "");
    for (const [c, n] of Object.entries(name)) {
      if (cands[c]) continue;
      const base = n.replace(/\(.*\)/, "").replace(/\s/g, "");
      const pts = [];
      for (const e of osm?.elements ?? []) if ([e.tags?.name, e.tags?.["name:ko"]].some((x) => x && norm(x) === norm(base))) pts.push({ lat: e.lat, lng: e.lon, src: "OSM" });
      const re = new RegExp(`(^|[(.·]|동해선|경전철)${base.replace(/[.]/g, "\\.")}역`);
      for (const cityCode of [21, 38070, 38100, 26]) { // 부산·김해·양산·울산
        for (const nodeNm of [base + "역", base]) {
          const j = await getJson(`https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList?${q({ cityCode, nodeNm, numOfRows: 100 })}`);
          for (const x of items(j)) {
            const nm = String(x.nodenm).replace(/\s/g, "");
            if (+x.gpslati && (re.test(nm) || (nodeNm === base && c.length === 3 && c[0] === "9" && nm === base))) pts.push({ lat: +x.gpslati, lng: +x.gpslong, src: "TAGO 정류장" });
          }
          await sleep(60);
        }
      }
      cands[c] = cluster(pts);
    }
    fs.writeFileSync(candFile, JSON.stringify(cands));
  }
  const st = {};
  for (const c of Object.keys(name)) st[c] = { name: name[c], lat: null, lng: null };
  const fix = (c, p, src) => { st[c].lat = +p.lat.toFixed(6); st[c].lng = +p.lng.toFixed(6); st[c].src = src ?? p.src; };
  for (const [c, cs] of Object.entries(cands)) if (cs.length === 1) fix(c, cs[0]);
  for (let changed = true; changed;) {
    changed = false;
    for (const [c, cs] of Object.entries(cands)) {
      if (st[c].lat != null || cs.length < 2) continue;
      const nb = [...(adj[c] ?? [])].filter((x) => st[x].lat != null);
      if (!nb.length) continue;
      const best = cs.map((p) => ({ p, d: Math.min(...nb.map((x) => dist(p, st[x]))) })).sort((a, b) => a.d - b.d)[0];
      fix(c, best.p); changed = true;
    }
  }
  for (const [c, cs] of Object.entries(cands)) if (st[c].lat == null && cs.length) fix(c, cs.sort((a, b) => b.n - a.n)[0]);
  // 못 찾은 역: 같은 노선 앞뒤로 위치를 아는 역까지 가서, 역 수만큼 나눠 어림
  for (const c of Object.keys(st)) {
    if (st[c].lat != null) continue;
    const walk = (from, prev) => { const path2 = []; let cur = from, pv = prev; for (let k = 0; k < 10; k++) { const nx = [...(adj[cur] ?? [])].find((x) => x !== pv); if (!nx) return null; path2.push(nx); if (st[nx].lat != null && !st[nx].guess) return { at: nx, steps: path2.length }; pv = cur; cur = nx; } return null; };
    const sides = [...(adj[c] ?? [])].map((n0) => st[n0].lat != null && !st[n0].guess ? { at: n0, steps: 1 } : (() => { const w = walk(n0, c); return w && { at: w.at, steps: w.steps + 1 }; })()).filter(Boolean);
    if (sides.length >= 2) { const [a, b] = sides; const t = a.steps / (a.steps + b.steps); fix(c, { lat: st[a.at].lat + (st[b.at].lat - st[a.at].lat) * t, lng: st[a.at].lng + (st[b.at].lng - st[a.at].lng) * t }, "앞뒤 역 사이 어림"); st[c].guess = true; }
  }
  fs.writeFileSync(sf, JSON.stringify(st));
  const guessed = Object.entries(st).filter(([, v]) => v.guess).map(([, v]) => v.name);
  if (guessed.length) console.log(`  앞뒤 역 사이로 어림한 역 ${guessed.length}곳: ${guessed.join(", ")}`);
  const miss = Object.entries(st).filter(([, v]) => v.lat == null);
  console.log(`지하철역 ${Object.keys(st).length}곳 위치 (못 찾음 ${miss.length}${miss.length ? ": " + miss.map(([c, v]) => c + v.name).join(", ") : ""})`);
}

(async () => {
  await tago();
  if (city === "jeju") await jejuTimetable();
  if (city === "busan") await busanSubway();
  fs.writeFileSync(path.join(DIR, "FETCH_DATE"), new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + "\n");
  console.log("다 받았어요:", path.relative(ROOT, DIR));
})().catch((e) => { console.error(e.message); process.exit(1); });
