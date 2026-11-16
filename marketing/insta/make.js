// 인스타 카드뉴스 만들기: 사이트의 코스 엔진으로 실제 코스를 짜서 1080×1350 카드와 본문 글을 만들어요.
//   node marketing/insta/make.js <지역 id> <who> <how> [출발 10:00] [시간 6] [날짜 YYYY-MM-DD, 기본: 다가오는 토요일] [출발지 id]
//   예) node marketing/insta/make.js gyeongju kid car 10:00 6
//   LIST=1 …  출발지·다른 코스별 장소 목록만 보기 / ALT=2 …  그중 3번째 코스로 만들기
// 결과: marketing/insta/<오늘>/<지역>-<who>-<how>/01.png … caption.txt
// 크롬(헤드리스)으로 카드를 찍어요. 인스타에 올리는 건 사람이 해요.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const read = (f) => fs.existsSync(`${ROOT}/${f}`) ? fs.readFileSync(`${ROOT}/${f}`, "utf8") : "";
const [RG, WHO_ID = "group", HOW_ID = "car", DEPART = "10:00", HOURS = "6", DATE_ARG, FROM_ARG] = process.argv.slice(2);
if (!RG) { console.error("사용법: node marketing/insta/make.js <지역 id> <who> <how> [출발] [시간] [날짜] [출발지]"); process.exit(1); }

// ----- 코스 엔진 불러오기 (tools/top-places.js와 같은 방식) -----
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
  `;applyRegion(REGIONS.find((r) => r.id === ${JSON.stringify(RG)}), DATA);return { makeCourse, state, STARTS, REGION, WHO, HOW, TYPE_ICON, costOf, won, babyChairOnly, sunsetToday, josa };`)(DATA);

const kst = new Date(Date.now() + 9 * 3600e3);
const today = kst.toISOString().slice(0, 10);
let date = DATE_ARG;
if (!date) { const d = new Date(kst); do d.setUTCDate(d.getUTCDate() + 1); while (d.getUTCDay() !== 6); date = d.toISOString().slice(0, 10); }
const from = FROM_ARG || T.STARTS.find((s) => s.id !== "airport")?.id || T.STARTS[0].id;
Object.assign(T.state, { people: WHO_ID === "solo" ? 1 : 2, skip: [], must: [], alt: 0, date, area: "mix", from, who: WHO_ID, how: HOW_ID,
  depart: DEPART, hours: Number(HOURS), budget: 100000, end: "start", zone: "all", roam: "stay", leave: null });
// LIST=1 이면 출발지·다른 코스(alt)별로 장소만 늘어놓고 끝나요 (어떤 코스로 만들지 고를 때)
if (process.env.LIST) {
  for (const st of T.STARTS) for (let alt = 0; alt < 4; alt++) {
    Object.assign(T.state, { from: st.id, alt });
    const c = T.makeCourse();
    if (c.stops.length) console.log(`${st.id} alt=${alt}: ${c.stops.map((x) => x.place.name).join(" → ")}`);
  }
  process.exit(0);
}
T.state.alt = Number(process.env.ALT || 0);
const r = T.makeCourse();
if (!r.stops.length) { console.error("코스가 비었어요. 조건을 바꿔 보세요."); process.exit(1); }

// ----- 글자 -----
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const R = T.REGION, regionName = R.area === "제주" && R.name !== "제주시내" ? `제주 ${R.name}` : R.name;
const who = T.WHO.find((w) => w.id === WHO_ID), how = T.HOW.find((h) => h.id === HOW_ID);
const WHO_SHORT = { group: "", dog: "강아지랑", kid: "아기랑", wheel: "휠체어로", solo: "혼자" }[WHO_ID];
const HOW_SHORT = { walk: "뚜벅이", bike: "자전거", car: "", ev: "전기차" }[HOW_ID];
const PROMISE = {
  dog: "반려견이 들어갈 수 있다고\n확인된 곳만 골랐어요", kid: "유모차가 다닐 수 있는 곳 위주로\n골랐어요",
  wheel: "계단 없이 들어갈 수 있다고\n확인된 곳만 골랐어요", solo: "혼자 가기 좋은 곳을 먼저\n골랐어요", group: "운영시간·쉬는 날·이동 시간까지\n맞춰서 짰어요"
}[WHO_ID];
const total = r.finish - T.state.hours * 0 - Number(DEPART.slice(0, 2)) * 60 - Number(DEPART.slice(3));
const cost = r.stops.reduce((a, s) => a + T.costOf(s.place), 0) + r.fares;
const title = [regionName, WHO_SHORT, HOW_SHORT].filter(Boolean).join(" ");
const badgesOf = (p) => {
  const out = [];
  if (WHO_ID === "kid") out.push(T.babyChairOnly(p) ? ["warn", "유아의자 있음 · 유모차는 확인 필요"] : ["ok", p.strollerReview ? "유모차 OK(후기 기준)" : "유모차 OK"]);
  if (WHO_ID === "dog") out.push(p.dogRule ? ["warn", `반려견${p.dogReview ? "(후기 기준)" : ""}: ${p.dogRule}`] : ["ok", p.dogReview ? "반려견 OK(후기 기준)" : "반려견 OK"]);
  if (WHO_ID === "wheel") out.push(["ok", "계단 없음"]);
  if (p.lastOrder) out.push(["info", `${p.type === "식당" || p.type === "카페" ? "마지막 주문" : "입장 마감"} ${p.lastOrder}`]);
  if (p.seasonalHours) out.push(["warn", "계절마다 시간이 달라요"]);
  return out.slice(0, 2);
};
const moveText = (m) => m ? `${m.text} 약 ${m.min}분` : "";

