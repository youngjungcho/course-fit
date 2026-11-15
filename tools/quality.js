// 코스 품질 재기: 규칙은 지켜도 "좋은 코스"인지 숫자로 봐요. 고치기 전후를 비교할 때 써요.
//   REGION=aewol node tools/quality.js                      # 여러 조건으로 짜 보고 평균
//   REGION=aewol SHOW="dog,walk,aewol,2026-11-14,10:00,6,50000" node tools/quality.js   # 코스 하나 자세히 (다른 코스는 ALT=1)
// 재는 것
//   이동 비율   이동 시간 ÷ 전체 시간
//   돌아가기    지나간 길(직선 거리 합) ÷ 같은 장소를 가장 짧게 도는 길. 1.25 넘으면 "돌아가는 코스"로 셈
//   남는 시간   고른 시간에서 코스가 끝난 뒤 남는 분. 90분 넘으면 "많이 남음"
//   카페 2곳+   카페가 2곳 넘는 코스 비율 (쇼핑도 같이 봐요)
//   낮 노을     이름에 노을·선셋이 들어간 곳을 해 지기 2시간도 더 전에 들르는 코스 비율
//   비용 모름   비용이 null인 곳이 들어간 코스 비율
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..");
const read = (f) => fs.existsSync(`${dir}/${f}`) ? fs.readFileSync(`${dir}/${f}`, "utf8") : "";
const RG = process.env.REGION || "aewol";
const html = read("index.html");
const main = html.split("<script>").find((b) => b.includes("function applyRegion")).split("// ----- 시작 -----")[0];
const stub = `
const el = () => ({ style: {}, setAttribute() {}, querySelectorAll: () => [], addEventListener() {}, set onclick(v) {}, set textContent(v) {}, set innerHTML(v) {}, hidden: false });
const document = { getElementById: el, querySelector: el, querySelectorAll: () => [], createElement: el, head: { append() {} }, body: el() };
const window = { scrollTo() {}, addEventListener() {} }; const track = () => {}; const gtag = () => {}; const navigator = {};
const history = { pushState() {}, replaceState() {}, state: null }; const location = { search: "", pathname: "/" };
`;
const DATA = new Function(read(`regions/${RG}/places.js`) + read(`regions/${RG}/travel.js`) + read(`regions/${RG}/transit.js`) + ";return { PLACES, STARTS, COASTLINE, TRAVEL, INLAND_NORTH: typeof INLAND_NORTH !== \"undefined\" && INLAND_NORTH };")();
const T = new Function("DATA", read("regions.js") + stub + main +
  `;applyRegion(REGIONS.find((r) => r.id === ${JSON.stringify(RG)}), DATA);return { makeCourse, state, DEPART, toMin, airportBuffer, sunsetMin, startPoint, STARTS, PLACES };`)(DATA);

const km = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 111 * Math.cos(a.lat * Math.PI / 180));
const pathLen = (start, pts) => pts.reduce((sum, p, i) => sum + km(i ? pts[i - 1] : start, p), 0);
// 같은 장소를 가장 짧게 도는 길 (출발지에서 시작, 끝은 아무 데나). 장소가 8곳 이하라 전부 따져 봐요
function bestLen(start, pts) {
  let best = Infinity;
  const go = (from, left, sum) => {
    if (sum >= best) return;
    if (!left.length) { best = sum; return; }
    left.forEach((p, i) => go(p, left.filter((_, k) => k !== i), sum + km(from, p)));
  };
  go(start, pts, 0);
  return best;
}
const SUNSET_NAME = /노을|일몰|선셋|썬셋/;

