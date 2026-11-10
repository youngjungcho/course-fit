// 지역별 안내 페이지 만들기: regions.js와 regions/<지역>/places.js로 course/<주소>/index.html을 새로 써요.
// 검색엔진이 화면 코드를 실행하지 않아도 지역·장소를 읽을 수 있게, 글과 구조화 데이터(JSON-LD)를 미리 넣어 둬요.
// sitemap.xml도 같이 새로 써요.
//
//   node tools/build-pages.js
//
// 장소를 더하거나 고치면, 지역을 더하면 다시 돌려요. 손으로 고친 내용은 지워져요.
// 장소 칸에서 사실로 확인된 것만 써요: 이름·종류·소개·위치·반려견/유모차/계단 없음(true일 때만)·카카오맵 주소.
// 운영시간은 "아직 직접 확인 안 함" 자료라 페이지에 적지 않아요(코스 화면에서 확인하라고 안내해요).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://swimpyonote.com";
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const REGIONS = new Function(read("regions.js") + ";return REGIONS;")();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

// 주소: 제주는 "jeju-지역", 나머지는 지역 id
const slugOf = (r) => r.area === "제주" ? `jeju-${r.id === "jejusi" ? "city" : r.id}` : r.id;
// 이름: 제주 안의 지역은 "제주 애월"처럼, 나머지는 지역 이름만 (강릉·부산)
const fullName = (r) => r.area !== "제주" || r.name.startsWith("제주") ? r.name : `제주 ${r.name}`;
const TYPES = ["볼거리", "공원", "카페", "식당", "쇼핑"];
const TYPE_ICON = { 식당: "🍜", 카페: "☕", 볼거리: "🏛️", 공원: "🌳", 쇼핑: "🛍️" };
const SCHEMA_TYPE = { 식당: "Restaurant", 카페: "CafeOrCoffeeShop", 볼거리: "TouristAttraction", 공원: "TouristAttraction", 쇼핑: "Store" };

function loadPlaces(r) {
  const src = read(`regions/${r.id}/places.js`);
  const { PLACES } = new Function(src + ";return { PLACES };")();
  const date = (src.match(/\((\d{4}-\d{2}-\d{2}) [^)]*정리/) ?? [])[1] ?? null;
  return { places: PLACES.filter((p) => typeof p.lat === "number"), date };
}

function badges(p) {
  const out = [];
  if (p.dog === true) out.push(p.dogRule ? `반려견 조건부${p.dogReview ? "(후기)" : ""}` : `반려견 OK${p.dogReview ? "(후기)" : ""}`);
  if (p.stroller === true) out.push(`유모차 OK${p.strollerReview ? "(후기)" : ""}`);
  if (p.stepFree === true) out.push("계단 없음");
  return out;
}

