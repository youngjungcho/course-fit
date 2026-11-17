// 카드 만들기 공통 도구 (make.js·compare.js가 같이 써요)
// - loadEngine(지역 id): 사이트(index.html)의 코스 엔진을 그대로 불러와요 (tools/top-places.js와 같은 방식)
// - shoot(카드 HTML 목록, 폴더): 크롬(헤드리스)으로 1080×1350 PNG를 찍어요
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const read = (f) => fs.existsSync(`${ROOT}/${f}`) ? fs.readFileSync(`${ROOT}/${f}`, "utf8") : "";

function loadEngine(RG) {
  const html = read("index.html");
  const main = html.split("<script>").find((b) => b.includes("function applyRegion")).split("// ----- 시작 -----")[0];
  const stub = `
const el = () => ({ style: {}, setAttribute() {}, querySelectorAll: () => [], addEventListener() {}, set onclick(v) {}, set textContent(v) {}, set innerHTML(v) {}, hidden: false });
const document = { getElementById: el, querySelector: el, querySelectorAll: () => [], createElement: el, head: { append() {} }, body: el() };
const window = { scrollTo() {}, addEventListener() {} }; const track = () => {}; const gtag = () => {}; const navigator = {};
const history = { pushState() {}, replaceState() {}, state: null }; const location = { search: "", pathname: "/" };
`;
  const DATA = new Function(read(`regions/${RG}/places.js`) + read(`regions/${RG}/travel.js`) + read(`regions/${RG}/transit.js`) + ";return { PLACES, STARTS, COASTLINE, TRAVEL, INLAND_NORTH: typeof INLAND_NORTH !== \"undefined\" && INLAND_NORTH };")();
  return new Function("DATA", read("regions.js") + stub + main +
    `;applyRegion(REGIONS.find((r) => r.id === ${JSON.stringify(RG)}), DATA);return { makeCourse, state, STARTS, REGION, WHO, HOW, TYPE_ICON, costOf, won, babyChairOnly, sunsetToday, josa };`)(DATA);
}

const kst = () => new Date(Date.now() + 9 * 3600e3);
const today = () => kst().toISOString().slice(0, 10);
// 다가오는 토요일 (YYYY-MM-DD)
function nextSaturday() { const d = kst(); do d.setUTCDate(d.getUTCDate() + 1); while (d.getUTCDay() !== 6); return d.toISOString().slice(0, 10); }
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dayLabel = (iso) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일(${"일월화수목금토"[new Date(iso + "T00:00:00Z").getUTCDay()]})`;

function shoot(slides, out) {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "src"), { recursive: true });
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const profile = fs.mkdtempSync(path.join(require("os").tmpdir(), "insta-"));
  slides.forEach((h, i) => {
    const n = String(i + 1).padStart(2, "0");
    const src = path.join(out, "src", `${n}.html`);
    fs.writeFileSync(src, h);
    execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, "--window-size=1080,1350",
      "--virtual-time-budget=6000", `--screenshot=${path.join(out, `${n}.png`)}`, `file://${src}`], { stdio: "ignore", timeout: 60000 });
  });
}

module.exports = { ROOT, loadEngine, today, nextSaturday, hm, esc, dayLabel, shoot };
