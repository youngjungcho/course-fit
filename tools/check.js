// 코스 규칙 검사: 조건을 바꿔 가며 코스를 다시 짜서 규칙을 어긴 코스가 있는지 봐요.
//   REGION=busan node tools/check.js                 # 결과 수만 보기
//   REGION=busan node tools/check.js out.txt         # 조건마다 고른 장소를 파일로 (고치기 전후 비교용)
// env: REGION(지역 id), WHO(쉼표로 여러 개, 기본 group,dog,kid,wheel,solo), FROMS(출발지 id, 기본 그 지역 처음 2곳),
//      DATE, END(start|airport|any|...), ZONE, ROAM, LEAVE
// 확인하는 것: 운영시간·쉬는 날·쉬는 시간·마지막 주문·동행 조건·카페/식당 연달아·예산·시간·설명 문구 오류
// "규칙 위반 0"이 나와야 해요. 빈 코스는 조건이 까다로우면 나올 수 있어요(많으면 장소 보강 신호).
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..");
const outFile = process.argv[2];
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
  `;applyRegion(REGIONS.find((r) => r.id === ${JSON.stringify(RG)}), DATA);return { makeCourse, explainCourse, state, DEPART, HOURS, BUDGET, toMin, hoursOf, airportBuffer, NEED, tripDay, lastOrderMin, STARTS };`)(DATA);

const DATES = (process.env.DATE || "2026-11-07").split(",");
const WHOS = (process.env.WHO || "group,dog,kid,wheel,solo").split(",");
const REG = new Function(read("regions.js") + `;return REGIONS.find((r) => r.id === ${JSON.stringify(RG)});`)();
const FROMS = (process.env.FROMS || T.STARTS.map((s) => s.id).slice(0, 2).join(",")).split(",");
const HOWS = REG.noBus ? ["bike", "car", "ev", "any"] : ["walk", "bike", "car", "ev", "any"];
let n = 0, empty = 0, bad = 0;
const firstBad = [], lines = [];
for (const date of DATES) for (const area of ["mix", "sea", "mountain", "indoor"]) for (const from of FROMS) for (const who of WHOS) for (const how of HOWS)
for (const depart of T.DEPART) for (const hours of T.HOURS) for (const budget of T.BUDGET) {
  const end = process.env.END || "start";
  Object.assign(T.state, { people: who === "solo" ? 1 : 2, skip: [], alt: 0, date, area, from, who, how, depart, hours, budget, end,
    zone: process.env.ZONE || "all", roam: process.env.ROAM || "stay", leave: process.env.LEAVE || null });
  const r = T.makeCourse(); n++;
  lines.push([date, area, from, who, how, depart, hours, budget, r.stops.map((s) => s.place.id).join(">")].join(" "));
  if (!r.stops.length) { empty++; continue; }
  const why = [];
  const day = T.tripDay(), need = T.NEED[who];
  const limit = T.toMin(depart) + hours * 60 - T.airportBuffer();
  r.stops.forEach((s, i) => {
    const p = s.place, [open, close] = T.hoursOf(p);
    if (p.closedDays && p.closedDays.includes(day)) why.push(`${p.name} 쉬는 날`);
    if (open && s.begin < T.toMin(open)) why.push(`${p.name} 문 열기 전`);
    if (close && s.leave > T.toMin(close)) why.push(`${p.name} 문 닫은 뒤`);
    if (close && s.begin > T.lastOrderMin(p, close)) why.push(`${p.name} 마지막 주문 뒤`);
    if ((p.breaks ?? []).some(([a, b]) => s.begin < T.toMin(b) && s.leave > T.toMin(a))) why.push(`${p.name} 쉬는 시간`);
    if (need && p[need] !== true) why.push(`${p.name} 조건(${need}) 확인 안 됨`);
    const prev = r.stops[i - 1];
    if (prev && prev.place.type === p.type && (p.type === "카페" || p.type === "식당")) why.push(`${p.type} 연달아`);
  });
  if (r.finish > limit) why.push(`시간 넘침 ${r.finish - limit}분`);
  if (r.spent > budget) why.push(`예산 넘침 ${r.spent - budget}원`);
  const ex = T.explainCourse(r.stops, r.back);
  if (ex.some((t) => /undefined|NaN|null/.test(t))) why.push("설명 오류");
  if (why.length) { bad++; if (firstBad.length < 5) firstBad.push(`${who}/${how}/${from}/${depart}/${hours}h: ${why.join(", ")}`); }
}
if (outFile) fs.writeFileSync(outFile, lines.join("\n"));
console.log(`${RG} 전체 ${n}가지, 빈 코스 ${empty}, 규칙 위반 ${bad}`);
firstBad.forEach((t) => console.log("  " + t));