// ----- 카드 -----
const { css, logo, deco, doc } = require("./style.js");

const stops = r.stops;
// 한 장에 2곳씩. 장소 수가 홀수면 마지막 장에 3곳을 조금 작게 넣어요 (한 곳만 덩그러니 남지 않게)
const groups = [];
for (let i = 0; i < stops.length; i += 2) groups.push(stops.slice(i, i + 2));
if (groups.length > 1 && groups.at(-1).length === 1) groups.at(-2).push(...groups.pop());
const N = 1 + groups.length + 1;
const dayLabel = (iso) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일(${"일월화수목금토"[new Date(iso + "T00:00:00Z").getUTCDay()]})`;
const slides = [];
slides.push(doc(`${deco}<div class="pad">${logo}
  <div style="margin-top:120px"><span class="kicker">${esc(regionName)} 하루 코스</span></div>
  <h1 style="margin-top:34px">${esc(title)}<br><em>${HOURS}시간</em> 코스</h1>
  <p class="promise" style="margin-top:34px">${esc(PROMISE)}</p>
  <div class="chips" style="margin-top:56px"><div class="chip"><b>${stops.length}곳</b><span>장소</span></div><div class="chip"><b>${how.emoji} ${esc(how.label.split("·")[0])}</b><span>이동</span></div><div class="chip"><b>약 ${(Math.round(cost / 1000) * 1000).toLocaleString("ko-KR")}원</b><span>1명 비용</span></div></div>
  <p class="swipe" style="margin-top:auto">옆으로 넘겨 보세요 →</p></div><div class="page">1/${N}</div>`));
groups.forEach((g, gi) => {
  const blocks = g.map((s, k) => {
    const idx = stops.indexOf(s), p = s.place, next = stops[idx + 1];
    const meta = [p.type, `${p.stayMin}분`, p.cost === null ? "비용 확인 필요" : T.won(p.cost)].join(" · ");
    return `<div class="stop"><div class="time"><span class="no">${idx + 1}</span>${hm(s.begin)} – ${hm(s.leave)}</div>
      <div class="name"><span class="ic">${T.TYPE_ICON[p.type] ?? "📍"}</span>${esc(p.name)}</div>
      <p class="desc">${esc(p.desc)}</p><p class="meta">${esc(meta)}</p>
      <div class="badges">${badgesOf(p).map(([c, t]) => `<span class="badge ${c === "ok" ? "" : c}">${esc(t)}</span>`).join("")}</div></div>
      ${next ? `<div class="move">${esc(moveText(next.move))}</div>` : ""}`;
  }).join("");
  slides.push(doc(`<div class="pad" style="padding-top:80px">${logo}<div class="${g.length > 2 ? "compact" : ""}" style="margin-top:44px;display:flex;flex-direction:column">${blocks}</div></div><div class="page">${gi + 2}/${N}</div>`));
});
slides.push(doc(`${deco}<div class="pad">${logo}
  <h1 style="margin-top:70px;font-size:70px">한눈에 보기</h1>
  <div class="list" style="margin-top:34px">${stops.map((s) => `<div><b>${hm(s.begin)}</b><span>${T.TYPE_ICON[s.place.type] ?? "📍"} ${esc(s.place.name)}</span></div>`).join("")}</div>
  <div class="cta" style="margin-top:56px"><h2>내 조건으로 다시 짜 보기</h2><p>누구랑 · 어떻게 · 몇 시간만 고르면<br>운영시간 맞춘 하루 코스가 나와요</p><span class="url">프로필 링크 → swimpyonote.com</span></div>
  <p class="foot" style="margin-top:auto">${dayLabel(date)} ${DEPART} 출발 기준 · 운영시간은 카카오맵·관광공사 자료예요.<br>가기 전에 한 번 더 확인해 주세요. 💾 저장해 두면 여행 때 편해요</p></div><div class="page">${N}/${N}</div>`));

// ----- 저장·찍기 -----
const slug = `${RG}-${WHO_ID}-${HOW_ID}`;
fs.rmSync(path.join(__dirname, today, slug), { recursive: true, force: true });
const out = path.join(__dirname, today, slug);
fs.mkdirSync(path.join(out, "src"), { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = fs.mkdtempSync(path.join(require("os").tmpdir(), "insta-"));
slides.forEach((h, i) => {
  const n = String(i + 1).padStart(2, "0");
  const src = path.join(out, "src", `${n}.html`);
  fs.writeFileSync(src, h);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, "--window-size=1080,1350",
    "--virtual-time-budget=6000", `--screenshot=${path.join(out, `${n}.png`)}`, `file://${src}`], { stdio: "ignore" });
});

