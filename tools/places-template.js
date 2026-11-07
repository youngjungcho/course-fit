// 장소 데이터 · ○○ (YYYY-MM-DD 정리, 아직 직접 확인 안 함)
// 새 지역을 만들 때 이 파일을 regions/<지역 id>/places.js로 복사해서 채워요. (tools/README.md 순서대로)
// 칸 설명은 regions/aewol/places.js 맨 위를 보세요. 모르면 꼭 null.
// 운영시간·시설: 카카오맵 장소 페이지(YYYY-MM-DD 읽음)를 먼저 쓰고, 없으면 한국관광공사 API를 써요.
// 후기로 아는 값은 서로 다른 글 2건 이상이 같을 때만, 최근 2년 글만 (dogReview·strollerReview: true 표시).
// 휠체어(stepFree)는 후기로 채우지 않아요. 네이버 지도는 읽지 않아요(블로그 후기는 괜찮아요).

// 해안선 양 끝 두 점. 이 선에서 2.5km 넘게 떨어지면 '산 쪽'으로 봐요 (화면이 꼭 두 점을 써요.
// 바다가 없는 지역은 index.html의 바다/산 구분부터 고쳐야 해요)
const COASTLINE = [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }];

// 출발 장소. 첫 번째는 꼭 id "airport" (그 지역의 대표 역·공항 — regions.js의 hub가 써요)
const STARTS = [
  { id: "airport", emoji: "🚆", label: "○○역", name: "○○역", lat: 0, lng: 0 },
  { id: "downtown", emoji: "🏠", label: "시내 근처", name: "시내 근처", lat: 0, lng: 0 }
];

const PLACES = [
  {
    id: "example-cafe", name: "예시 카페", type: "카페",
    desc: "바다가 보이는 2층 카페",
    stayMin: 50, cost: 7000, open: "10:00", close: "21:00", closedDays: [],
    lastOrder: "20:30",
    lat: 0, lng: 0,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    kakaoId: null,
    note: "주소. 카카오맵(YYYY-MM-DD): 읽은 내용 그대로 짧게.",
    sources: ["https://place.map.kakao.com/번호"]
  }
];