function placeItem(p) {
  const kakao = p.kakaoId ? `https://place.map.kakao.com/${p.kakaoId}` : null;
  return `<li class="place"><span class="ticon" aria-hidden="true">${TYPE_ICON[p.type] ?? "📍"}</span><div>
      <div class="pname">${kakao ? `<a href="${kakao}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</div>
      ${p.desc ? `<div class="pdesc">${esc(p.desc)}</div>` : ""}
      ${badges(p).length ? `<div class="pbadges">${badges(p).map((b) => `<span>${esc(b)}</span>`).join("")}</div>` : ""}
    </div></li>`;
}

function page(r, places, date) {
  const slug = slugOf(r), url = `${SITE}/course/${slug}/`, name = fullName(r);
  const appUrl = `/?region=${r.id}`;
  const count = (f) => places.filter(f).length;
  const dog = count((p) => p.dog === true), stroller = count((p) => p.stroller === true), stepFree = count((p) => p.stepFree === true);
  const moves = r.noBus ? "자전거·렌터카·택시" : r.subway ? "뚜벅이(지하철·버스)·자전거·렌터카·택시" : "뚜벅이(버스)·자전거·렌터카·택시";
  const title = `${name} 하루 여행 코스 · 반려견·아이·휠체어 맞춤 | 쉼,표`;
  const desc = `${name} 장소 ${places.length}곳으로 짜는 하루 코스. 반려견 동반 ${dog}곳, 유모차 ${stroller}곳, 계단 없는 곳 ${stepFree}곳. 누구랑(반려견·아이·휠체어·혼자), 어떻게(${moves}) 다니는지 고르면 운영시간과 이동 시간을 따져 코스를 짜 드려요.`;

  // 장소 묶음: 구역이 있으면 구역별, 없으면 종류별
  const sections = r.zones
    ? r.zones.map((z) => ({ title: z.label, cta: `/?region=${r.id}&zone=${z.id}`, items: places.filter((p) => p.zone === z.id) }))
    : TYPES.map((t) => ({ title: `${TYPE_ICON[t]} ${t}`, items: places.filter((p) => p.type === t) })).filter((s) => s.items.length);
  const sortByType = (a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type);

  const others = REGIONS.filter((x) => x !== r);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": url, url, name: title, description: desc, inLanguage: "ko-KR",
        isPartOf: { "@id": `${SITE}/#website` }, ...(date ? { dateModified: date } : {}),
        about: { "@id": `${url}#destination` }, mainEntity: { "@id": `${url}#places` }
      },
      {
        "@type": "TouristDestination", "@id": `${url}#destination`, name,
        geo: { "@type": "GeoCoordinates", latitude: r.sun[0], longitude: r.sun[1] },
        containedInPlace: { "@type": "AdministrativeArea", name: r.area }
      },
      {
        "@type": "ItemList", "@id": `${url}#places`, name: `${name} 하루 코스에 넣는 장소`, numberOfItems: places.length,
        itemListElement: [...places].sort(sortByType).map((p, i) => ({
          "@type": "ListItem", position: i + 1,
          item: {
            "@type": SCHEMA_TYPE[p.type] ?? "Place", name: p.name,
            ...(p.desc ? { description: p.desc } : {}),
            geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
            ...(p.kakaoId ? { sameAs: `https://place.map.kakao.com/${p.kakaoId}` } : {}),
            ...(p.dog === true && !p.dogRule ? { petsAllowed: true } : {})
          }
        }))
      },
      {
        "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "쉼,표", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: `${name} 하루 코스`, item: url }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- tools/build-pages.js로 만든 파일이에요. 손으로 고치지 말고 스크립트를 다시 돌려요. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(`${name} 하루 여행 코스 · 쉼,표`)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og.png?v=2">
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1f7a5a">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%231f7a5a'/><circle cx='68' cy='36' r='16' fill='%23f2a541'/><path d='M0 66 Q25 56 50 66 T100 66 V100 H0Z' fill='%23e3f1ea'/></svg>">
<script type="application/ld+json">
${JSON.stringify(ld, null, 1).replace(/</g, "\\u003c")}
</script>
<style>
  :root { --bg: #f6f4ef; --card: #ffffff; --text: #1f2421; --muted: #6b716d; --line: #e2ded5; --accent: #1f7a5a; --accent-soft: #e3f1ea; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg: #161917; --card: #20241f; --text: #eceee9; --muted: #a2a8a3; --line: #343a35; --accent: #5fc79d; --accent-soft: #1d3329; }
  }
  :root[data-theme="dark"] { --bg: #161917; --card: #20241f; --text: #eceee9; --muted: #a2a8a3; --line: #343a35; --accent: #5fc79d; --accent-soft: #1d3329; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; font-size: 16px; line-height: 1.6; word-break: keep-all; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 20px 16px 48px; }
  a { color: var(--accent); }
  .top { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
  .top a { text-decoration: none; }
  h1 { font-size: 26px; line-height: 1.3; margin: 20px 0 8px; }
  h2 { font-size: 19px; margin: 28px 0 8px; }
  .lead { margin: 0 0 14px; }
  .facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
  .facts div { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 10px; text-align: center; }
  .facts b { display: block; font-size: 20px; }
  .facts span { color: var(--muted); font-size: 13px; }
  @media (max-width: 480px) { .facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .cta { display: flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 14px; background: var(--accent); color: var(--bg); font-weight: 700; font-size: 17px; text-decoration: none; margin: 16px 0; }
  .zone-cta { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border: 1px solid var(--accent); border-radius: 20px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 0 0 8px; }
  ul.places { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  @media (min-width: 720px) { ul.places { grid-template-columns: 1fr 1fr; } }
  .place { display: flex; gap: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 12px; }
  .ticon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); font-size: 22px; flex: none; }
  .pname { font-weight: 700; }
  .pname a { color: var(--text); text-decoration: none; }
  .pdesc { font-size: 15px; color: var(--muted); }
  .pbadges { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .pbadges span { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); }
  .others { display: flex; flex-wrap: wrap; gap: 8px; }
  .others a { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; text-decoration: none; color: var(--text); }
  .muted { color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><a href="/">쉼,표</a><a href="${appUrl}">코스 짜기 →</a></div>
  <h1>${esc(name)} 하루 여행 코스</h1>
  <p class="lead">${esc(name)} 장소 ${places.length}곳 중에서, 누구랑(반려견·아이·휠체어·혼자) 어떻게(${esc(moves)}) 다니는지에 맞춰 운영시간과 이동 시간을 따진 하루 코스를 짜 드려요.</p>
  <div class="facts">
    <div><b>${places.length}</b><span>장소</span></div>
    <div><b>${dog}</b><span>반려견 동반</span></div>
    <div><b>${stroller}</b><span>유모차 OK</span></div>
    <div><b>${stepFree}</b><span>계단 없음</span></div>
  </div>
  <a class="cta" href="${appUrl}">내 조건으로 ${esc(r.name)} 코스 짜기</a>
  ${sections.map((s) => `<h2>${esc(s.title)} <span class="muted">${s.items.length}곳</span></h2>
  ${s.cta ? `<a class="zone-cta" href="${s.cta}">${esc(s.title)} 코스 짜기 →</a>` : ""}
  <ul class="places">${[...s.items].sort(sortByType).map(placeItem).join("")}</ul>`).join("\n  ")}
  <h2>다른 지역</h2>
  <div class="others">${others.map((x) => `<a href="/course/${slugOf(x)}/">${esc(fullName(x))}</a>`).join("")}</div>
  <p class="muted" style="margin-top:28px">장소 정보는 ${date ? `${date}에 ` : ""}카카오맵 장소 페이지·한국관광공사 자료 등을 보고 정리했어요. 운영시간·쉬는 날은 바뀔 수 있어서, 코스 화면에서 날짜에 맞춰 확인해 드려요. "(후기)"는 서로 다른 후기 2건 이상으로 확인한 정보예요.<br><a href="/privacy.html">개인정보처리방침</a></p>
</div>
<script>
// 방문 통계: 실제 주소에서만 켜요 (privacy.html)
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
if (location.hostname === "swimpyonote.com") {
  const ga = document.createElement("script");
  ga.async = true; ga.src = "https://www.googletagmanager.com/gtag/js?id=G-XVVHZGMMPQ";
  document.head.append(ga);
  gtag("js", new Date());
  gtag("config", "G-XVVHZGMMPQ");
}
</script>
</body>
</html>
`;
}

const urls = [{ loc: `${SITE}/`, lastmod: today }];
for (const r of REGIONS) {
  const { places, date } = loadPlaces(r);
  const dir = path.join(ROOT, "course", slugOf(r));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(r, places, date));
  urls.push({ loc: `${SITE}/course/${slugOf(r)}/`, lastmod: date ?? today });
  console.log(`course/${slugOf(r)}/ — ${fullName(r)} ${places.length}곳`);
}
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`);
console.log(`sitemap.xml — 주소 ${urls.length}개`);