function measure(r, s) {
  const stops = r.stops;
  if (!stops.length) return null;
  const start = T.startPoint(), pts = stops.map((x) => x.place);
  const moving = stops.reduce((a, x) => a + x.move.min, 0) + (r.back?.min ?? 0);
  const total = r.finish - T.toMin(s.depart);
  const best = bestLen(start, pts), len = pathLen(start, pts);
  const limit = T.toMin(s.depart) + s.hours * 60 - T.airportBuffer();
  const sunset = T.sunsetMin(s.date);
  return {
    moving: moving / Math.max(total, 1),
    detour: best > 0.3 ? len / best : 1,
    left: limit - r.finish,
    cafes: pts.filter((p) => p.type === "카페").length,
    shops: pts.filter((p) => p.type === "쇼핑").length,
    daySunset: stops.some((x) => SUNSET_NAME.test(x.place.name) && x.leave < sunset - 120),
    unknownCost: pts.some((p) => p.cost === null),
    n: stops.length
  };
}

function setState(s) {
  Object.assign(T.state, { people: s.who === "solo" ? 1 : 2, skip: [], alt: s.alt ?? 0, date: s.date, area: s.area ?? "mix", from: s.from, who: s.who, how: s.how,
    depart: s.depart, hours: s.hours, budget: s.budget, end: s.end ?? "start", zone: s.zone ?? "all", roam: "stay", leave: null });
}

if (process.env.SHOW) {
  const [who, how, from, date, depart, hours, budget] = process.env.SHOW.split(",");
  const s = { who, how, from, date, depart, hours: +hours, budget: +budget, alt: +(process.env.ALT ?? 0) };
  setState(s);
  const r = T.makeCourse();
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  console.log(`${RG} ${process.env.SHOW} 코스 ${s.alt + 1}/${r.count}`);
  r.stops.forEach((x) => console.log(`  ${hhmm(x.begin)}-${hhmm(x.leave)} ${x.place.type} ${x.place.name} (이동 ${x.move.min}분, ${x.place.cost ?? "비용?"})`));
  console.log(`  끝 ${hhmm(r.finish)} · 1명 ${r.spent}원 · 일몰 ${hhmm(T.sunsetMin(date))}`);
  console.log("  ", measure(r, s));
  process.exit(0);
}

const FROMS = (process.env.FROMS || T.STARTS.map((x) => x.id).slice(0, 2).join(",")).split(",");
const WHOS = (process.env.WHO || "group,dog,kid,solo").split(",");
const HOWS = (process.env.HOWS || "walk,car").split(",").filter((h) => !(h === "walk" && require("vm") && false));
const DATES = (process.env.DATE || "2026-11-14,2026-11-17").split(",");
const ms = [];
let empty = 0;
for (const date of DATES) for (const from of FROMS) for (const who of WHOS) for (const how of HOWS)
for (const depart of ["10:00", "13:00"]) for (const hours of [4, 6, 8]) for (const budget of [50000, 100000]) {
  const s = { who, how, from, date, depart, hours, budget };
  setState(s);
  const m = measure(T.makeCourse(), s);
  if (m) ms.push(m); else empty++;
}
const avg = (f) => ms.reduce((a, m) => a + f(m), 0) / ms.length;
const pct = (f) => `${Math.round(ms.filter(f).length / ms.length * 100)}%`;
console.log(`${RG} 코스 ${ms.length}개 (빈 코스 ${empty})`);
console.log(`  이동 비율 ${Math.round(avg((m) => m.moving) * 100)}% · 돌아가기 평균 ${avg((m) => m.detour).toFixed(2)} (1.25 넘음 ${pct((m) => m.detour > 1.25)})`);
console.log(`  남는 시간 평균 ${Math.round(avg((m) => m.left))}분 (90분 넘음 ${pct((m) => m.left > 90)}) · 장소 평균 ${avg((m) => m.n).toFixed(1)}곳`);
console.log(`  카페 2곳+ ${pct((m) => m.cafes >= 2)} · 쇼핑 2곳+ ${pct((m) => m.shops >= 2)} · 낮 노을 ${pct((m) => m.daySunset)} · 비용 모름 ${pct((m) => m.unknownCost)}`);
