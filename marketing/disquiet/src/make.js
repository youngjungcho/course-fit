// 디스콰이엇용 썸네일·프로덕트 이미지 HTML 만들기 (크롬 헤드리스로 찍어요)
const fs = require("fs");
const css = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:1000px;overflow:hidden;font-family:"Pretendard Variable",Pretendard,sans-serif;color:#1f2421;word-break:keep-all;
 background:linear-gradient(160deg,#e9f5ef 0%,#e3eff7 55%,#fdf1dc 100%);position:relative}
.sun{position:absolute;right:-120px;top:-140px;width:520px;height:520px;border-radius:50%;background:#f2a541;opacity:.18}
.wave{position:absolute;left:0;right:0;bottom:0;height:170px}
.wrap{position:relative;display:flex;align-items:center;gap:70px;height:100%;padding:0 110px}
.text{flex:1}
.brand{display:flex;align-items:center;gap:14px;font-weight:800;font-size:34px;letter-spacing:-.02em;margin-bottom:38px}
.brand i{font-style:normal;color:#f2a541}
.kicker{display:inline-block;padding:8px 18px;border-radius:999px;background:#fff;color:#1f7a5a;font-weight:700;font-size:24px;box-shadow:0 6px 18px rgba(31,52,42,.08);margin-bottom:22px}
h1{font-size:64px;line-height:1.22;font-weight:800;letter-spacing:-.03em;margin-bottom:26px}
h1 em{font-style:normal;color:#1f7a5a}
p.sub{font-size:28px;line-height:1.55;color:#4a524d;margin-bottom:30px}
ul{list-style:none;padding:0;display:grid;gap:14px}
li{font-size:26px;display:flex;gap:12px;align-items:center}
li b{color:#1f7a5a}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
.chip{background:#fff;border-radius:16px;padding:12px 18px;font-size:24px;box-shadow:0 6px 18px rgba(31,52,42,.08)}
.url{margin-top:36px;font-size:26px;font-weight:700;color:#1f7a5a}
.phones{display:flex;gap:34px;align-items:flex-end}
.phone{width:380px;height:800px;border-radius:52px;background:#111;padding:14px;box-shadow:0 30px 60px rgba(20,40,30,.25);flex:none}
.phone.small{width:330px;height:700px;border-radius:46px;margin-bottom:40px}
.screen{width:100%;height:100%;border-radius:40px;overflow:hidden;background:#f6f4ef}
.screen img{width:100%;display:block}
</style>`;
const brand = `<div class="brand"><svg width="52" height="52" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#1f7a5a"/><circle cx="68" cy="36" r="16" fill="#f2a541"/><path d="M0 66 Q25 56 50 66 T100 66 V100 H0Z" fill="#e3f1ea"/></svg><span>쉼<i>,</i>표</span></div>`;
const deco = `<div class="sun"></div><svg class="wave" viewBox="0 0 1600 170" preserveAspectRatio="none"><path d="M0 90 Q200 40 400 90 T800 90 T1200 90 T1600 90 V170 H0Z" fill="#ffffff" opacity=".55"/></svg>`;
// top: 화면에서 몇 px(원본 1000px 너비 기준)부터 보여 줄지
const phone = (img, top = 0, cls = "") => `<div class="phone ${cls}"><div class="screen"><img src="../shots/${img}.png" style="margin-top:-${top * (cls ? 302 : 352) / 1000}px"></div></div>`;
const page = (body) => `<!doctype html><html><head><meta charset="utf-8">${css}</head><body>${deco}<div class="wrap">${body}</div></body></html>`;
const out = {
  "1-hero": page(`<div class="text">${brand}<span class="kicker">잠깐 멈춰 가는 하루</span>
    <h1>누구랑, 어떻게 가는지만 고르면<br><em>하루 코스</em>가 나와요</h1>
    <p class="sub">반려견·아기·휠체어·뚜벅이도<br>조건에 맞는 곳만으로 짜요</p>
    <ul><li>📍 <b>제주·강릉·부산·경주</b> 장소 677곳</li><li>🕘 운영시간·쉬는 날·이동 시간까지 따져요</li><li>🙌 로그인 없이 무료</li></ul>
    <div class="url">swimpyonote.com</div></div>
    <div class="phones">${phone("first", 0, "small")}${phone("result", 0)}</div>`),
  "2-who": page(`<div class="text">${brand}<span class="kicker">1. 조건 고르기</span>
    <h1>같이 가는 사람에<br><em>꼭 맞는 곳</em>만<br>골라요</h1>
    <p class="sub">"여기 강아지 돼?" "유모차 들어가?"<br>하나하나 찾지 않아도 돼요</p>
    <div class="chips"><span class="chip">🐶 반려견이랑</span><span class="chip">👶 아기랑 (유모차)</span><span class="chip">♿ 휠체어·어르신</span><span class="chip">🙋 혼자</span><span class="chip">🚶 뚜벅이(버스)</span><span class="chip">🚲 자전거</span><span class="chip">🚗 자차·렌터카</span><span class="chip">🔌 전기차</span></div></div>
    <div class="phones">${phone("who", 0, "small")}${phone("when", 0)}</div>`),
  "3-hours": page(`<div class="text">${brand}<span class="kicker">2. 코스 받기</span>
    <h1>가 보니 문 닫았네,<br><em>없게</em> 짜요</h1>
    <ul><li>🕘 운영시간 · 브레이크타임 · 마지막 주문</li><li>📅 매월 ○째 휴관 · 설·추석 · 공휴일 휴무</li><li>🍚 밥때엔 식당, 해 질 녘엔 노을 명소</li><li>☔ 비 오는 날엔 실내 위주로</li><li>📌 꼭 가고 싶은 곳을 넣으면 그 주변으로</li></ul></div>
    <div class="phones">${phone("result", 1220)}</div>`),
  "4-dog": page(`<div class="text">${brand}<span class="kicker">3. 지도와 이동</span>
    <h1>강아지랑 <em>뚜벅이</em>도<br>버스 타는 법까지</h1>
    <p class="sub">실제 길로 잰 이동 시간에<br>몇 번 버스, 어디서 내리는지도 알려 줘요</p>
    <ul><li>🗺️ 카카오맵으로 동선 한눈에</li><li>💬 카카오톡으로 코스 보내기</li><li>⭐ 마음에 드는 코스는 저장</li></ul>
    <div class="url">swimpyonote.com</div></div>
    <div class="phones">${phone("dog", 470)}</div>`),
  "thumb": `<!doctype html><html><head><meta charset="utf-8">${css}<style>body{width:1000px;height:1000px;background:#1f7a5a;display:flex;align-items:center;justify-content:center}</style></head><body>
    <svg width="1000" height="1000" viewBox="0 0 100 100" style="position:absolute;inset:0"><rect width="100" height="100" fill="#1f7a5a"/><circle cx="68" cy="34" r="15" fill="#f2a541"/><path d="M0 62 Q25 52 50 62 T100 62 V100 H0Z" fill="#e3f1ea"/></svg>
    <div style="position:absolute;left:0;right:0;bottom:120px;text-align:center;font-weight:800;font-size:150px;letter-spacing:-.03em;color:#1f7a5a">쉼<span style="color:#f2a541">,</span>표</div></body></html>`
};
for (const [k, v] of Object.entries(out)) fs.writeFileSync(`${__dirname}/${k}.html`, v);
console.log(Object.keys(out).join(" "));
