// 장소 데이터 · 제주 애월 (2026-10-22 인터넷에서 찾아 정리, 아직 직접 확인 안 함)
//
// 한 장소 = 아래 칸들을 가진 묶음 하나.
// true = 돼요 / false = 안 돼요 / null = 확인 필요 (모르면 꼭 null로 두기)
//
//   id            겹치지 않는 영어 이름
//   name          장소 이름
//   type          "식당" | "카페" | "볼거리" | "공원" | "쇼핑"
//   stayMin       머무는 시간(분) — 코스 짤 때 쓰는 대략 값
//   cost          1인 예상 비용(원). 무료면 0 (모르면 null)
//   open, close   운영시간 "HH:MM" (24시간이면 "00:00", "24:00" / 모르면 null)
//   closedDays    쉬는 요일 예: ["월"]. 쉬는 날 없으면 [] (모르면 null)
//   lat, lng      위치 (모르면 null → 코스에서 빠져요)
//   dog           반려견 들어가도 돼요?
//   stroller      유모차 다닐 수 있어요?
//   stepFree      계단 없이 들어갈 수 있어요? (휠체어·어르신)
//   solo          혼자 가기 좋아요?
//   station       가까운 정류장과 걸어서 몇 분 (모르면 null)
//   bikeRack      자전거 세울 곳 있어요?
//   evChargerMin  가장 가까운 전기차 충전소까지 몇 분 (모르면 null)
//   parking       주차돼요?
//   note          메모
//   sources       정보를 찾은 곳 (주소)
//
// 위치(lat, lng)는 OpenStreetMap에서 찾았어요. "관광공사 반려동물 API"라고 적힌 곳은 그 API의 위치예요.
// 관광공사 반려동물 API: 한국관광공사_반려동물_동반여행_서비스 (공공데이터포털, 2026-10-23 조회)

const START = { name: "애월읍사무소 정류장", lat: 33.4626, lng: 126.3303 };

