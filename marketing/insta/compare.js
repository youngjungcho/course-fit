// "같은 곳, 다른 사람" 카드뉴스: 같은 지역·출발지·이동으로 누구랑만 바꿔서 코스를 짜고, 나란히 보여 줘요.
//   node marketing/insta/compare.js <지역 id> <how> <출발지 id> [누구랑 목록, 기본 dog,kid,wheel,solo] [출발 10:00] [시간 6] [날짜]
//   예) node marketing/insta/compare.js gyeongju car hwangnidan
// 결과: marketing/insta/<오늘>/<지역>-compare-<how>/01.png … caption.txt
const fs = require("fs");
const path = require("path");
const { loadEngine, today, nextSaturday, hm, esc, dayLabel, shoot } = require("./engine.js");
const { logo, deco, doc } = require("./style.js");

const [RG, HOW_ID = "car", FROM, WHO_LIST = "dog,kid,wheel,solo", DEPART = "10:00", HOURS = "6", DATE_ARG] = process.argv.slice(2);
if (!RG || !FROM) { console.error("사용법: node marketing/insta/compare.js <지역 id> <how> <출발지 id> [dog,kid,wheel,solo] [출발] [시간] [날짜]"); process.exit(1); }
const T = loadEngine(RG);
const date = DATE_ARG || nextSaturday();
const start = T.STARTS.find((s) => s.id === FROM);
if (!start) { console.error(`출발지 ${FROM}이(가) 없어요: ${T.STARTS.map((s) => s.id).join(", ")}`); process.exit(1); }

// ----- 누구랑마다 코스 짜기 -----
const LOOK = {
  group: { emoji: "👫", label: "친구·가족이랑", color: "#1f7a5a", soft: "#e3f1ea", why: "조건 없이 좋은 곳으로" },
  dog: { emoji: "🐶", label: "강아지랑", color: "#c46a12", soft: "#fdebd3", why: "반려견이 들어갈 수 있는 곳만" },
  kid: { emoji: "👶", label: "아기랑", color: "#c2417a", soft: "#fbe3ee", why: "유모차가 다닐 수 있는 곳 위주로" },
  wheel: { emoji: "♿", label: "휠체어로", color: "#2b6a94", soft: "#e2eef7", why: "계단 없이 들어갈 수 있는 곳만" },
  solo: { emoji: "🙋", label: "혼자", color: "#6a4bb0", soft: "#ece6f8", why: "혼자 가기 좋은 곳을 먼저" }
};
const courses = WHO_LIST.split(",").map((who) => {
  Object.assign(T.state, { people: who === "solo" ? 1 : 2, skip: [], must: [], alt: 0, date, area: "mix", from: FROM, who, how: HOW_ID,
    depart: DEPART, hours: Number(HOURS), budget: 100000, end: "start", zone: "all", roam: "stay", leave: null });
  const r = T.makeCourse();
  const cost = r.stops.reduce((a, s) => a + T.costOf(s.place), 0) + r.fares;
  return { who, look: LOOK[who], stops: r.stops, cost };
});
const empty = courses.filter((c) => !c.stops.length).map((c) => c.who);
if (empty.length) { console.error(`코스가 빈 사람이 있어요: ${empty.join(", ")}. 다른 출발지나 이동으로 해 보세요.`); process.exit(1); }

// 이 사람에게 맞춘 점 (자료에 있는 것만)
const fit = (who, p) => {
  if (who === "dog") return p.dogRule ? ["warn", `반려견${p.dogReview ? "(후기 기준)" : ""}: ${p.dogRule}`] : ["ok", p.dogReview ? "반려견 OK(후기 기준)" : "반려견 OK"];
  if (who === "kid") return T.babyChairOnly(p) ? ["warn", "유아의자 있음 · 유모차는 확인 필요"] : ["ok", p.strollerReview ? "유모차 OK(후기 기준)" : "유모차 OK"];
  if (who === "wheel") return ["ok", "계단 없음"];
  if (who === "solo" && p.solo) return ["ok", "혼자 OK"];
  return null;
};

