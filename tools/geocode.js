// 주소 → 위치(위도·경도): 행정안전부 도로명주소 API (공공데이터). 카카오 좌표를 저장하지 않으려고 써요.
//   node tools/geocode.js "경상북도 경주시 불국로 385" ["다른 주소" …]
// .env에 JUSO_SEARCH_KEY(도로명주소 검색 API)와 JUSO_COORD_KEY(좌표제공 검색 API)가 있어야 해요 (business.juso.go.kr).
// 짧은 시간에 많이 부르면 막혀서 1.2초씩 쉬어요.
const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const SK = env.match(/^JUSO_SEARCH_KEY=(.*)$/m)?.[1]?.trim(), CK = env.match(/^JUSO_COORD_KEY=(.*)$/m)?.[1]?.trim();
if (!SK || !CK) { console.error(".env에 JUSO_SEARCH_KEY와 JUSO_COORD_KEY를 넣어 주세요"); process.exit(1); }
// UTM-K(GRS80, EPSG:5179) → WGS84 위경도 (가우스-크뤼거 역변환)
function utmkToWgs(x, y) {
  const a = 6378137, f = 1 / 298.257222101, k0 = 0.9996, lat0 = 38 * Math.PI / 180, lon0 = 127.5 * Math.PI / 180, FE = 1000000, FN = 2000000;
  const e2 = 2 * f - f * f, ep2 = e2 / (1 - e2);
  const M = (phi) => a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi) - (35 * e2 ** 3 / 3072) * Math.sin(6 * phi));
  const m = M(lat0) + (y - FN) / k0;
  const mu = m / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const C1 = ep2 * Math.cos(phi1) ** 2, T1 = Math.tan(phi1) ** 2, N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2), R1 = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const D = (x - FE) / (N1 * k0);
  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * ep2) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * ep2 - 3 * C1 ** 2) * D ** 6 / 720);
  const lon = lon0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * ep2 + 24 * T1 ** 2) * D ** 5 / 120) / Math.cos(phi1);
  return { lat: lat * 180 / Math.PI, lng: lon * 180 / Math.PI };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const kw of process.argv.slice(2)) {
    await wait(1200);
    const j = await (await fetch(`https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${encodeURIComponent(SK)}&currentPage=1&countPerPage=1&keyword=${encodeURIComponent(kw)}&resultType=json`)).json();
    const x = j.results?.juso?.[0];
    if (!x) { console.log(`${kw} → 주소를 못 찾았어요 (${j.results?.common?.errorMessage ?? ""})`); continue; }
    await wait(1200);
    const c = (await (await fetch(`https://business.juso.go.kr/addrlink/addrCoordApi.do?confmKey=${encodeURIComponent(CK)}&admCd=${x.admCd}&rnMgtSn=${x.rnMgtSn}&udrtYn=${x.udrtYn}&buldMnnm=${x.buldMnnm}&buldSlno=${x.buldSlno}&resultType=json`)).json()).results?.juso?.[0];
    if (!c?.entX) { console.log(`${kw} → ${x.roadAddr} (좌표 없음)`); continue; }
    const w = utmkToWgs(+c.entX, +c.entY);
    console.log(`${kw} → ${x.roadAddr} | lat: ${w.lat.toFixed(5)}, lng: ${w.lng.toFixed(5)}`);
  }
})();
