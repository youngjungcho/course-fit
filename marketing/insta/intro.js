// 첫 게시물(쉼,표 소개) 카드뉴스 만들기: 사이트 자료에서 지역·장소 수를 세서 1080×1350 카드와 본문 글을 만들어요.
//   node marketing/insta/intro.js
// 결과: marketing/insta/<오늘>/intro/01.png … caption.txt
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { logo, deco, doc } = require("./style.js");
const ROOT = path.join(__dirname, "..", "..");

// ----- 사이트 자료에서 숫자 세기 -----
const regions = fs.readdirSync(path.join(ROOT, "regions")).filter((d) => fs.existsSync(path.join(ROOT, "regions", d, "places.js")));
const placeCount = regions.reduce((n, d) => n + new Function(fs.readFileSync(path.join(ROOT, "regions", d, "places.js"), "utf8") + ";return PLACES")().length, 0);
const REG = new Function(fs.readFileSync(path.join(ROOT, "regions.js"), "utf8") + ";return REGIONS")();
const jeju = REG.filter((r) => r.area === "제주").map((r) => r.name);
const others = REG.filter((r) => r.area !== "제주").map((r) => r.name);

const extra = `<style>
.card{background:#fff;border-radius:32px;padding:34px 40px;box-shadow:0 10px 30px rgba(31,52,42,.08);display:flex;gap:26px;align-items:center}
.card .ic{width:96px;height:96px;font-size:54px}
.card b{display:block;font-size:44px;font-weight:800;letter-spacing:-.03em}
.card span{font-size:32px;color:#6b716d;line-height:1.4}
.x{color:#c4572e}
.step{display:flex;gap:26px;align-items:flex-start}
.step .no{width:72px;height:72px;font-size:38px;flex:none}
.step b{display:block;font-size:48px;font-weight:800;letter-spacing:-.03em;margin-bottom:12px}
.pills{display:flex;flex-wrap:wrap;gap:12px}
.pill{background:#fff;border-radius:999px;padding:12px 22px;font-size:30px;font-weight:600;box-shadow:0 4px 14px rgba(31,52,42,.07)}
.big{font-size:120px;font-weight:800;color:#1f7a5a;letter-spacing:-.04em;line-height:1}
</style>`;
const page = (i, n) => `<div class="page">${i}/${n}</div>`;
const N = 6;
const slides = [
  // 1. 표지
  `${deco}<div class="pad">${logo}
  <div style="margin-top:130px"><span class="kicker">잠깐 멈춰 가는 하루</span></div>
  <h1 style="margin-top:34px">여행 코스,<br>이제 <em>누구랑</em>부터<br>고르세요</h1>
  <p class="promise" style="margin-top:40px">반려견 · 유모차 · 휠체어 · 혼자<br>조건에 맞춘 하루 코스를 짜 드려요</p>
  <p class="swipe" style="margin-top:auto">옆으로 넘겨 보세요 →</p></div>${page(1, N)}`,
  // 2. 이런 적 있죠?
  `<div class="pad" style="padding-top:80px">${logo}
  <h1 style="margin-top:70px;font-size:76px">이런 적 있죠?</h1>
  <div style="display:grid;gap:22px;margin-top:50px">
    <div class="card"><span class="ic">🐶</span><div><b>강아지 데려갔는데</b><span>입구에서 반려견은 안 된대요</span></div></div>
    <div class="card"><span class="ic">👶</span><div><b>유모차 밀고 갔는데</b><span>계단만 있어서 돌아 나왔어요</span></div></div>
    <div class="card"><span class="ic">🚪</span><div><b>겨우 도착했는데</b><span>오늘이 쉬는 날이었어요</span></div></div>
    <div class="card"><span class="ic">🚌</span><div><b>차 없이 갔는데</b><span>버스 시간이 하나도 안 맞았어요</span></div></div>
  </div></div>${page(2, N)}`,
  // 3. 고르는 건 세 가지
  `${deco}<div class="pad" style="padding-top:80px">${logo}
  <h1 style="margin-top:70px;font-size:76px">고르는 건<br><em>세 가지</em>뿐이에요</h1>
  <div style="display:grid;gap:44px;margin-top:56px">
    <div class="step"><span class="no">1</span><div><b>누구랑</b><div class="pills"><span class="pill">👫 친구·가족</span><span class="pill">🐶 반려견</span><span class="pill">👶 유모차</span><span class="pill">♿ 휠체어·어르신</span><span class="pill">🙋 혼자</span></div></div></div>
    <div class="step"><span class="no">2</span><div><b>어떻게</b><div class="pills"><span class="pill">🚶 뚜벅이</span><span class="pill">🚲 자전거</span><span class="pill">🚗 자차·렌터카</span><span class="pill">🔌 전기차</span></div></div></div>
    <div class="step"><span class="no">3</span><div><b>몇 시간</b><div class="pills"><span class="pill">⏰ 출발 시각과 머무를 시간</span></div></div></div>
  </div></div>${page(3, N)}`,
  // 4. 맞춰 주는 것
  `<div class="pad" style="padding-top:80px">${logo}
  <h1 style="margin-top:70px;font-size:76px">그러면 이걸<br><em>다 맞춰서</em> 짜 줘요</h1>
  <div style="display:grid;gap:22px;margin-top:50px">
    <div class="card"><span class="ic">🕘</span><div><b>운영시간 · 쉬는 날</b><span>공휴일·명절 휴무까지 봐요</span></div></div>
    <div class="card"><span class="ic">🧭</span><div><b>이동 시간</b><span>버스·지하철·차로 몇 분인지</span></div></div>
    <div class="card"><span class="ic">🍚</span><div><b>밥때 식당</b><span>점심·저녁 시간에 맞춰 넣어요</span></div></div>
    <div class="card"><span class="ic">💰</span><div><b>1명 비용</b><span>입장료·교통비까지 대략 더해요</span></div></div>
  </div></div>${page(4, N)}`,
  // 5. 갈 수 있는 곳
  `${deco}<div class="pad" style="padding-top:80px">${logo}
  <h1 style="margin-top:70px;font-size:76px">지금 짤 수 있는 곳</h1>
  <div style="margin-top:50px"><b style="font-size:46px">🍊 제주 ${jeju.length}곳</b>
    <div class="pills" style="margin-top:20px">${jeju.map((n) => `<span class="pill">${n}</span>`).join("")}</div></div>
  <div style="margin-top:44px"><b style="font-size:46px">🌊 그리고</b>
    <div class="pills" style="margin-top:20px">${others.map((n) => `<span class="pill">${n}</span>`).join("")}</div></div>
  <div style="margin-top:60px"><span class="big">${placeCount}곳</span><p class="promise" style="margin-top:16px;font-size:34px">카카오맵·관광공사 자료로 하나씩 확인한 장소예요</p></div>
  </div>${page(5, N)}`,
  // 6. 마무리
  `${deco}<div class="pad">${logo}
  <h1 style="margin-top:110px;font-size:80px">이번 주말,<br>내 조건으로<br><em>짜 볼까요?</em></h1>
  <div class="cta" style="margin-top:60px"><h2>가입 없이 바로</h2><p>누구랑 · 어떻게 · 몇 시간만 고르면<br>하루 코스가 나와요</p><span class="url">프로필 링크 → swimpyonote.com</span></div>
  <p class="foot" style="margin-top:auto">앞으로 조건별 하루 코스를 카드로 올려 드릴게요.<br>팔로우해 두면 여행 갈 때 편해요 🙂</p></div>${page(6, N)}`
].map((b) => doc(extra + b));