// ----- 카드 -----
const R = T.REGION, regionName = R.area === "제주" && R.name !== "제주시내" ? `제주 ${R.name}` : R.name;
const how = T.HOW.find((h) => h.id === HOW_ID);
// 출발지 이름은 짧게: "황리단길·대릉원 근처" → "황리단길"
const placeName = (start.name || start.label || regionName).replace(/\s*\(.*\)$/, "").replace(/\s*근처$/, "").split("·")[0];
const extra = `<style>
.who{display:inline-flex;align-items:center;gap:14px;align-self:flex-start;padding:12px 26px 12px 16px;border-radius:999px;font-weight:800;font-size:40px;color:#fff}
.who i{font-style:normal;width:62px;height:62px;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:36px}
.why{font-size:34px;color:#3d4641;margin-top:22px}
.tl{margin-top:34px;display:flex;flex-direction:column;gap:14px}
.row{background:#fff;border-radius:28px;padding:22px 30px;display:flex;gap:24px;align-items:center;box-shadow:0 8px 22px rgba(31,52,42,.07)}
.row .t{font-size:30px;font-weight:800;font-variant-numeric:tabular-nums;width:96px;flex:none}
.row .ic{width:64px;height:64px;font-size:36px;border-radius:18px}
.row b{display:block;font-size:38px;font-weight:800;letter-spacing:-.03em}
.row span{font-size:27px;color:#6b716d}
.row .fit{display:inline-block;margin-top:8px;font-size:24px;font-weight:700;padding:6px 14px;border-radius:12px}
.sum{display:flex;gap:14px;margin-top:auto}
.sum div{background:#fff;border-radius:22px;padding:18px 26px;font-size:28px;color:#6b716d;box-shadow:0 6px 18px rgba(31,52,42,.06)}
.sum b{color:#1f2421;font-size:34px;margin-right:8px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
.cell{background:#fff;border-radius:28px;padding:26px 28px;box-shadow:0 8px 22px rgba(31,52,42,.07)}
.cell h3{font-size:34px;font-weight:800;margin-bottom:14px}
.cell p{font-size:27px;line-height:1.55;color:#2f3632}
.cell p.same{color:#9aa19c}
.faces{display:flex;gap:18px;margin-top:56px}
.faces span{width:120px;height:120px;border-radius:36px;display:inline-flex;align-items:center;justify-content:center;font-size:64px;box-shadow:0 8px 22px rgba(31,52,42,.08)}
</style>`;
const N = 1 + courses.length + 2;
const page = (i) => `<div class="page">${i}/${N}</div>`;
const slides = [];
slides.push(`${deco}<div class="pad">${logo}
  <div style="margin-top:110px"><span class="kicker">${esc(regionName)} · 같은 출발, 다른 하루</span></div>
  <h1 style="margin-top:34px;font-size:84px">같은 ${esc(placeName)},<br><em>누구랑</em> 가느냐에 따라<br>코스가 달라져요</h1>
  <div class="faces">${courses.map((c) => `<span style="background:${c.look.soft}">${c.look.emoji}</span>`).join("")}</div>
  <p class="promise" style="margin-top:44px;font-size:36px">${dayLabel(date)} ${DEPART} 출발 · ${esc(how.label)} · ${HOURS}시간<br>조건만 바꿔서 쉼,표로 짜 봤어요</p>
  <p class="swipe" style="margin-top:auto">옆으로 넘겨 비교해 보세요 →</p></div>${page(1)}`);
