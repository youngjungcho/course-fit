// 카카오맵 장소 페이지 읽기 (안내원이 크롬에서 쓰는 코드)
//
// 쓰는 법 (Claude in Chrome):
//   1. 크롬 탭을 https://place.map.kakao.com/ 의 아무 장소 페이지로 열어요 (같은 사이트 안에서만 돼요)
//   2. 이 파일 내용을 javascript_tool로 한 번 실행해요 (window.readPlace, window.readMany가 생겨요)
//   3. await readMany(["28082185", "1365667514"]) 처럼 장소 번호 목록을 넘겨요. 8곳씩 동시에 읽어요
//   4. 오래 걸리면(뒤쪽 탭은 크롬이 느리게 돌려요) window.__kakao 에 쌓이는 결과를 나눠서 받아요
//
// 돌려주는 것: { id, ok, closed, hours, fac, pet }
//   closed  폐업·휴업·임시휴무 표시가 있으면 그 글
//   hours   "영업정보"를 펼친 요일별 시간·브레이크타임·라스트오더 (한 줄로)
//   fac     "시설정보" 칸 (반려동물 동반, 주차, 유아의자 등)
//   pet     위쪽(후기 앞)에서 반려·애견·펫이 들어간 줄
//
// 지키는 것: 페이지를 사람이 보는 그대로 읽기만 해요. 카카오 내부 API를 직접 부르지 않아요.
// 후기·별점은 자료로 쓰지 않아요(사실 정보만). 네이버 지도는 읽지 않아요.
window.readPlace = async (id) => {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;left:-9999px;width:800px;height:900px";
  f.src = "/" + id;
  document.body.append(f);
  let t = "";
  for (let i = 0; i < 48; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { t = f.contentDocument?.body?.innerText ?? ""; } catch { t = ""; break; }
    if (t.includes("전체 후기") || (i > 24 && t.includes("장소 기본 정보"))) break;
  }
  // 영업정보 펼치기
  try {
    const b = [...f.contentDocument.querySelectorAll("button, a")].find((x) => x.textContent.trim() === "펼치기");
    if (b) { b.click(); await new Promise((r) => setTimeout(r, 500)); t = f.contentDocument.body.innerText; }
  } catch {}
  f.remove();
  const cut = t.indexOf("전체 후기");
  const head = cut > 0 ? t.slice(0, cut) : t.slice(0, 5000);
  const s = head.indexOf("영업정보");
  const ends = ["수정제안", "URL", "주소"].map((k) => head.indexOf(k, s + 4)).filter((x) => x > 0);
  const hours = s < 0 ? "" : head.slice(s + 4, ends.length ? Math.min(...ends) : s + 600).split("\n").join(" ").replace(/\(\d+\/\d+\)/g, "").replace(/접기|펼치기/g, "").replace(/\s+/g, " ").trim();
  // 시설정보 칸은 뒤에 붙는 방문자 그래프·통계 글자 앞에서 잘라요
  const i = head.indexOf("시설정보");
  const facEnds = ["kanana", "방문자", "데이터", "통계", "그래프", "수정제안"].map((k) => head.indexOf(k, i + 4)).filter((x) => x > i);
  const fac = i < 0 ? "" : head.slice(i + 4, facEnds.length ? Math.min(...facEnds, i + 160) : i + 120).split("\n").filter(Boolean).join("|");
  const pet = head.split("\n").filter((l) => /반려|애견|펫|강아지/.test(l)).slice(0, 3).join(" / ").slice(0, 160);
  const closed = (head.slice(0, 800).match(/[^\n]*(폐업|휴업|영업종료|임시휴무)[^\n]*/) ?? [""])[0];
  return { id, ok: head.includes("장소 기본 정보"), closed, hours, fac, pet };
};
window.readMany = async (ids, workers = 8) => {
  window.__kakao = window.__kakao || {};
  const queue = ids.filter((id) => !window.__kakao[id]);
  let k = 0;
  const run = async () => { while (k < queue.length) { const id = queue[k++]; try { window.__kakao[id] = await readPlace(id); } catch (e) { window.__kakao[id] = { id, ok: false, err: String(e) }; } } };
  await Promise.all(Array.from({ length: workers }, run));
  return ids.map((id) => window.__kakao[id]);
};
"readPlace, readMany 준비됐어요";