// ----- 본문 글 -----
const tags = {
  group: ["여행코스", "당일치기"], dog: ["강아지랑여행", "반려견동반", "애견동반여행"], kid: ["아기랑여행", "아이랑가볼만한곳", "유모차여행"],
  wheel: ["무장애여행", "휠체어여행"], solo: ["혼자여행", "혼행"]
}[WHO_ID];
const base = R.area === "제주" ? ["제주여행", `${R.name.split("·")[0]}여행`, "제주도여행"] : [`${R.name}여행`, `${R.name}가볼만한곳`, `${R.name}여행코스`];
const howTag = { walk: ["뚜벅이여행"], bike: ["자전거여행"], car: ["렌트카여행"], ev: ["전기차여행"] }[HOW_ID];
// 본문 글(멘트): 첫 줄 후킹 → 짧은 소개 → 코스 → 꿀팁 → 안내 → 해시태그. 자료에 있는 사실만 써요.
const HOOK = {
  group: `${regionName} 하루, 뭐부터 갈지 고민이면 이대로 따라가 보세요 ✨`,
  dog: `강아지랑 ${regionName}${HOW_ID === "walk" ? ", 차 없이 버스로도 충분해요" : " 하루 코스"} 🐶`,
  kid: `아기랑 ${regionName}, 유모차 끌고 어디까지 갈 수 있을까요? 👶`,
  wheel: `휠체어로 ${regionName} 하루, 계단 걱정 덜고 다녀요 ♿`,
  solo: `혼자 ${regionName}, 눈치 안 보고 하루 채우기 🙋`
}[WHO_ID];
const INTRO = {
  group: "운영시간이랑 쉬는 날, 이동 시간까지 맞춰서 짠 코스예요.",
  dog: "반려견이 들어갈 수 있다고 확인된 곳만 골랐고, 운영시간·이동 시간까지 맞췄어요.",
  kid: "유모차가 다닐 수 있다고 나온 곳 위주로 골랐고, 밥때에 맞춰 식당도 넣었어요.",
  wheel: "계단 없이 들어갈 수 있다고 확인된 곳만 골랐어요.",
  solo: "혼자 가기 좋은 곳을 먼저 넣고, 운영시간·이동 시간까지 맞췄어요."
}[WHO_ID];
const NUM = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
const lines = stops.map((s, i) => `${NUM[i] ?? i + 1 + "."} ${hm(s.begin)} ${s.place.name}${s.place.type === "식당" ? " 🍚" : ""}\n   ${s.place.desc}`);
const tips = [];
for (const s of stops) {
  const p = s.place;
  if (WHO_ID === "kid" && T.babyChairOnly(p)) tips.push(`${p.name}${T.josa(p.name, "은", "는")} 유아의자는 있지만 유모차 자리는 미리 전화로 물어보면 좋아요`);
  if (WHO_ID === "dog" && p.dogRule) tips.push(`${p.name}: ${p.dogRule}${p.dogReview ? " (후기 기준)" : ""}`);
  if (p.lastOrder && (p.type === "식당" || p.type === "카페")) tips.push(`${p.name} 마지막 주문은 ${p.lastOrder}`);
  else if (p.lastOrder) tips.push(`${p.name} 입장 마감은 ${p.lastOrder}`);
}
const seasonal = stops.filter((s) => s.place.seasonalHours).map((s) => s.place.name);
if (seasonal.length) tips.push(`${seasonal.join("·")}${T.josa(seasonal[seasonal.length - 1], "은", "는")} 계절마다 운영시간이 달라요`);
const bus = stops.map((s) => s.move?.text).find((t) => /번 버스/.test(t ?? ""));
if (bus) tips.push(`이동은 ${bus.replace("로", "")}처럼 버스로 이어져요. 배차는 미리 한 번 확인!`);
const caption = `${HOOK}

${INTRO}
${dayLabel(date)} ${DEPART} 출발 · ${how.label} · ${HOURS}시간 · 1명 약 ${cost.toLocaleString("ko-KR")}원

${lines.join("\n")}
${tips.length ? `\n📌 알아 두면 좋아요\n${[...new Set(tips)].slice(0, 4).map((t) => "· " + t).join("\n")}\n` : ""}
운영시간은 카카오맵·관광공사 자료 기준이라, 가기 전에 한 번 더 확인해 주세요 🙏

👉 누구랑·어떻게·몇 시간만 고르면 내 조건으로 다시 짜 줘요 → 프로필 링크
💾 저장해 두고 여행 갈 때 꺼내 보세요

${[base[0], base[1], tags[0], howTag[0], "여행코스추천"].map((t) => "#" + t.replace(/\s/g, "")).join(" ")}
`;
fs.writeFileSync(path.join(out, "caption.txt"), caption);
console.log(JSON.stringify({ out: path.relative(ROOT, out), cards: slides.length, date, from, stops: stops.map((s) => `${hm(s.begin)} ${s.place.name}`) }, null, 1));
