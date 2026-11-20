# 쉼,표 (swimpyonote.com) 작업 규칙

누구랑·어떻게 다니는지 고르면 하루 여행 코스를 짜 주는 정적 사이트예요. GitHub Pages로 나가서, `main`에 올라가면 몇 분 뒤 사이트가 바뀌어요.
이 컴퓨터에서든 클라우드(claude.ai/code)에서든 아래 규칙을 지켜요.

## 말하기
- **쉬운 한국어 존댓말**로만 답해요. 영어로 답하지 않아요. 어려운 말은 풀어서 써요.
- 커밋 메시지·보고서·코드 주석도 한국어로 써요.

## 커밋·올리기
- 커밋과 push는 **사용자가 "커밋하고 올려"(또는 "커밋해 줘")라고 할 때만** 해요. 다 고쳐도 먼저 무엇을 바꿨는지 알리고 기다려요.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 붙여요.
- `git add -A`나 `git add .`은 쓰지 않아요. 내가 고친 파일만 골라 넣어요(같은 폴더에서 홍보 작업이 함께 돌 수 있어요 — `marketing/`, `.claude/commands/insta.md`는 홍보 담당 몫이에요).
- 올리기 전에 `bash tools/ci-check.sh`가 "모두 통과"여야 해요. 장소 안내 페이지(`course/`)가 바뀌었으면 먼저 스테이징해요.
- 화면(`index.html`)이나 지역 자료(`regions/…`)를 바꾸면 `index.html`의 `REGION_VERSION`과 `sw.js`의 `VERSION`을 같은 새 값으로 올려요(예: `20261120a` → 같은 날 다음은 `b`).
- 올린 뒤에는 사이트에 새 버전이 떴는지 확인해요: `curl -s https://swimpyonote.com/sw.js | grep VERSION`

## 열쇠(키)
- 열쇠는 `.env`(git에 안 올림)나 클라우드 환경 변수에만 둬요. 값을 화면에 찍거나 커밋하거나, 사용자에게 채팅으로 붙여 달라고 하지 않아요.
- 쓰는 이름: `DATA_GO_KR_KEY`, `KAKAO_REST_KEY`, `KAKAO_JS_KEY`, `ORS_KEY`, `JUSO_SEARCH_KEY`, `JUSO_COORD_KEY`
- 바깥 서비스에 요청할 때 사용자 이메일을 넣지 않아요. User-Agent는 `swimpyo-course-builder/1.0 (static travel site)`.

## 자료 규칙 (가장 중요)
자세한 건 `tools/AGENT_RULES.md`에 있어요. 꼭 지킬 것만:
- **모르면 null.** 지어내지 않아요.
- **카카오 로컬 API 결과는 장소 번호(`kakaoId`)만 저장해요.** 카카오 좌표·주소는 저장하지 않아요(카카오 정책). 카카오 사진·별점·후기·리뷰 수도 가져오지 않아요.
- 위치는 한국관광공사 → 도로명주소(`node tools/geocode.js "주소"`) → OpenStreetMap 순서로 써요.
- 후기로 아는 값은 서로 다른 최근 2년 글 2건 이상이 같을 때만. **휠체어(stepFree)는 후기로 채우지 않아요.**
- 네이버 지도는 읽지 않아요. 카카오 내부 API를 직접 부르지 않아요.

## 어디에 뭐가 있나
- `index.html` 화면 전체(코스 짜는 계산 포함), `regions.js` 지역 목록, `regions/<지역>/places.js` 장소, `travel.js` 이동 시간표, `stops.json` 지도 정류장
- `tools/README.md` 도구 사용법(새 지역 넣는 순서, 이동 시간표, 버스 표), `tools/AGENT_RULES.md` 자료 규칙
- `주간점검_사용법.txt` 사용자용 사용법(주간 점검·인스타)

## 클라우드(claude.ai/code)에서 할 때
- 되는 일: 화면·기능·문구 고치기, 장소 칸 고치기, 검사(`tools/ci-check.sh`, `node tools/check.js`), 버스 표 다시 계산(`node tools/transit-fetch.js` → `node tools/transit.js`, 열쇠가 환경 변수에 있어야 해요)
- 안 되는 일(사용자 컴퓨터가 필요해요): 카카오맵 장소 페이지 읽기(크롬 확장), 차·걷기·자전거 이동 시간 계산(`tools/osrm-data` 지도 자료 약 8GB가 컴퓨터에만 있어요), 주간 점검(`/weekly`)
  — 이런 부탁을 받으면 "컴퓨터를 켤 때 해야 해요"라고 알려 줘요. 장소를 더하거나 빼는 일도 이동 시간표가 필요해서 컴퓨터에서 해요.
- 클라우드는 작업마다 새 가지를 만들 수 있어요. 사용자가 "올려"라고 하면 `main`에 합쳐서 올리는지, PR로 둘지 한 번 물어봐요.
