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
//   breaks        쉬는 시간(브레이크 타임) 예: [["15:00", "16:00"]]. 없으면 이 칸을 안 써도 돼요
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
// 관광공사 국문 관광정보 API: 한국관광공사_국문 관광정보 서비스_GW (공공데이터포털, 2026-10-24 조회)
// 카카오맵: 카카오 로컬 API로 찾고, 장소 페이지(place.map.kakao.com)의 시설정보·메뉴를 직접 읽었어요 (2026-10-24)

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
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월로1길 25. 매일 09:00~21:30(주문 21:00까지), 연중무휴(소개 글 기준). 0507-1494-4999 카카오맵(2026-10-24, 사업자 인증 매장): 시설정보 반려동물 동반·장애인 시설(계단 없음인지는 확인 필요). 메뉴 가격은 메뉴판 사진뿐이라 확인 필요.",
    sources: ["https://place.map.kakao.com/693062983", "https://www.trvlogue.com/ko/bomnal-cafe-aewol-jeju", "https://www.ktriptips.com/kor/food/3080165"]
  },
  {
    id: "blissful-jeju", name: "블리스풀 제주", type: "카페",
    stayMin: 60, cost: 5000, open: "10:00", close: "18:00", closedDays: ["금"],
    lat: 33.40499, lng: 126.40720,
    dog: true, stroller: null, stepFree: true, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "산록서로 383 1동 1층. 애견카페(소형견·대형견 구분된 잔디 운동장). 카카오맵(2026-10-23, 사업자 인증 매장): 반려동물 동반, 무료 주차, 매주 금요일 휴무, '계절마다 운영시간 다름', 아메리카노 5,000원, 064-799-8596. 구글 지도: 휠체어 이용 가능 출입구. 운영시간: 관광공사 국문 관광정보(2025-10 수정)는 평일 10~18시·주말 10~19시, 블로그(2026-02)는 11:30~17:30, 카카오는 '계절마다 다름' → 평일 시간으로 넣었고 확인 필요. 운동장 이용료 따로 있는지 확인 필요. 위치는 구글 플러스코드 8Q58CC34+XVW 기준.",
    sources: ["https://place.map.kakao.com/1986467457", "https://maps.app.goo.gl/6wXE9Z3ScsMB4aMu6"]
  },
  {
    id: "jangin-house", name: "장인의집", type: "식당",
    stayMin: 60, cost: null, open: "09:00", close: "22:00", closedDays: [],
    lat: 33.46577, lng: 126.32685,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로19길 31. 만두전골·갈비탕. 주문 21:00까지. 예약 가능. 관광공사 국문 관광정보(2025-06 수정): 09:00~22:00 (마지막 주문 21:00) / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2847672"]
  },
  {
    id: "danso", name: "단소", type: "식당",
    stayMin: 50, cost: null, open: "11:00", close: "15:30", closedDays: ["일"],
    lat: 33.46445, lng: 126.32264,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: false,
    note: "애월로 139-4. 한상차림·도시락. 주문 14:50까지. 관광공사 국문 관광정보(2025-01 수정): 11:00~15:30 (라스트오더 14:50) / 쉬는 날 매주 일요일. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2851913"]
  },
  {
    id: "aewol-twigim", name: "애월튀김간", type: "식당",
    stayMin: 40, cost: null, open: "11:00", close: "20:00", closedDays: [],
    lat: 33.46440, lng: 126.31977,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월로 118. 떡볶이·튀김·김밥. 포장 가능. 관광공사 국문 관광정보(2025-09 수정): 11:00~20:00 / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2780230"]
  },
  {
    id: "simba-curry", name: "심바카레", type: "식당",
    stayMin: 50, cost: 14000, open: "10:00", close: "19:00", closedDays: ["수"],
    breaks: [["15:00", "16:00"]],
    lat: 33.46342, lng: 126.31686,
    dog: true, stroller: null, stepFree: null, solo: true,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로 87-16. 돈카츠 카레. 15:00~16:00 쉬는 시간. 관광공사 국문 관광정보(2025-06 수정): - 10:00~19:00 - 준비시간 15:00~16:00 - 점심 마지막 주문 14:30 / 저녁 마지막 주문 18:30 / 쉬는 날 매주 수요일. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 태그 #애견동반식당 #혼밥, 소개 '반려견과 함께하는 일식풍 카레', 돈카츠 카레 14,000원. 시설정보 칸에는 반려동물 표시가 없어서 태그 기준이에요.",
    sources: ["https://place.map.kakao.com/292550130", "관광공사 국문 관광정보 API 2852108"]
  },
  {
    id: "aewolri-makguksu", name: "애월리순메밀막국수", type: "식당",
    stayMin: 50, cost: null, open: "10:00", close: "20:00", closedDays: [],
    lat: 33.46566, lng: 126.31639,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월해안로 11. 막국수·평양냉면. 주문 19:30까지. 관광공사 국문 관광정보(2025-06 수정): 10:00~20:00 (마지막 주문 19:30) / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2864216"]
  },
  {
    id: "goijeong", name: "고이정", type: "식당",
    stayMin: 70, cost: null, open: "11:00", close: "24:00", closedDays: [],
    lat: 33.45933, lng: 126.31135,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로 6. 흑돼지 근고기. 주문 23:00까지. 관광공사 국문 관광정보(2025-01 수정): 11:00~24:00 (라스트오더 23:00) / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2759061"]
  },
  {
    id: "kkongsuni", name: "꽁순이네", type: "식당",
    stayMin: 40, cost: null, open: "10:00", close: "16:30", closedDays: ["화"],
    lat: 33.44695, lng: 126.33872,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "중산간서로 5642. 고기국수·몸국. 중산간서로 5642. 관광공사 국문 관광정보(2025-06 수정): 10:00~16:30 (마지막 주문 16:25) / 쉬는 날 매주 화요일. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2851868"]
  },
  {
    id: "haenyeo-house", name: "해녀의집", type: "식당",
    stayMin: 60, cost: null, open: "10:00", close: "20:00", closedDays: ["화"],
    breaks: [["14:00", "15:00"]],
    lat: 33.47841, lng: 126.36694,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: false,
    note: "애월해안로 591. 전복죽·해산물. 14:00~15:00 쉬는 시간. 관광공사 국문 관광정보(2025-06 수정): 10:00~20:00 (준비시간 14:00~15:00) / 쉬는 날 매주 화요일. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2852232"]
  },
  {
    id: "jeongjikhan-don", name: "정직한돈 본점", type: "식당",
    stayMin: 70, cost: null, open: "15:00", close: "23:00", closedDays: [],
    lat: 33.46740, lng: 126.33900,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월해안로 253. 흑돼지 구이. 관광공사 국문 관광정보(2025-06 수정): 15:00~23:00 / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2853566"]
  },
  {
    id: "jeremy-cafe", name: "제레미", type: "카페",
    stayMin: 50, cost: null, open: "09:00", close: "17:30", closedDays: ["일", "월"],
    lat: 33.46455, lng: 126.31852,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: false,
    note: "애월로 106-1. 핸드드립 커피·토스트. 주문 17:10까지. 관광공사 국문 관광정보(2025-06 수정): 09:00~17:30 (마지막 주문 17:10) / 쉬는 날 매주 일요일, 월요일. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2852155"]
  },
  {
    id: "tribe-cafe", name: "트라이브", type: "카페",
    stayMin: 50, cost: null, open: "09:00", close: "21:00", closedDays: [],
    lat: 33.46006, lng: 126.31128,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로 11. 수플레. 애월로 11. 관광공사 국문 관광정보(2025-06 수정): 09:00~21:00 / 쉬는 날 연중무휴. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2861940"]
  },
  {
    id: "sunset-cliff", name: "썬셋클리프", type: "카페",
    stayMin: 60, cost: 20000, open: "10:00", close: "22:00", closedDays: [],
    lat: 33.46184, lng: 126.31072,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "애월로1길 19-8. 피자·음료. 관광공사 국문 관광정보(2025-10 수정): 10:00~22:00 / 쉬는 날 연중무휴. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 테라스·루프탑, 매장 이용 시 애월한담주차장 1시간 무료. 로코모코 20,000원·피자 23,000원.",
    sources: ["https://place.map.kakao.com/611667902", "관광공사 국문 관광정보 API 2893743"]
  },
  {
    id: "matilda-cafe", name: "마틸다", type: "카페",
    stayMin: 50, cost: null, open: "18:00", close: "24:00", closedDays: ["화"],
    lat: 33.46573, lng: 126.33428,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "고내1길 33. 밤 카페. 실제로는 새벽 1시까지(주문 00:30). 관광공사 국문 관광정보(2025-06 수정): 18:00~01:00 (마지막 주문 00:30) / 쉬는 날 매주 화요일. 가격 확인 필요.",
    sources: ["관광공사 국문 관광정보 API 2851674"]
  },
  {
    id: "aewol-onuii", name: "애월오누이 제주", type: "식당",
    stayMin: 50, cost: 15000, open: "07:00", close: null, closedDays: null,
    lat: 33.46662, lng: 126.31878,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월로9길 54. 성게미역국·두루치기·전복돌솥밥 15,000원, 각재기국 10,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 태그 #애견동반식당 #아침식사, 07:00 오픈(닫는 시간·쉬는 날 확인 필요), 064-799-8846. 시설정보 칸에는 반려동물 표시가 없어서 태그 기준이에요.",
    sources: ["https://place.map.kakao.com/974387661"]
  },
  {
    id: "lee-chunok", name: "이춘옥원조고등어쌈밥 제주애월본점", type: "식당",
    stayMin: 60, cost: 17000, open: "10:00", close: null, closedDays: null,
    lat: 33.48900, lng: 126.41870,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "일주서로 7213(하귀 쪽, 애월리에서 차로 15분쯤). 전복뚝배기(1인) 17,000원, 고등어 묵은지찜(2인) 38,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 장애인 시설(계단 없음인지는 확인 필요), 무료 주차, 10:00 오픈·재료 소진 시 조기 마감, 064-799-9914.",
    sources: ["https://place.map.kakao.com/24780480"]
  },
  {
    id: "doldam-gogi", name: "돌담길괴기집", type: "식당",
    stayMin: 80, cost: 32000, open: "17:00", close: null, closedDays: null,
    lat: 33.44978, lng: 126.30711,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "곽지5길 8-11. 흑돼지 오겹살·목살 600g 64,000원(2인 기준으로 1명 32,000원으로 넣었어요), 김치찌개 8,000원, 냉면 7,000원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 17:00 오픈(닫는 시간·쉬는 날 확인 필요), 010-5647-1107.",
    sources: ["https://place.map.kakao.com/686576469"]
  },
  {
    id: "bluegrass", name: "블루그라스", type: "식당",
    stayMin: 50, cost: 10800, open: "10:00", close: "15:00", closedDays: null,
    lat: 33.44745, lng: 126.30924,
    dog: true, stroller: null, stepFree: null, solo: true,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "곽지8길 23-9 (곽지해수욕장 근처). 떡갈비 10,800원, 열무국수 9,500원. 카카오맵(2026-10-24, 사업자 인증 매장): 반려동물 동반, 무료 주차, 태그 #혼밥, 10:00 오픈·주문 15:00까지·재료 소진 시 일찍 마감(15:00를 닫는 시간으로 넣었어요), 070-8806-4479.",
    sources: ["https://place.map.kakao.com/2084120036"]
  },
  {
    id: "eondeokjip-guksu", name: "언덕집국수", type: "식당",
    stayMin: 40, cost: 10000, open: "08:00", close: "16:00", closedDays: [],
    lat: 33.47840, lng: 126.35691,
    dog: null, stroller: null, stepFree: null, solo: true,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월해안로 494(블로그 기준). 매일 08~16시, 주문 15시까지. 고기국수 1만 원. 위치 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 고기국수·비빔국수·고기국밥 각 10,000원, 태그 #혼밥 #아침식사, 070-8657-3107. 위치는 카카오 기준. 반려동물 표시는 없어요.",
    sources: ["https://place.map.kakao.com/571769164", "https://www.trvlogue.com/ko/ondeokjip-guksu-jeju-aewol"]
  },
  {
    id: "paul-cafe", name: "폴카페", type: "카페",
    stayMin: 50, cost: null, open: null, close: null, closedDays: null,
    lat: null, lng: null,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: null,
    note: "애월읍 하광로. 반려견 목줄 필수, 10kg 넘는 개는 야외 자리만(소개 글 기준). 위치·운영시간 확인 필요. 카카오맵에는 '폴카페 전기차충전소'(하광로 208-22)만 있고 카페는 안 나와서, 지금도 영업하는지 확인 필요. 소상공인 상가정보(2026-06 기준)에는 바로 옆 하광로 208-16에 '워커스폴'(카페)이 있는데 같은 곳인지는 몰라요.",
    sources: []
  },
  {
    id: "aewol-the-sunset", name: "애월 더선셋", type: "카페",
    stayMin: 60, cost: 6500, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.45621, lng: 126.30904,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: null, bikeRack: null, evChargerMin: null, parking: true,
    note: "일주서로 6111. 바다 보이는 브런치 카페(치즈 오믈렛 브런치). 관광공사 국문 관광정보(2025-06 수정): 10:00~19:00, 주문 18:20까지, 연중무휴, 주차 가능. 반려견 동반은 장소 정보 사이트 표시 기준이라 확인하면 좋아요. 가격 확인 필요. 카카오맵(2026-10-24, 사업자 인증 매장): 시설정보 반려동물 동반·무료 주차 확인, 동절기 10:00~19:00(주문 18:00), 아메리카노 6,500원.",
    sources: ["https://place.map.kakao.com/27149644", "관광공사 국문 관광정보 API 2862045", "https://polle.com/place/2A8Nje/%EC%95%A0%EC%9B%94%20%EB%8D%94%EC%84%A0%EC%85%8B"]
  }
];
