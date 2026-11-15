// 코스에 자주 나오는 장소 뽑기: 안내원이 주간 점검할 곳을 고를 때 써요.
//   node tools/top-places.js busan              # 부산에서 자주 나오는 20곳 (JSON)
//   node tools/top-places.js aewol 10           # 애월 10곳
//   node tools/top-places.js busan 30 dog=null  # 반려견 칸이 빈 곳만
// 여러 조건(동행 4가지 × 이동 2가지 × 출발 2개 × 시간 2개)으로 코스를 짜 보고, 들어간 횟수로 줄 세워요.
// 늘 열려 있는 해변·공원(운영시간 없음, 24시간)은 점검할 게 없어서 빼요. 시장은 넣어요.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..");
const read = (f) => fs.existsSync(`${dir}/${f}`) ? fs.readFileSync(`${dir}/${f}`, "utf8") : "";
const [RG, N = "20", filter] = process.argv.slice(2);
if (!RG) { console.error("사용법: node tools/top-places.js <지역 id> [개수] [칸=값]"); process.exit(1); }
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
  `;applyRegion(REGIONS.find((r) => r.id === ${JSON.stringify(RG)}), DATA);return { makeCourse, state, STARTS, PLACES, REGION };`)(DATA);

const hows = T.REGION.noBus ? ["car", "bike"] : ["car", "walk"];
const date = new Date(Date.now() + 9 * 3600e3 + 3 * 864e5).toISOString().slice(0, 10); // 사흘 뒤 (요일이 섞이게)
const count = {};
let n = 0;
for (const who of ["group", "dog", "kid", "solo"]) for (const how of hows) for (const from of T.STARTS.slice(0, 2).map((s) => s.id))
for (const depart of ["10:00", "13:00"]) for (const hours of [4, 8]) {
  Object.assign(T.state, { people: 2, skip: [], must: [], alt: 0, date, area: "mix", from, who, how, depart, hours, budget: 100000, end: "start", zone: "all", roam: "stay", leave: null });
  const r = T.makeCourse(); n++;
  for (const s of r.stops) count[s.place.id] = (count[s.place.id] ?? 0) + 1;
}
const [fk, fv] = filter ? filter.split("=") : [];
const want = (p) => !fk || String(p[fk]) === fv;
const always = (p) => (p.open == null || (p.open === "00:00" && p.close === "24:00")) && ["공원", "볼거리"].includes(p.type) && !/시장/.test(p.name);
const out = T.PLACES.filter((p) => count[p.id] && want(p) && (fk || !always(p)))
  .sort((a, b) => count[b.id] - count[a.id]).slice(0, Number(N))
  .map((p) => ({
    id: p.id, name: p.name, type: p.type, share: `${Math.round(count[p.id] / n * 100)}%`,
    kakao: p.kakaoId ? `https://place.map.kakao.com/${p.kakaoId}` : null,
    open: p.open, close: p.close, closedDays: p.closedDays, lastOrder: p.lastOrder ?? null, breaks: p.breaks ?? null, hoursByDay: p.hoursByDay ?? null,
    dog: p.dog, stroller: p.stroller, cost: p.cost
  }));
console.log(JSON.stringify(out, null, 1));
