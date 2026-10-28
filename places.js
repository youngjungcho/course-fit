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
//   lastOrder     식당·카페 마지막 주문 "HH:MM" (메모에 적은 관광공사·카카오맵 정보에서. 없으면 칸 없음 → 식당은 닫기 1시간 전, 카페는 30분 전으로 어림)
//   closedDays    쉬는 요일 예: ["월"]. 쉬는 날 없으면 [] (모르면 null)
//   hoursByDay    요일마다 시간이 다르면 그 요일만 따로 예: { "토": ["10:00", "15:30"] }. 없으면 안 써도 돼요
//   beachSeason   해수욕장 개장 기간 ["MM-DD", "MM-DD"]. 그 밖에는 산책·노을만 (없으면 안 써도 돼요)
//   seasonalHours 계절마다 운영시간이 달라요 (true면 화면에 확인하라고 띄워요)
//   breaks        쉬는 시간(브레이크 타임) 예: [["15:00", "16:00"]]. 없으면 이 칸을 안 써도 돼요
//   lat, lng      위치 (모르면 null → 코스에서 빠져요)
//   dog           반려견 들어가도 돼요?
//   stroller      유모차 다닐 수 있어요?
//   stepFree      계단 없이 들어갈 수 있어요? (휠체어·어르신)
//   solo          혼자 가기 좋아요?
//   station       가까운 정류장과 걸어서 몇 분 (모르면 null)
//   bikeRack      자전거 세울 곳 있어요?
//   evChargerMin  가장 가까운 전기차 충전소까지 걸어서 몇 분 (모르면 null)
//   parking       주차돼요?
//   kakaoId       카카오맵 장소 번호 (place.map.kakao.com/번호). 모르면 null
//   note          메모
//   sources       정보를 찾은 곳 (주소)
//
// 위치(lat, lng)는 OpenStreetMap에서 찾았어요. "관광공사 반려동물 API"라고 적힌 곳은 그 API의 위치예요.
// 관광공사 반려동물 API: 한국관광공사_반려동물_동반여행_서비스 (공공데이터포털, 2026-10-23 조회)
// 관광공사 국문 관광정보 API: 한국관광공사_국문 관광정보 서비스_GW (공공데이터포털, 2026-10-24 조회)
// 관광공사 무장애 여행 정보 API: 한국관광공사_무장애 여행 정보 (공공데이터포털, 2026-10-24 조회)
//   "턱 없음·경사로"가 확인되면 stepFree와 stroller를 true로 넣었어요 (휠체어가 다니면 유모차도 다닐 수 있어서)
// 정류장: OpenStreetMap 버스 정류장 중 가장 가까운 곳 (© OpenStreetMap contributors, 2026-10-24)
// 충전소: 카카오 로컬 API "전기차충전소" 검색에서 숙소 이름이 아닌 가장 가까운 곳 (아파트·학교 등은 일반인이 못 쓸 수도 있어요)
//   걸어서 몇 분은 직선거리 × 1.3 ÷ 분당 75m로 어림했어요
// 휠체어: 구글 지도 정보 탭의 "휠체어 이용가능 입구 있음/없음"(사용자 제보, 2026-10-25)도 썼어요
// 카카오맵: 카카오 로컬 API로 찾고, 장소 페이지(place.map.kakao.com)의 시설정보·메뉴를 직접 읽었어요 (2026-10-24)

// 애월 해안선을 대충 잇는 선 (곽지 → 하귀). 이 선에서 남쪽으로 2.5km 넘게 떨어지면 '산 쪽(중산간)'으로 봐요
const COASTLINE = [{ lat: 33.452, lng: 126.300 }, { lat: 33.493, lng: 126.420 }];

// 출발 장소 (화면 ③에서 골라요. "지금 내 위치"는 화면에서 따로 처리해요)
const STARTS = [
  { id: "airport", emoji: "✈️", label: "제주공항", name: "제주국제공항", lat: 33.50684, lng: 126.49272 },
  { id: "aewol",   emoji: "🏠", label: "애월에 있어요", name: "애월읍사무소 정류장", lat: 33.4626, lng: 126.3303 }
];