courses.forEach((c, i) => {
  const rows = c.stops.map((s) => {
    const p = s.place, f = fit(c.who, p);
    const fitTag = f ? `<em class="fit" style="font-style:normal;${f[0] === "ok" ? `background:${c.look.soft};color:${c.look.color}` : "background:#fff1d6;color:#9a5b00"}">${esc(f[1])}</em>` : "";
    return `<div class="row"><span class="t" style="color:${c.look.color}">${hm(s.begin)}</span><span class="ic">${T.TYPE_ICON[p.type] ?? "📍"}</span>
      <div><b>${esc(p.name)}</b><span>${esc(p.desc)}</span>${fitTag ? `<br>${fitTag}` : ""}</div></div>`;
  }).join("");
  // 5곳 이상이면 한 줄 설명을 빼고 촘촘하게 (넘치지 않게)
  const dense = c.stops.length >= 5 ? `<style>.row{padding:16px 28px}.row b{font-size:34px}.row div>span{display:none}.row div>br{display:none}.row .fit{margin-top:6px;display:table}.tl{gap:12px}</style>` : "";
  slides.push(`${dense}<div class="hero" style="background:linear-gradient(170deg,${c.look.soft} 0%,#f6f4ef 60%)"></div><div class="pad" style="padding-top:80px">${logo}
    <div style="margin-top:46px"><span class="who" style="background:${c.look.color}"><i>${c.look.emoji}</i>${esc(c.look.label)}</span></div>
    <p class="why">${esc(c.look.why)} 골랐어요</p>
    <div class="tl">${rows}</div>
    <div class="sum"><div><b>${c.stops.length}곳</b>장소</div><div><b>약 ${(Math.round(c.cost / 1000) * 1000).toLocaleString("ko-KR")}원</b>1명</div></div>
  </div>${page(i + 2)}`);
});
// 한눈에 비교: 여럿이 같이 들른 곳은 흐리게, 그 사람만 들른 곳은 진하게
const count = {};
for (const c of courses) for (const s of c.stops) count[s.place.name] = (count[s.place.name] || 0) + 1;
const shared = Object.keys(count).filter((n) => count[n] === courses.length);
slides.push(`${deco}<div class="pad" style="padding-top:80px">${logo}
  <h1 style="margin-top:50px;font-size:68px">한눈에 비교</h1>
  <p class="why" style="margin-top:14px">진한 글씨는 그 사람 코스에만 들어간 곳이에요</p>
  <div class="grid">${courses.map((c) => `<div class="cell" style="border-top:10px solid ${c.look.color}"><h3>${c.look.emoji} ${esc(c.look.label)}</h3>
    ${c.stops.map((s) => `<p class="${count[s.place.name] > 1 ? "same" : ""}"${count[s.place.name] > 1 ? "" : ` style="font-weight:700"`}>${esc(s.place.name)}</p>`).join("")}</div>`).join("")}</div>
  ${shared.length ? `<p class="why" style="margin-top:30px">모두 들른 곳: <b>${esc(shared.join(", "))}</b></p>` : ""}
</div>${page(N - 1)}`);
slides.push(`${deco}<div class="pad">${logo}
  <h1 style="margin-top:110px;font-size:80px">우리 조건이면<br>어떻게 나올까요?</h1>
  <div class="cta" style="margin-top:60px"><h2>내 조건으로 짜 보기</h2><p>누구랑 · 어떻게 · 몇 시간만 고르면<br>운영시간 맞춘 하루 코스가 나와요</p><span class="url">프로필 링크 → swimpyonote.com</span></div>
  <p class="promise" style="margin-top:50px;font-size:36px">💬 다음엔 어디를 누구랑 비교해 볼까요?<br>댓글로 알려 주시면 짜 드릴게요</p>
  <p class="foot" style="margin-top:auto">${dayLabel(date)} ${DEPART} 출발 기준 · 운영시간은 카카오맵·관광공사 자료예요.<br>가기 전에 한 번 더 확인해 주세요.</p></div>${page(N)}`);

const out = path.join(__dirname, today(), `${RG}-compare-${HOW_ID}`);
shoot(slides.map((b) => doc(extra + b)), out);

// ----- 본문 글 -----
const caption = `같은 ${placeName} 출발인데, 누구랑 가느냐에 따라 하루가 이렇게 달라져요 👀

${dayLabel(date)} ${DEPART} 출발 · ${how.label} · ${HOURS}시간.
조건은 그대로 두고 '누구랑'만 바꿔서 쉼,표로 짜 봤어요.

${courses.map((c) => `${c.look.emoji} ${c.look.label} (${c.look.why})\n${c.stops.map((s) => `${hm(s.begin)} ${s.place.name}`).join(" → ")}`).join("\n\n")}
${shared.length ? `\n모두 들른 곳은 ${shared.join(", ")}뿐이에요.\n` : ""}
운영시간은 카카오맵·관광공사 자료 기준이라, 가기 전에 한 번 더 확인해 주세요 🙏

👉 내 조건으로 짜 보기 → 프로필 링크
💬 다음엔 어디를 누구랑 비교해 볼까요? 댓글로 알려 주세요

${[R.area === "제주" ? "제주여행" : `${R.name}여행`, R.area === "제주" ? `${R.name.split("·")[0]}여행` : `${R.name}가볼만한곳`, "강아지랑여행", "아기랑여행", "여행코스추천"].map((t) => "#" + t).join(" ")}
`;
fs.writeFileSync(path.join(out, "caption.txt"), caption);
console.log(JSON.stringify({ out: path.relative(path.join(__dirname, "..", ".."), out), cards: slides.length, date, shared, courses: courses.map((c) => `${c.who}: ${c.stops.map((s) => s.place.name).join(" → ")}`) }, null, 1));