// ----- 저장·찍기 -----
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const out = path.join(__dirname, today, "intro");
fs.rmSync(out, { recursive: true, force: true });
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
const caption = `여행 코스, 이제 '어디'보다 '누구랑'부터 골라 보세요 🙂

강아지랑, 유모차 밀고, 휠체어로, 혹은 혼자.
같은 곳이라도 누구랑 가느냐에 따라 갈 수 있는 곳이 달라지잖아요.

쉼,표는 누구랑 · 어떻게 · 몇 시간만 고르면
그 조건에 맞는 하루 코스를 짜 주는 사이트예요.

✔️ 운영시간·쉬는 날(공휴일·명절 휴무까지)
✔️ 버스·지하철·차 이동 시간
✔️ 밥때 맞춘 식당
✔️ 1명 기준 대략 비용

📍 지금은 제주(${jeju.join("·")}), ${others.join("·")}
장소 ${placeCount}곳을 카카오맵·관광공사 자료로 확인해 담았어요.

앞으로 조건별 하루 코스를 카드로 올려 드릴게요.
팔로우해 두면 여행 갈 때 꺼내 보기 편해요 💾

👉 가입 없이 바로 써 보기 → 프로필 링크

#여행코스추천 #국내여행 #강아지랑여행 #아기랑여행 #혼자여행
`;
fs.writeFileSync(path.join(out, "caption.txt"), caption);
console.log(JSON.stringify({ out: path.relative(ROOT, out), cards: slides.length, placeCount, jeju, others }));