const PLACES = [
  {
    id: "handam-trail", name: "한담해안산책로", type: "공원",
    stayMin: 40, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.45947, lng: 126.31050,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "한담동 정류장 걸어서 7분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "23705150",
    note: "애월항~곽지해변 약 1.2km 보행 전용 산책로. 무료는 공공 산책로라서 그렇게 봤어요. 관광공사 무장애 여행 정보(2026-08 수정): 출입구까지·주출입구 턱 없음(휠체어 가능). 한담해변 자료(2026-10)에도 휠체어 이동 가능한 산책로 있음.",
    sources: ["관광공사 무장애 여행 정보 API 2930935", "https://www.telltrip.com/domestic-travel/jeju-aewol-handam-coastal-walking-trail/"]
  },
  {
    id: "gwakji-beach", name: "곽지해수욕장", type: "공원",
    stayMin: 50, cost: 0, open: null, close: null, closedDays: [],
    beachSeason: ["06-24", "08-31"], // 2025년 개장 기간(10~19시). 2026년 날짜는 아직 확인 못 했어요
    lat: 33.45596, lng: 126.30650,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "곽지모우물 정류장 걸어서 6분", bikeRack: null, evChargerMin: 8, parking: true,
    kakaoId: "25022153",
    note: "해수욕장 개장 기간(2025년 6/24~8/31, 10~19시) 말고는 운영시간 확인 필요. 관광공사 무장애 여행 정보(2025-07 수정): 경사로 있음, 장애인 전용 주차구역·화장실 있음. 모래사장 안쪽은 휠체어·유모차가 어려울 수 있어요.",
    sources: ["관광공사 무장애 여행 정보 API 127870"]
  },
  {
    id: "gonae-port", name: "고내포구", type: "볼거리",
    stayMin: 30, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.46710, lng: 126.33718,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "고내포구 정류장 걸어서 1분", bikeRack: null, evChargerMin: 2, parking: null,
    kakaoId: "8175875",
    note: "위치는 '고내포구' 버스 정류장 기준이에요.",
    sources: []
  },
  {
    id: "hangpaduri", name: "항파두리 항몽유적지", type: "볼거리",
    stayMin: 60, cost: 0, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.45204, lng: 126.40754,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "항몽유적지 정류장 걸어서 1분", bikeRack: null, evChargerMin: 2, parking: true,
    kakaoId: "8641860",
    note: "무료·연중무휴·주차 가능. 운영시간이 출처마다 달라요(09~18시, 입장 17:30까지 / 다른 곳은 10~17시). 공식 홈페이지 jeju.go.kr/hangpadori, 064-710-6726 관광공사 무장애 여행 정보(2026-08 수정): 출입구까지·주출입구 턱 없음(휠체어 가능), 휠체어 대여 1대, 유모차 대여 2대, 장애인 주차장·화장실 있음.",
    sources: ["관광공사 무장애 여행 정보 API 128050", "https://xn--ok0b236bp0a.com/place/8169", "https://www.ktriptips.com/kor/tourspot/128050"]
  },
  {
    id: "saebyeol-oreum", name: "새별오름", type: "공원",
    stayMin: 80, cost: 0, open: "00:00", close: "24:00", closedDays: [],
    lat: 33.36625, lng: 126.35769,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "새별오름 정류장 걸어서 15분", bikeRack: null, evChargerMin: 14, parking: true,
    kakaoId: "25274725",
    note: "상시 개방·무료·주차 가능. 반려견: 전 구역·전 견종 가능, 목줄 필수, 맹견은 입마개, 배변봉투 지참(관광공사, 2026-07 수정). 정상까지 약 20분, 한 바퀴 1시간~1시간 30분(후기). 카카오맵 시설정보(2026-10-24): 무료입장, 반려동물 동반, 입구 무료 공용주차장.",
    sources: ["https://place.map.kakao.com/25274725", "관광공사 반려동물 API 572973", "https://xn--ok0b236bp0a.com/place/7871", "https://www.telltrip.com/domestic-travel/saebyeol-oreum-autumn-silver-grass/"]
  },
  {
    id: "dochidol-alpaca", name: "도치돌 알파카목장", type: "볼거리",
    stayMin: 60, cost: 15000, open: "10:00", close: "18:00", closedDays: [],
    lat: 33.40972, lng: 126.36676,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "원동 정류장 걸어서 27분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "1422737411",
    note: "도치돌길 303. 2/15~11월 10:00~18:00, 12월~2/14 09:30~17:30, 입장 17:00까지, 연중무휴(인스타 공지 따로). 반려견: 9kg 이하만, 목줄 하고 안아서, 알파카 울타리 안은 안 돼요(관광공사, 2026-10 수정). 입장료 확인 필요. 0507-1361-6694 입장료: 성인 15,000원(관광 정보 사이트, 2024-07 기준이라 확인 필요).",
    sources: ["https://www.ktriptips.com/ger/tourspot/3336004", "관광공사 반려동물 API 2751854"]
  },
  {
    id: "981-park", name: "9.81 파크 제주", type: "볼거리",
    stayMin: 120, cost: null, open: "09:00", close: "18:20", closedDays: [],
    lat: 33.39006, lng: 126.36652,
    dog: false, stroller: true, stepFree: true, solo: null,
    station: "제주안전체험관 정류장 걸어서 10분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "1868828759",
    note: "천덕로 880-24. 반려견은 토요일 16:00 티켓만 13kg 이하·목줄·카트는 하네스(관광공사, 2025-11 수정) → 그 외에는 안 돼요로 넣었어요. 운영시간·요금 확인 필요. 카카오맵 시설정보(2026-10-24): 장애인 시설, 무료 주차. 관광공사 무장애 여행 정보(2025-11 수정): 수유실 있음(휠체어·유모차 정보는 없음). 카카오맵 영업정보(2026-10-24 확인): 매일 09:00~18:20. 요금은 카카오맵에도 없어서 확인 필요. 카카오맵 태그 #이동약자접근 + 시설정보 장애인 시설, 무장애 자료 수유실 → 계단 없음·유모차 OK로 넣었어요(직접 확인하면 더 좋아요). 입장료 금액은 카카오맵에도 없어요.",
    sources: ["관광공사 무장애 여행 정보 API 2609373", "https://place.map.kakao.com/1868828759", "관광공사 반려동물 API 2609373"]
  },
  {
    id: "gyulgyul-store", name: "귤귤스토어 애월점", type: "쇼핑",
    stayMin: 30, cost: 0, open: "09:00", close: "19:00", closedDays: [],
    lat: 33.46328, lng: 126.30992,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "한담동 정류장 걸어서 5분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "1788852164",
    note: "애월로1길 24-13 (카페 봄날 근처). 공예품·기념품. 매일 09~19시. 반려견 전 구역 가능(관광공사, 2026-07 수정). 비용 0은 구경만 할 때예요. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["관광공사 반려동물 API 4013228"]
  },
  {
    id: "lifework-aewol", name: "라이프워크 메가스토어 애월점", type: "쇼핑",
    stayMin: 30, cost: 0, open: "10:00", close: "20:00", closedDays: [],
    lat: 33.46646, lng: 126.33368,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "고내 지발해변 정류장 걸어서 2분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "1980611222",
    note: "애월해안로 202. 옷·식료품. 매일 10~20시, 화장실 있음. 반려견 전 구역 가능(관광공사, 2026-03 수정). 064-799-9098 구글 지도(2026-10-25): 휠체어 이용가능 입구·주차장 있음 → 계단 없음·유모차 OK로 넣었어요.",
    sources: ["관광공사 반려동물 API 4026851"]
  },
  {
    id: "lovely-jeju", name: "러블리제주", type: "쇼핑",
    stayMin: 30, cost: 0, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.48195, lng: 126.37522,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "서치강물 정류장 걸어서 1분", bikeRack: null, evChargerMin: 13, parking: true,
    kakaoId: "1480956546",
    note: "애월해안로 686. 기념품·특산품. 매일 10~19시, 화장실 있음. 반려견 전 구역 가능(관광공사, 2026-03 수정). 064-747-9650 카카오맵 시설정보(2026-10-24): 반려동물 동반, 장애인 시설(계단 없음인지는 확인 필요), 무료 주차. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/1480956546", "관광공사 반려동물 API 4013229"]
  },
  {
    id: "geumsan-park", name: "금산공원 (납읍 난대림)", type: "공원",
    stayMin: 40, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.43368, lng: 126.33093,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "납읍리 섯잣길 정류장 걸어서 8분", bikeRack: null, evChargerMin: 10, parking: null,
    kakaoId: "8209104",
    note: "천연기념물 난대림. 무료·24시간이라는 정보는 2004년 기사라서 지금도 그런지 확인 필요. 카카오맵 영업정보(2026-10-24 확인): 연중무휴(시간 표시는 없음).",
    sources: ["https://www.khan.co.kr/article/200412231602091/amp"]
  },
  {
    id: "bomnal-cafe", name: "카페 봄날", type: "카페",
    stayMin: 50, cost: null, open: "09:00", close: "21:30", lastOrder: "21:00", closedDays: [],
    lat: 33.46253, lng: 126.30960,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "한담동 정류장 걸어서 5분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "693062983",
    note: "애월로1길 25. 매일 09:00~21:30(주문 21:00까지), 연중무휴(소개 글 기준). 0507-1494-4999 카카오맵(2026-10-24, 사업자 인증 매장): 시설정보 반려동물 동반·장애인 시설(계단 없음인지는 확인 필요). 메뉴 가격은 메뉴판 사진뿐이라 확인 필요. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) (리뷰에 2층 창가 얘기는 있어요) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/693062983", "https://www.trvlogue.com/ko/bomnal-cafe-aewol-jeju", "https://www.ktriptips.com/kor/food/3080165"]
  },
  {
    id: "blissful-jeju", name: "블리스풀 제주", type: "카페",
    stayMin: 60, cost: 5000, open: "10:00", close: "18:00", closedDays: ["금"],
    seasonalHours: true,
    hoursByDay: { "토": ["10:00", "19:00"], "일": ["10:00", "19:00"] },
    lat: 33.40499, lng: 126.40720,
    dog: true, stroller: null, stepFree: true, solo: null,
    station: "새마을금고연수원 정류장 걸어서 22분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "1986467457",
    note: "산록서로 383 1동 1층. 애견카페(소형견·대형견 구분된 잔디 운동장). 카카오맵(2026-10-23, 사업자 인증 매장): 반려동물 동반, 무료 주차, 매주 금요일 휴무, '계절마다 운영시간 다름', 아메리카노 5,000원, 064-799-8596. 구글 지도: 휠체어 이용가능 입구 있음(2026-10-25 다시 확인). 운영시간: 관광공사 국문 관광정보(2025-10 수정)는 평일 10~18시·주말 10~19시, 블로그(2026-02)는 11:30~17:30, 카카오는 '계절마다 다름' → 평일 10~18시, 주말 10~19시(hoursByDay)로 넣었고 계절마다 달라서 확인 필요. 운동장 이용료 따로 있는지 확인 필요. 위치는 구글 플러스코드 8Q58CC34+XVW 기준.",
    sources: ["https://place.map.kakao.com/1986467457", "https://maps.app.goo.gl/6wXE9Z3ScsMB4aMu6"]
  },
  {
    id: "jangin-house", name: "장인의집", type: "식당",
    stayMin: 60, cost: 20000, open: "09:00", close: "22:00", lastOrder: "21:00", closedDays: [],
    lat: 33.46577, lng: 126.32685,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "애월중학교 정류장 걸어서 6분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "215455040",
    note: "애월로19길 31. 만두전골·갈비탕. 주문 21:00까지. 예약 가능. 관광공사 국문 관광정보(2025-06 수정): 09:00~22:00 (마지막 주문 21:00) / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 메뉴(2026-10-24): 버섯 만두전골(1인) 20,000원·해물 28,000원·소갈비해물 38,000원 → 1인 20,000원으로 넣었어요. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석 있음(주차장·화장실은 없음) → 계단 없음·유모차 OK로 넣었어요.",
    sources: ["https://place.map.kakao.com/215455040", "관광공사 국문 관광정보 API 2847672"]
  },
  {
    id: "danso", name: "단소", type: "식당",
    stayMin: 50, cost: 17000, open: "11:00", close: "15:30", lastOrder: "14:50", closedDays: ["일"],
    lat: 33.46445, lng: 126.32264,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "애월중학교 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: false,
    kakaoId: "689714772",
    note: "애월로 139-4. 한상차림·도시락. 주문 14:50까지. 관광공사 국문 관광정보(2025-01 수정): 11:00~15:30 (라스트오더 14:50) / 쉬는 날 매주 일요일. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 반려동물 동반, 유아의자, 주차 공간 없음(근처 주차장 이용). 카카오맵 메뉴(2026-10-24): 단소정식 17,000원, 도시락 10,000~13,000원. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/689714772", "관광공사 국문 관광정보 API 2851913"]
  },
  {
    id: "aewol-twigim", name: "애월튀김간", type: "식당",
    stayMin: 40, cost: 12000, open: "11:00", close: "20:00", closedDays: [],
    lat: 33.46440, lng: 126.31977,
    dog: true, stroller: null, stepFree: false, solo: true,
    station: "애월환승정류장(애월리) 정류장 걸어서 1분", bikeRack: null, evChargerMin: 1, parking: null,
    kakaoId: "19632858",
    note: "애월로 118. 떡볶이·튀김·김밥. 포장 가능. 관광공사 국문 관광정보(2025-09 수정): 11:00~20:00 / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 반려동물 동반, 장애인 시설. 카카오맵 메뉴(2026-10-24): 수제모듬튀김(1인) 12,000원, 국물떡볶이(1인) 5,000원. 태그 #혼밥. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장·화장실 모두 '없음' → 계단 없음은 아니에요(카카오 '장애인 시설' 표시와 달라요).",
    sources: ["https://place.map.kakao.com/19632858", "관광공사 국문 관광정보 API 2780230"]
  },
  {
    id: "simba-curry", name: "심바카레", type: "식당",
    stayMin: 50, cost: 14000, open: "10:00", close: "19:00", lastOrder: "18:30", closedDays: ["수"],
    breaks: [["15:00", "16:00"]],
    lat: 33.46342, lng: 126.31686,
    dog: true, stroller: null, stepFree: null, solo: true,
    station: "신설동 정류장 걸어서 2분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "292550130",
    note: "애월로 87-16. 돈카츠 카레. 15:00~16:00 쉬는 시간. 관광공사 국문 관광정보(2025-06 수정): - 10:00~19:00 - 준비시간 15:00~16:00 - 점심 마지막 주문 14:30 / 저녁 마지막 주문 18:30 / 쉬는 날 매주 수요일. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 태그 #애견동반식당 #혼밥, 소개 '반려견과 함께하는 일식풍 카레', 돈카츠 카레 14,000원. 시설정보 칸에는 반려동물 표시가 없어서 태그 기준이에요. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/292550130", "관광공사 국문 관광정보 API 2852108"]
  },
  {
    id: "aewolri-makguksu", name: "애월리순메밀막국수", type: "식당",
    stayMin: 50, cost: 11000, open: "10:00", close: "20:00", lastOrder: "19:30", closedDays: [],
    lat: 33.46566, lng: 126.31639,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "신설동 정류장 걸어서 3분", bikeRack: null, evChargerMin: 5, parking: true,
    kakaoId: "327549209",
    note: "애월해안로 11. 막국수·평양냉면. 주문 19:30까지. 관광공사 국문 관광정보(2025-06 수정): 10:00~20:00 (마지막 주문 19:30) / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 반려동물 동반, 테라스, 가게 옆 공터 무료 주차. 카카오맵 메뉴(2026-10-24): 비빔막국수·평양냉면 11,000원, 들기름막국수 12,000원. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/327549209", "관광공사 국문 관광정보 API 2864216"]
  },
  {
    id: "goijeong", name: "고이정", type: "식당",
    stayMin: 70, cost: 26000, open: "11:00", close: "24:00", lastOrder: "23:00", closedDays: [],
    lat: 33.45933, lng: 126.31135,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "한담동 정류장 걸어서 6분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "2030021121",
    note: "애월로 6. 흑돼지 근고기. 주문 23:00까지. 관광공사 국문 관광정보(2025-01 수정): 11:00~24:00 (라스트오더 23:00) / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 메뉴(2026-10-24): 숙성가브리살 200g 26,000원, 근고기 600g 72,000원, 김치찌개 7,000원 → 1인 26,000원으로 넣었어요. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/2030021121", "관광공사 국문 관광정보 API 2759061"]
  },
  {
    id: "kkongsuni", name: "꽁순이네", type: "식당",
    stayMin: 40, cost: 10000, open: "10:00", close: "16:30", lastOrder: "16:25", closedDays: ["화"],
    lat: 33.44695, lng: 126.33872,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "처남빌레 정류장 걸어서 2분", bikeRack: null, evChargerMin: 15, parking: true,
    kakaoId: "27174231",
    note: "중산간서로 5642. 고기국수·몸국. 중산간서로 5642. 관광공사 국문 관광정보(2025-06 수정): 10:00~16:30 (마지막 주문 16:25) / 쉬는 날 매주 화요일. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 장애인 시설(계단 없음인지는 확인 필요), 무료 주차. 카카오맵 메뉴(2026-10-24): 고기국수 10,000원, 몸국 12,000원. 태그 #이동약자접근 + 시설정보 장애인 시설이라 계단 없음·유모차 OK로 넣었어요(직접 확인하면 더 좋아요).",
    sources: ["https://place.map.kakao.com/27174231", "관광공사 국문 관광정보 API 2851868"]
  },
  {
    id: "haenyeo-house", name: "해녀의집", type: "식당",
    stayMin: 60, cost: 12000, open: "10:00", close: "20:00", closedDays: ["화"],
    breaks: [["14:00", "15:00"]],
    lat: 33.47841, lng: 126.36694,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "중엄새물 정류장 걸어서 2분", bikeRack: null, evChargerMin: 8, parking: false,
    kakaoId: "9566466",
    note: "애월해안로 591. 전복죽·해산물. 14:00~15:00 쉬는 시간. 관광공사 국문 관광정보(2025-06 수정): 10:00~20:00 (준비시간 14:00~15:00) / 쉬는 날 매주 화요일. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 반려동물 동반, 테라스, 가게 양쪽 몇 대 주차 가능(관광공사 자료는 주차 불가라서 확인 필요). 카카오맵 메뉴(2026-10-24): 전복죽(1인) 12,000원, 모듬메뉴 50,000원. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/9566466", "관광공사 국문 관광정보 API 2852232"]
  },
  {
    id: "jeongjikhan-don", name: "정직한돈 본점", type: "식당",
    stayMin: 70, cost: 30000, open: "15:00", close: "23:00", closedDays: [],
    lat: 33.46740, lng: 126.33900,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "고내포구 정류장 걸어서 3분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "1580336980",
    note: "애월해안로 253. 흑돼지 구이. 관광공사 국문 관광정보(2025-06 수정): 15:00~23:00 / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 메뉴(2026-10-24): 정직한돈세트(2인) 59,000원 → 1인 30,000원으로 넣었어요. 시설정보: 유아의자, 키즈메뉴, 무료 주차. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/1580336980", "관광공사 국문 관광정보 API 2853566"]
  },
  {
    id: "jeremy-cafe", name: "제레미", type: "카페",
    stayMin: 50, cost: 6000, open: "09:00", close: "17:30", lastOrder: "17:10", closedDays: ["일", "월"],
    lat: 33.46455, lng: 126.31852,
    dog: null, stroller: null, stepFree: false, solo: null,
    station: "애월환승정류장(애월리) 정류장 걸어서 1분", bikeRack: null, evChargerMin: 1, parking: false,
    kakaoId: "1170785054",
    note: "애월로 106-1. 핸드드립 커피·토스트. 주문 17:10까지. 관광공사 국문 관광정보(2025-06 수정): 09:00~17:30 (마지막 주문 17:10) / 쉬는 날 매주 일요일, 월요일. 가격 확인 필요. 카카오맵 메뉴(2026-10-24): 핸드드립 커피 6,000원. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/1170785054", "관광공사 국문 관광정보 API 2852155"]
  },
  {
    id: "tribe-cafe", name: "트라이브", type: "카페",
    stayMin: 50, cost: 18000, open: "09:00", close: "21:00", closedDays: [],
    lat: 33.46006, lng: 126.31128,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "한담동 정류장 걸어서 5분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "442131150",
    note: "애월로 11. 수플레. 애월로 11. 관광공사 국문 관광정보(2025-06 수정): 09:00~21:00 / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵 시설정보(2026-10-24): 반려동물 동반, 무료 주차. 카카오맵 메뉴(2026-10-24): 수플레 18,000원, 에이드 7,500원 → 수플레 기준 18,000원. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/442131150", "관광공사 국문 관광정보 API 2861940"]
  },
  {
    id: "sunset-cliff", name: "썬셋클리프", type: "카페",
    stayMin: 60, cost: 20000, open: "10:00", close: "22:00", closedDays: [],
    lat: 33.46184, lng: 126.31072,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "한담동 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "611667902",
    note: "애월로1길 19-8. 피자·음료. 관광공사 국문 관광정보(2025-10 수정): 10:00~22:00 / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 테라스·루프탑, 매장 이용 시 애월한담주차장 1시간 무료. 로코모코 20,000원·피자 23,000원. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) (리뷰: 2층 건물, 1층은 바) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/611667902", "관광공사 국문 관광정보 API 2893743"]
  },
  {
    id: "matilda-cafe", name: "마틸다", type: "카페",
    stayMin: 50, cost: 10000, open: "18:00", close: "24:00", closedDays: ["화"],
    lat: 33.46573, lng: 126.33428,
    dog: null, stroller: null, stepFree: false, solo: true,
    station: "고내 지발해변 정류장 걸어서 1분", bikeRack: null, evChargerMin: 2, parking: true,
    kakaoId: "26463066",
    note: "고내1길 33. 밤 카페. 실제로는 새벽 1시까지(주문 00:30). 관광공사 국문 관광정보(2025-06 수정): 18:00~01:00 (마지막 주문 00:30) / 쉬는 날 매주 화요일. 가격 확인 필요. 카카오맵 메뉴(2026-10-24): 칵테일 10,000~13,000원(LP·칵테일바에 가까워요). 태그 #혼술. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/26463066", "관광공사 국문 관광정보 API 2851674"]
  },
  {
    id: "aewol-onuii", name: "애월오누이 제주", type: "식당",
    stayMin: 50, cost: 15000, open: "07:00", close: "20:00", closedDays: [],
    lat: 33.46662, lng: 126.31878,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "애월환승정류장(애월리) 정류장 걸어서 3분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "974387661",
    note: "애월로9길 54. 성게미역국·두루치기·전복돌솥밥 15,000원, 각재기국 10,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 태그 #애견동반식당 #아침식사, 07:00 오픈(닫는 시간·쉬는 날 확인 필요), 064-799-8846. 시설정보 칸에는 반려동물 표시가 없어서 태그 기준이에요. 카카오맵 영업정보(2026-10-24 확인): 매일 07:00~20:00. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/974387661"]
  },
  {
    id: "lee-chunok", name: "이춘옥원조고등어쌈밥 제주애월본점", type: "식당",
    stayMin: 60, cost: 17000, open: "10:00", close: "20:30", lastOrder: "19:30", closedDays: [],
    breaks: [["16:00", "17:00"]],
    lat: 33.48900, lng: 126.41870,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "관전동 정류장 걸어서 1분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "24780480",
    note: "일주서로 7213(하귀 쪽, 애월리에서 차로 15분쯤). 전복뚝배기(1인) 17,000원, 고등어 묵은지찜(2인) 38,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 장애인 시설(계단 없음인지는 확인 필요), 무료 주차, 10:00 오픈·재료 소진 시 조기 마감, 064-799-9914. 카카오맵 영업정보(2026-10-24 확인): 매일 10:00~20:30, 16:00~17:00 브레이크타임, 라스트오더 15:00·19:30. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장·화장실 있음 → 계단 없음·유모차 OK로 넣었어요.",
    sources: ["https://place.map.kakao.com/24780480"]
  },
  {
    id: "doldam-gogi", name: "돌담길괴기집", type: "식당",
    stayMin: 80, cost: 32000, open: "17:00", close: "22:00", closedDays: ["일"],
    lat: 33.44978, lng: 126.30711,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "곽지해수욕장 정류장 걸어서 3분", bikeRack: null, evChargerMin: 2, parking: null,
    kakaoId: "686576469",
    note: "곽지5길 8-11. 흑돼지 오겹살·목살 600g 64,000원(2인 기준으로 1명 32,000원으로 넣었어요), 김치찌개 8,000원, 냉면 7,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 17:00 오픈(닫는 시간·쉬는 날 확인 필요), 010-5647-1107. 카카오맵 영업정보(2026-10-24 확인): 17:00~22:00, 일요일 휴무. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/686576469"]
  },
  {
    id: "bluegrass", name: "블루그라스", type: "식당",
    stayMin: 50, cost: 10800, open: "11:30", close: "15:30", lastOrder: "15:00", closedDays: ["목"],
    hoursByDay: { "토": ["10:00", "15:30"], "일": ["10:00", "15:30"] },
    lat: 33.44745, lng: 126.30924,
    dog: true, stroller: null, stepFree: false, solo: true,
    station: "곽지해수욕장 정류장 걸어서 3분", bikeRack: null, evChargerMin: 7, parking: true,
    kakaoId: "2084120036",
    note: "곽지8길 23-9 (곽지해수욕장 근처). 떡갈비 10,800원, 열무국수 9,500원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 무료 주차, 태그 #혼밥, 10:00 오픈·주문 15:00까지·재료 소진 시 일찍 마감, 070-8806-4479. 카카오맵 영업정보(2026-10-24 확인): 토·일 10:00~15:30, 월·화·수·금 11:30~15:30, 목요일 휴무, 라스트오더 15:00 → 주말은 hoursByDay로 따로 넣었어요. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장·화장실 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/2084120036"]
  },
  {
    id: "eondeokjip-guksu", name: "언덕집국수", type: "식당",
    stayMin: 40, cost: 10000, open: "08:00", close: "16:00", closedDays: [],
    lat: 33.47840, lng: 126.35691,
    dog: null, stroller: null, stepFree: false, solo: true,
    station: "신엄입구 정류장 걸어서 11분", bikeRack: null, evChargerMin: 5, parking: null,
    kakaoId: "571769164",
    note: "애월해안로 494(블로그 기준). 매일 08~16시, 주문 15시까지. 고기국수 1만 원. 위치 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 고기국수·비빔국수·고기국밥 각 10,000원, 태그 #혼밥 #아침식사, 070-8657-3107. 위치는 카카오 기준. 반려동물 표시는 없어요. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/571769164", "https://www.trvlogue.com/ko/ondeokjip-guksu-jeju-aewol"]
  },
  {
    id: "paul-cafe", name: "폴카페", type: "카페",
    stayMin: 50, cost: null, open: null, close: null, closedDays: null,
    lat: null, lng: null,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    kakaoId: null,
    note: "애월읍 하광로. 반려견 목줄 필수, 10kg 넘는 개는 야외 자리만(소개 글 기준). 위치·운영시간 확인 필요. 카카오맵에는 '폴카페 전기차충전소'(하광로 208-22)만 있고 카페는 안 나와서, 지금도 영업하는지 확인 필요. 소상공인 상가정보(2026-06 기준)에는 바로 옆 하광로 208-16에 '워커스폴'(카페)이 있는데 같은 곳인지는 몰라요.",
    sources: []
  },
  {
    id: "aewol-the-sunset", name: "애월 더선셋", type: "카페",
    stayMin: 60, cost: 6500, open: "10:00", close: "19:00", lastOrder: "18:00", closedDays: [],
    lat: 33.45621, lng: 126.30904,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "곽지모우물 정류장 걸어서 6분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "27149644",
    note: "일주서로 6111. 바다 보이는 브런치 카페(치즈 오믈렛 브런치). 관광공사 국문 관광정보(2025-06 수정): 10:00~19:00, 주문 18:20까지, 연중무휴, 주차 가능. 반려견 동반은 장소 정보 사이트 표시 기준이라 확인하면 좋아요. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 시설정보 반려동물 동반·무료 주차 확인, 동절기 10:00~19:00(주문 18:00), 아메리카노 6,500원. 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장·화장실 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/27149644", "관광공사 국문 관광정보 API 2862045", "https://polle.com/place/2A8Nje/%EC%95%A0%EC%9B%94%20%EB%8D%94%EC%84%A0%EC%85%8B"]
  },
  {
    id: "arte-museum", name: "아르떼뮤지엄 제주", type: "볼거리",
    stayMin: 90, cost: 18000, open: "10:00", close: "20:00", closedDays: [],
    lat: 33.39670, lng: 126.34501,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "어음2리 정류장 걸어서 15분", bikeRack: null, evChargerMin: 12, parking: true,
    kakaoId: "1508345156",
    note: "어림비로 478. 미디어아트 실내 전시. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 10:00~20:00(입장 19:00까지), 성인 18,000원, 장애인 시설, 태그 #이동약자접근 #전동휠체어급속충전기, 무료 주차. 1899-5008",
    sources: ["https://place.map.kakao.com/1508345156"]
  },
  {
    id: "jeju-bulbit", name: "제주불빛정원", type: "볼거리",
    stayMin: 60, cost: 12000, open: "17:00", close: "24:00", closedDays: [],
    lat: 33.42229, lng: 126.40918,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "유수암상동 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "891104398",
    note: "평화로 2346. 밤에 보는 빛 정원. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 17:00~24:00(입장 23:00까지, 악천후 시 조기 폐장), 유료(금액 확인 필요), 유모차 가능, 반려동물 동반, 무료 주차. 064-799-6996 입장료: 성인 12,000원·청소년 10,000원·어린이 8,000원(관광공사 기반 정보 사이트, 2025-10 수정이라 확인하면 좋아요).",
    sources: ["https://www.ktriptips.com/kor/tourspot/2479639", "https://place.map.kakao.com/891104398"]
  },
  {
    id: "teseum", name: "테디베어하우스 테지움 제주점", type: "볼거리",
    stayMin: 60, cost: 12500, open: "09:00", close: "19:00", closedDays: [],
    seasonalHours: true,
    lat: 33.41225, lng: 126.39361,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "렛츠런파크 정류장 걸어서 4분", bikeRack: null, evChargerMin: 2, parking: true,
    kakaoId: "11950714",
    note: "평화로 2159. 테디베어 박물관. 카카오맵(2026-10-24, 사업자 인증 매장): 연중무휴 09:00~19:00, 유료(금액 확인 필요), 휠체어 접근·유모차 가능, 수유실, 넓은 주차장. 064-799-4820 관광공사 국문 관광정보(2026-10 수정): 성인 12,500원·청소년 11,500원·어린이 10,500원, 주차 무료, 계절마다 시간 조금 달라요(겨울 09:00~18:30).",
    sources: ["관광공사 국문 관광정보 API 696841", "https://place.map.kakao.com/11950714"]
  },
  {
    id: "pahoihoi", name: "파호이호이 라바필드파크", type: "볼거리",
    stayMin: 90, cost: null, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.44743, lng: 126.37560,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "흥국사 정류장 걸어서 10분", bikeRack: null, evChargerMin: 15, parking: true,
    kakaoId: "902606653",
    note: "중산간서로 5994-47. 용암 지대 테마파크. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 09:00~18:00(입장 17:00까지), 유료(금액 확인 필요), 휠체어 접근·유모차 가능, 입장권 사면 무료 주차. 064-805-5855",
    sources: ["https://place.map.kakao.com/902606653"]
  },
  {
    id: "saebyeol-friends", name: "새별프렌즈", type: "볼거리",
    stayMin: 60, cost: 18000, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.36155, lng: 126.36366,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "새별오름 정류장 걸어서 2분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "336100555",
    note: "평화로 1529. 동물 체험(승마·먹이주기). 카카오맵(2026-10-24, 사업자 인증 매장): 매일 09:00~18:00(입장 17:00까지), 일반 18,000원, 장애인 시설, 태그 #이동약자접근, 무료 주차. 064-794-2828",
    sources: ["https://place.map.kakao.com/336100555"]
  },
  {
    id: "yeonhwa-pond", name: "연화못", type: "공원",
    stayMin: 30, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.45487, lng: 126.34723,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "더럭초등학교 정류장 걸어서 2분", bikeRack: null, evChargerMin: 5, parking: true,
    kakaoId: "11108228",
    note: "하가리 1569-2. 연꽃 연못 산책로(하가리). 카카오맵(2026-10-24): 무료입장, 휠체어 접근·유모차 가능, 반려동물 동반, 무료 주차. 운영시간 표시 없음.",
    sources: ["https://place.map.kakao.com/11108228"]
  },
  {
    id: "sangga-palm", name: "상가리야자숲", type: "공원",
    stayMin: 50, cost: 8000, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.43921, lng: 126.35828,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "존손이굴 정류장 걸어서 26분", bikeRack: null, evChargerMin: 7, parking: true,
    kakaoId: "878819879",
    note: "상가리 536. 야자수 숲 산책. 카카오맵(2026-10-24): 유료입장(금액 확인 필요), 유모차 가능, 반려동물 동반, 무료 주차. 운영시간·쉬는 날 확인 필요. 입장료는 출처마다 5,000~8,000원으로 달라서 높은 쪽(8,000원)으로 넣었어요. 매일 09:00~18:00, 입장 17:00까지(여행 블로그 기준).",
    sources: ["https://www.trvlogue.com/ko/sangari-palm-forest-jeju", "https://place.map.kakao.com/878819879"]
  },
  {
    id: "handam-culture", name: "한담컬쳐", type: "볼거리",
    stayMin: 50, cost: null, open: "09:00", close: "20:00", closedDays: [],
    lat: 33.46242, lng: 126.31065,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "한담동 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "517188017",
    note: "애월로1길 18. 한복·민속놀이 체험(한담 카페거리). 카카오맵(2026-10-24, 사업자 인증 매장): 매일 09:00~20:00, 유료(금액 확인 필요). 주차는 근처 공용주차장(애월한담공원주차장 무료).",
    sources: ["https://place.map.kakao.com/517188017"]
  },
  {
    id: "gueom-saltpan", name: "구엄리 돌염전", type: "볼거리",
    stayMin: 30, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.48344, lng: 126.37647,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "구엄포구 정류장 걸어서 1분", bikeRack: null, evChargerMin: 17, parking: true,
    kakaoId: "22761633",
    note: "구엄리. 바닷가 돌소금밭. 카카오맵(2026-10-24, 사업자 인증 매장): 무료입장, 반려동물 동반, 입구 옆 9대 주차.",
    sources: ["https://place.map.kakao.com/22761633"]
  },
  {
    id: "susanbong", name: "수산봉", type: "공원",
    stayMin: 50, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.47301, lng: 126.38456,
    dog: null, stroller: true, stepFree: null, solo: null,
    station: "모감동 정류장 걸어서 8분", bikeRack: null, evChargerMin: 9, parking: null,
    kakaoId: "7964847",
    note: "수산리 산 1-1. 오름 둘레 산책로(수산리). 카카오맵(2026-10-24): 무료입장, 유모차 가능, 공중화장실.",
    sources: ["https://place.map.kakao.com/7964847"]
  },
  {
    id: "dolphin-view", name: "애월돌고래전망대", type: "볼거리",
    stayMin: 20, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.47857, lng: 126.36354,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "신엄입구 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "25575353",
    note: "신엄리 2731. 바다 전망대(신엄리). 카카오맵(2026-10-24, 사업자 인증 매장): 무료입장, 앞에 주차장(주말엔 부족할 수 있어요).",
    sources: ["https://place.map.kakao.com/25575353"]
  },
  {
    id: "badang-hangeureut", name: "바당한그릇", type: "식당",
    stayMin: 60, cost: 21000, open: "10:30", close: "19:30", closedDays: ["수"],
    breaks: [["14:30", "17:00"]],
    lat: 33.47843, lng: 126.36244,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "신엄입구 정류장 걸어서 2분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "392582130",
    note: "애월해안로 552-3. 물회·해산물. 카카오맵(2026-10-24, 사업자 인증 매장): 10:30~19:30, 14:30~17:00 브레이크타임, 수요일 휴무, 특물회(1인)+소면 21,000원, 반려동물 동반, 유아의자, 넓은 주차장. 064-799-8022 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/392582130"]
  },
  {
    id: "guisai", name: "구이사이식당", type: "식당",
    stayMin: 50, cost: 10000, open: "07:00", close: "23:00", closedDays: ["일"],
    breaks: [["15:00", "17:00"]],
    lat: 33.47221, lng: 126.36854,
    dog: null, stroller: null, stepFree: false, solo: null,
    station: "신엄리 정류장 걸어서 1분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "26417963",
    note: "신엄9길 2. 정식·해장국(아침식사). 카카오맵(2026-10-24, 사업자 인증 매장): 07:00~23:00, 15:00~17:00 브레이크타임, 일요일 휴무, 정식 10,000원, 유아의자. 064-799-9242 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/26417963"]
  },
  {
    id: "ikkan-shita", name: "잇칸시타", type: "식당",
    stayMin: 60, cost: 18000, open: "11:00", close: "20:50", lastOrder: "20:20", closedDays: [],
    lat: 33.47707, lng: 126.37024,
    dog: null, stroller: true, stepFree: true, solo: true,
    station: "중엄새물 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "1365667514",
    note: "신엄안2길 54-1. 일본 가정식. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 11:00~20:50(주문 20:20까지), 텐동정식 18,000원, 태그 #이동약자접근 #혼밥, 유아의자·키즈메뉴, 무료 주차. 064-713-5450",
    sources: ["https://place.map.kakao.com/1365667514"]
  },
  {
    id: "norabah", name: "노라바", type: "식당",
    stayMin: 40, cost: 11000, open: "10:00", close: "17:00", closedDays: [],
    breaks: [["14:00", "15:00"]],
    lat: 33.47776, lng: 126.36488,
    dog: null, stroller: null, stepFree: false, solo: null,
    station: "신엄입구 정류장 걸어서 3분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "26352466",
    note: "애월해안로 570-1. 해물라면. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 10:00~17:00, 14:00~15:00 브레이크타임, 해물라면 11,000원. 064-772-1900 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/26352466"]
  },
  {
    id: "bada-boneun-nal", name: "바다보는날", type: "식당",
    stayMin: 40, cost: 9900, open: "10:00", close: "20:00", closedDays: [],
    breaks: [["15:00", "16:30"]],
    lat: 33.48391, lng: 126.37801,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "구엄포구 정류장 걸어서 2분", bikeRack: null, evChargerMin: 19, parking: null,
    kakaoId: "1099481075",
    note: "애월해안로 722. 해물라면·돈까스. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 10:00~20:00, 15:00~16:30 브레이크타임, 해물듬뿍라면 9,900원. 0507-1352-7411 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/1099481075"]
  },
  {
    id: "modeul-hansang", name: "모들한상", type: "식당",
    stayMin: 60, cost: 17500, open: "11:00", close: "19:00", closedDays: ["수"],
    breaks: [["15:30", "17:00"]],
    lat: 33.45535, lng: 126.34698,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "하가리연못 정류장 걸어서 2분", bikeRack: null, evChargerMin: 6, parking: true,
    kakaoId: "1962005012",
    note: "하가로 180. 고사리 파스타·돈가스. 카카오맵(2026-10-24, 사업자 인증 매장): 11:00~19:00, 15:30~17:00 브레이크타임, 수요일 휴무, 고사리보말파스타 17,500원, 반려동물 동반, 태그 #예스키즈존, 무료 주차. 070-7576-3503 구글 지도(2026-10-25): 휠체어 이용가능 입구 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/1962005012"]
  },
  {
    id: "meat-town", name: "미트타운", type: "식당",
    stayMin: 50, cost: 11500, open: "10:00", close: "21:00", closedDays: [],
    hoursByDay: { "월": ["10:00", "19:00"] },
    lat: 33.47906, lng: 126.39132,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "번대동 정류장 걸어서 1분", bikeRack: null, evChargerMin: 14, parking: null,
    kakaoId: "1986029114",
    note: "일주서로 6935. 수제버거. 카카오맵(2026-10-24, 사업자 인증 매장): 10:00~21:00(월요일은 19:00까지), 미트버거 11,500원, 태그 #애견동반식당 #야외정원(시설정보 칸엔 반려동물 표시 없음). 010-7733-4686 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 있음 → 계단 없음·유모차 OK로 넣었어요.",
    sources: ["https://place.map.kakao.com/1986029114"]
  },
  {
    id: "geumdonga", name: "금돈가 제주 애월해안도로 본점", type: "식당",
    stayMin: 70, cost: 32000, open: "11:00", close: "22:30", lastOrder: "21:30", closedDays: [],
    lat: 33.48430, lng: 126.39113,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "가문동마을길 정류장 걸어서 8분", bikeRack: null, evChargerMin: 9, parking: null,
    kakaoId: "890714292",
    note: "가문동남길 63. 흑돼지 구이. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 11:00~22:30(주문 21:30까지), 근고기 600g 64,000원(2인 기준으로 1명 32,000원), 김치찌개 8,000원, 태그 #애견동반식당(시설정보 칸엔 표시 없음). 010-6870-7679 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/890714292"]
  },
  {
    id: "yoons-grill", name: "윤스그릴", type: "식당",
    stayMin: 70, cost: 18000, open: "18:00", close: "24:00", closedDays: ["일"],
    lat: 33.48205, lng: 126.41356,
    dog: true, stroller: null, stepFree: null, solo: true,
    station: "하귀휴먼시아 2단지 입구 정류장 걸어서 1분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "589379401",
    note: "하광로 42-1. 파스타·술집(저녁). 카카오맵(2026-10-24, 사업자 인증 매장): 18:00~24:00, 일요일 휴무, 전복명란파스타 18,000원, 반려동물 동반, 장애인 시설, 태그 #혼술, 무료 주차. 010-8946-9964 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/589379401"]
  },
  {
    id: "dalja-cafe", name: "달자카페", type: "카페",
    stayMin: 50, cost: 4500, open: "10:00", close: "18:00", closedDays: [],
    lat: 33.48364, lng: 126.37965,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "구엄포구 정류장 걸어서 4분", bikeRack: null, evChargerMin: 18, parking: null,
    kakaoId: "26303350",
    note: "애월해안로 738. 오션뷰 카페. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 10:00~18:00, 아메리카노 4,500원, 태그 #애견동반카페(시설정보 칸엔 표시 없음). 064-744-8877 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/26303350"]
  },
  {
    id: "sogil-dabang", name: "소길다방", type: "카페",
    stayMin: 50, cost: 6500, open: "10:00", close: "18:00", lastOrder: "17:30", closedDays: ["화"],
    lat: 33.43881, lng: 126.37944,
    dog: true, stroller: null, stepFree: false, solo: null,
    station: "소길리사무소 정류장 걸어서 2분", bikeRack: null, evChargerMin: 3, parking: true,
    kakaoId: "2032708564",
    note: "소길2길 45-3. 핸드드립·카이막(소길리). 카카오맵(2026-10-24, 사업자 인증 매장): 10:00~18:00(주문 17:30까지), 화요일 휴무, 핸드드립 6,500원, 반려동물 동반, 무료 주차. 0502-5554-5566 구글 지도(2026-10-25): 휠체어 이용가능 입구·좌석·주차장 없음 → 계단 없음은 아니에요.",
    sources: ["https://place.map.kakao.com/2032708564"]
  },
  {
    id: "aewol-husik", name: "애월후식", type: "카페",
    stayMin: 50, cost: 16000, open: "10:00", close: "18:00", closedDays: ["수"],
    hoursByDay: { "토": ["09:00", "18:00"], "일": ["09:00", "18:00"] },
    lat: 33.43901, lng: 126.33018,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "납읍리사무소 정류장 걸어서 1분", bikeRack: null, evChargerMin: 1, parking: true,
    kakaoId: "2138824476",
    note: "납읍로 21. 수플레 팬케이크(납읍). 카카오맵(2026-10-24, 사업자 인증 매장): 평일 10:00~18:00·주말 09:00~18:00, 수요일 휴무, 디저트 수플레 16,000원, 반려동물 동반, 무료 주차. 0503-7151-4597 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/2138824476"]
  },
  {
    id: "cutiepie-cafe", name: "큐티파이카페", type: "카페",
    stayMin: 50, cost: 6500, open: "08:30", close: "24:00", closedDays: [],
    lat: 33.47788, lng: 126.36862,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "중엄새물 정류장 걸어서 1분", bikeRack: null, evChargerMin: 6, parking: true,
    kakaoId: "419491158",
    note: "애월해안로 610. 오션뷰 브런치 카페. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 08:30~24:00, 아메리카노 6,500원, 반려동물 동반, 장애인 시설, 태그 #이동약자접근, 무료 주차. 064-711-7666",
    sources: ["https://place.map.kakao.com/419491158"]
  },
  {
    id: "siso-kaymak", name: "시소카이막 애월점", type: "카페",
    stayMin: 40, cost: 13000, open: "09:00", close: "19:00", closedDays: [],
    hoursByDay: { "토": ["09:00", "20:00"], "일": ["09:00", "20:00"] },
    lat: 33.47801, lng: 126.36422,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "신엄입구 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "710832152",
    note: "애월해안로 566. 카이막 카페. 카카오맵(2026-10-24, 사업자 인증 매장): 평일 09:00~19:00·주말 09:00~20:00, 시소 카이막 13,000원, 반려동물 동반, 무료 주차. 064-799-0865 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/710832152"]
  },
  {
    id: "noeulri-cafe", name: "노을리카페", type: "카페",
    stayMin: 60, cost: 11000, open: "09:00", close: "21:00", lastOrder: "20:30", closedDays: [],
    lat: 33.47990, lng: 126.37271,
    dog: null, stroller: true, stepFree: true, solo: null,
    station: "서치강물 정류장 걸어서 6분", bikeRack: null, evChargerMin: 8, parking: true,
    kakaoId: "1525547515",
    note: "애월해안로 654. 대형 베이커리 카페. 카카오맵(2026-10-24, 사업자 인증 매장): 매일 09:00~21:00(주문 20:30까지), 노을리 에이드 11,000원, 장애인 시설, 태그 #이동약자접근, 무료 주차. 064-741-5050",
    sources: ["https://place.map.kakao.com/1525547515"]
  },
  {
    id: "windstone", name: "윈드스톤", type: "카페",
    stayMin: 50, cost: 5500, open: "09:00", close: "17:00", closedDays: [],
    hoursByDay: { "일": ["12:00", "17:00"] },
    lat: 33.46048, lng: 126.43609,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "광령초등학교 정류장 걸어서 1분", bikeRack: null, evChargerMin: 5, parking: null,
    kakaoId: "693016371",
    note: "광성로 272. 북카페(독립서점). 카카오맵(2026-10-24, 사업자 인증 매장): 09:00~17:00(일요일 12:00~17:00), 스트롱라떼 5,500원, 반려동물 동반, 테라스, 길 건너 주차장. 휠체어·계단: 구글 지도·카카오 시설정보·카카오 리뷰 모두 단서 없음(2026-10-27) → 전화로 확인해 주세요.",
    sources: ["https://place.map.kakao.com/693016371"]
  }
];