const PLACES = [
  {
    id: "handam-trail", name: "한담해안산책로", type: "공원",
    stayMin: 40, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.45947, lng: 126.31050,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월항~곽지해변 약 1.2km 보행 전용 산책로. 무료는 공공 산책로라서 그렇게 봤어요.",
    sources: ["https://www.telltrip.com/domestic-travel/jeju-aewol-handam-coastal-walking-trail/"]
  },
  {
    id: "gwakji-beach", name: "곽지해수욕장", type: "공원",
    stayMin: 50, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.45596, lng: 126.30650,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "해수욕장 개장 기간(2025년 6/24~8/31, 10~19시) 말고는 운영시간 확인 필요.",
    sources: []
  },
  {
    id: "gonae-port", name: "고내포구", type: "볼거리",
    stayMin: 30, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.46710, lng: 126.33718,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "고내포구 정류장 (걸어서 몇 분인지 확인 필요)", bikeRack: null, evChargerMin: null, parking: null,
    note: "위치는 '고내포구' 버스 정류장 기준이에요.",
    sources: []
  },
  {
    id: "hangpaduri", name: "항파두리 항몽유적지", type: "볼거리",
    stayMin: 60, cost: 0, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.45204, lng: 126.40754,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "무료·연중무휴·주차 가능. 운영시간이 출처마다 달라요(09~18시, 입장 17:30까지 / 다른 곳은 10~17시). 공식 홈페이지 jeju.go.kr/hangpadori, 064-710-6726",
    sources: ["https://xn--ok0b236bp0a.com/place/8169", "https://www.ktriptips.com/kor/tourspot/128050"]
  },
  {
    id: "saebyeol-oreum", name: "새별오름", type: "공원",
    stayMin: 80, cost: 0, open: "00:00", close: "24:00", closedDays: [],
    lat: 33.36625, lng: 126.35769,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "상시 개방·무료·주차 가능. 반려견: 전 구역·전 견종 가능, 목줄 필수, 맹견은 입마개, 배변봉투 지참(관광공사, 2026-07 수정). 정상까지 약 20분, 한 바퀴 1시간~1시간 30분(후기).",
    sources: ["관광공사 반려동물 API 572973", "https://xn--ok0b236bp0a.com/place/7871", "https://www.telltrip.com/domestic-travel/saebyeol-oreum-autumn-silver-grass/"]
  },
  {
    id: "dochidol-alpaca", name: "도치돌 알파카목장", type: "볼거리",
    stayMin: 60, cost: null, open: "10:00", close: "18:00", closedDays: [],
    lat: 33.40972, lng: 126.36676,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "도치돌길 303. 2/15~11월 10:00~18:00, 12월~2/14 09:30~17:30, 입장 17:00까지, 연중무휴(인스타 공지 따로). 반려견: 9kg 이하만, 목줄 하고 안아서, 알파카 울타리 안은 안 돼요(관광공사, 2026-10 수정). 입장료 확인 필요. 0507-1361-6694",
    sources: ["관광공사 반려동물 API 2751854"]
  },
  {
    id: "981-park", name: "9.81 파크 제주", type: "볼거리",
    stayMin: 120, cost: null, open: null, close: null, closedDays: null,
    lat: 33.39006, lng: 126.36652,
    dog: false, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "천덕로 880-24. 반려견은 토요일 16:00 티켓만 13kg 이하·목줄·카트는 하네스(관광공사, 2025-11 수정) → 그 외에는 안 돼요로 넣었어요. 운영시간·요금 확인 필요.",
    sources: ["관광공사 반려동물 API 2609373"]
  },
  {
    id: "gyulgyul-store", name: "귤귤스토어 애월점", type: "쇼핑",
    stayMin: 30, cost: 0, open: "09:00", close: "19:00", closedDays: [],
    lat: 33.46328, lng: 126.30992,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로1길 24-13 (카페 봄날 근처). 공예품·기념품. 매일 09~19시. 반려견 전 구역 가능(관광공사, 2026-07 수정). 비용 0은 구경만 할 때예요.",
    sources: ["관광공사 반려동물 API 4013228"]
  },
  {
    id: "lifework-aewol", name: "라이프워크 메가스토어 애월점", type: "쇼핑",
    stayMin: 30, cost: 0, open: "10:00", close: "20:00", closedDays: [],
    lat: 33.46646, lng: 126.33368,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월해안로 202. 옷·식료품. 매일 10~20시, 화장실 있음. 반려견 전 구역 가능(관광공사, 2026-03 수정). 064-799-9098",
    sources: ["관광공사 반려동물 API 4026851"]
  },
  {
    id: "lovely-jeju", name: "러블리제주", type: "쇼핑",
    stayMin: 30, cost: 0, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.48195, lng: 126.37522,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월해안로 686. 기념품·특산품. 매일 10~19시, 화장실 있음. 반려견 전 구역 가능(관광공사, 2026-03 수정). 064-747-9650",
    sources: ["관광공사 반려동물 API 4013229"]
  },
  {
    id: "geumsan-park", name: "금산공원 (납읍 난대림)", type: "공원",
    stayMin: 40, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.43368, lng: 126.33093,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "천연기념물 난대림. 무료·24시간이라는 정보는 2004년 기사라서 지금도 그런지 확인 필요.",
    sources: ["https://www.khan.co.kr/article/200412231602091/amp"]
  },
  {
    id: "bomnal-cafe", name: "카페 봄날", type: "카페",
    stayMin: 50, cost: null, open: "09:00", close: "21:30", closedDays: [],
    lat: 33.46253, lng: 126.30960,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월로1길 25. 매일 09:00~21:30(주문 21:00까지), 연중무휴(소개 글 기준). 0507-1494-4999",
    sources: ["https://www.trvlogue.com/ko/bomnal-cafe-aewol-jeju", "https://www.ktriptips.com/kor/food/3080165"]
  },
  {
    id: "blissful-jeju", name: "블리스풀 제주", type: "카페",
    stayMin: 60, cost: 5000, open: null, close: null, closedDays: ["금"],
    lat: 33.40499, lng: 126.40720,
    dog: true, stroller: null, stepFree: true, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "산록서로 383 1동 1층. 애견카페(소형견·대형견 구분된 잔디 운동장). 카카오맵(2026-10-23, 사업자 인증 매장): 반려동물 동반, 무료 주차, 매주 금요일 휴무, '계절마다 운영시간 다름', 아메리카노 5,000원, 064-799-8596. 구글 지도: 휠체어 이용 가능 출입구. 운영시간은 블로그(2026-02)에 11:30~17:30이라는 글만 있어서 확인 필요. 운동장 이용료 따로 있는지 확인 필요. 위치는 구글 플러스코드 8Q58CC34+XVW 기준.",
    sources: ["https://place.map.kakao.com/1986467457", "https://maps.app.goo.gl/6wXE9Z3ScsMB4aMu6"]
  },
  {
    id: "eondeokjip-guksu", name: "언덕집국수", type: "식당",
    stayMin: 40, cost: 10000, open: "08:00", close: "16:00", closedDays: [],
    lat: null, lng: null,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월해안로 494(블로그 기준). 매일 08~16시, 주문 15시까지. 고기국수 1만 원. 위치 확인 필요.",
    sources: ["https://www.trvlogue.com/ko/ondeokjip-guksu-jeju-aewol"]
  },
  {
    id: "paul-cafe", name: "폴카페", type: "카페",
    stayMin: 50, cost: null, open: null, close: null, closedDays: null,
    lat: null, lng: null,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월읍 하광로. 반려견 목줄 필수, 10kg 넘는 개는 야외 자리만(소개 글 기준). 위치·운영시간 확인 필요.",
    sources: []
  },
  {
    id: "aewol-the-sunset", name: "애월 더선셋", type: "카페",
    stayMin: 60, cost: null, open: null, close: null, closedDays: null,
    lat: null, lng: null,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "바다 보이는 브런치 카페. 반려견 동반은 장소 정보 사이트 표시 기준. 위치·운영시간 확인 필요.",
    sources: ["https://polle.com/place/2A8Nje/%EC%95%A0%EC%9B%94%20%EB%8D%94%EC%84%A0%EC%85%8B"]
  }
];
