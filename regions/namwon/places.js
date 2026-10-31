// 장소 데이터 · 남원 (2026-10-31 정리, 아직 직접 확인 안 함)
// 칸 설명은 regions/aewol/places.js 맨 위를 보세요.
// 운영시간·시설: 카카오맵 장소 페이지(2026-10-31 읽음)를 먼저 쓰고, 없으면 한국관광공사 API를 썼어요.
// 모르는 것은 null이에요. 운영 정보가 없는 곳은 뺐어요.

// 남원은 바다가 남쪽이라 해안선(공천포 → 태흥)에서 북쪽으로 2.5km 넘게 떨어지면 '산 쪽'으로 봐요
const INLAND_NORTH = true;
const COASTLINE = [{ lat: 33.267, lng: 126.620 }, { lat: 33.305, lng: 126.770 }];

const STARTS = [
  { id: "airport", emoji: "✈️", label: "제주공항", name: "제주국제공항", lat: 33.50684, lng: 126.49272 },
  { id: "wimi", emoji: "🏠", label: "위미 근처", name: "위미 근처", lat: 33.27, lng: 126.663 },
  { id: "namwon", emoji: "🏠", label: "남원 근처", name: "남원 근처", lat: 33.278, lng: 126.718 },
  { id: "taeheung", emoji: "🏠", label: "태흥 근처", name: "태흥 근처", lat: 33.299, lng: 126.759 },
  { id: "sumang", emoji: "🏠", label: "한남·수망 근처", name: "한남·수망 근처", lat: 33.338, lng: 126.71 }
];

const PLACES = [
  {
    id: "keuneong", name: "남원큰엉해변", type: "공원",
    desc: "바다와 절벽이 어우러진 산책길",
    stayMin: 50, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.27335, lng: 126.70371,
    dog: null, stroller: null, stepFree: true, solo: null,
    station: "동부보건소 정류장 걸어서 4분", bikeRack: null, evChargerMin: 2, parking: null,
    kakaoId: "2083466041",
    note: "태위로 522-17. 카카오맵(2026-10-31): 무료입장, 휴게공간. 관광공사 무장애: 출입구까지·주출입구 턱 없음. 해안 절벽이라 조심해 주세요.",
    sources: ["관광공사 API 128795","https://place.map.kakao.com/2083466041"]
  },
  {
    id: "mulyeongari", name: "물영아리오름", type: "공원",
    desc: "습지가 있는 신비로운 오름",
    stayMin: 90, cost: 0, open: null, close: null, closedDays: [],
    lat: 33.36839, lng: 126.69206,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "독벌은이 동산 정류장 걸어서 14분", bikeRack: null, evChargerMin: 15, parking: true,
    kakaoId: "7873185",
    note: "수망리 산 188. 카카오맵(2026-10-31): 무료입장, 카페·식당, 휴게공간, 전용 무료 주차.",
    sources: ["관광공사 API 2433925","https://place.map.kakao.com/7873185"]
  },
  {
    id: "hannam-saryeoni", name: "한남사려니오름숲", type: "공원",
    desc: "고요한 삼나무 숲길",
    stayMin: 70, cost: 0, open: "09:00", close: "17:00", closedDays: [],
    lat: 33.33620, lng: 126.64703,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "수악교 정류장 걸어서 59분", bikeRack: null, evChargerMin: 17, parking: true,
    kakaoId: "1928283908",
    note: "서성로651번길 235. 카카오맵(2026-10-31): 09:00~17:00, 무료입장, 사전예약, 전용 주차장.",
    sources: ["https://place.map.kakao.com/1928283908"]
  },
  {
    id: "camellia-arboretum", name: "제주동백수목원", type: "볼거리",
    desc: "붉은 동백꽃 산책",
    stayMin: 60, cost: 8000, open: "09:00", close: "17:00", closedDays: [],
    lat: 33.27553, lng: 126.67849,
    dog: null, stroller: null, stepFree: true, solo: null,
    station: "동백수목원 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: true,
    kakaoId: "236028555",
    note: "위미리 929-2. 카카오맵(2026-10-31): 09:00~17:00, 성인 8,000원, 휠체어 접근, 반려동물 동반, 무료 주차. 카카오맵에는 반려동물 동반으로 나오지만 금지라는 후기도 있어 정보 없음으로 뒀어요.",
    sources: ["https://place.map.kakao.com/236028555","https://blog.naver.com/kimmk74/224165388774"]
  },
  {
    id: "camellia-forest", name: "동백포레스트", type: "볼거리",
    desc: "동백꽃 가득한 힐링 산책길",
    stayMin: 60, cost: 6000, open: "09:00", close: "17:30", closedDays: [],
    strollerReview: true,
    lat: 33.30031, lng: 126.63620,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "상산모루 정류장 걸어서 9분", bikeRack: null, evChargerMin: 1, parking: null,
    kakaoId: "317349030",
    note: "생기악로 53-38. 카카오맵(2026-10-31): 09:00~17:30, 일반 6,000원, 반려동물 동반, 장애인 시설. 유모차 후기(블로그, 2026-10-31 확인): 유모차로 갈 수 있다는 후기 2건.",
    sources: ["https://place.map.kakao.com/317349030","https://blog.naver.com/miza_dailylife/224117086233","https://blog.naver.com/jjorong_ee/224130705264"]
  },
  {
    id: "dolnang-art", name: "돌낭예술원", type: "볼거리",
    desc: "돌과 나무의 자연 예술",
    stayMin: 60, cost: 10000, open: "08:30", close: "18:00", closedDays: [],
    hoursByDay: {"토":["08:30","18:30"]},
    dogRule: "리드줄과 배변봉투 필수",
    dogReview: true,
    strollerReview: true,
    lat: 33.31977, lng: 126.65462,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "휴애리 자연생활공원 정류장 걸어서 41분", bikeRack: null, evChargerMin: 26, parking: true,
    kakaoId: "1619757857",
    note: "서성로 544-35. 카카오맵(2026-10-31): 08:30~18:00(토 18:30), 성인 10,000원, 장애인 시설, 유료 주차. 반려견 후기(블로그, 2026-10-31 확인): 후기 여러 건. 유모차 후기(블로그, 2026-10-31 확인): 유모차가 된다는 글 여러 건.",
    sources: ["https://place.map.kakao.com/1619757857","https://blog.naver.com/jsnam007/224331626472","https://blog.naver.com/dkrgurtnr565/224119786921","https://blog.naver.com/mintraveler/224035778593","https://blog.naver.com/rhalsdk91/223724499534"]
  },
  {
    id: "bolgorong-camellia", name: "볼고롱동백", type: "볼거리",
    desc: "고요한 동백 산책길",
    stayMin: 50, cost: null, open: null, close: null, closedDays: [],
    lat: 33.27540, lng: 126.67738,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "동백수목원 정류장 걸어서 2분", bikeRack: null, evChargerMin: 6, parking: null,
    kakaoId: "755324204",
    note: "위미리 934-1. 카카오맵(2026-10-31): 유료입장, 유모차 가능, 카페·식당, 반려동물 동반. 입장료와 시간은 확인 못 했어요.",
    sources: ["https://place.map.kakao.com/755324204"]
  },
  {
    id: "yujinpang", name: "유진팡 열대과일농장", type: "볼거리",
    desc: "열대과일 농장 체험",
    stayMin: 70, cost: 9500, open: "10:00", close: "18:00", closedDays: [],
    lat: 33.33992, lng: 126.74252,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "고수동회관 정류장 걸어서 31분", bikeRack: null, evChargerMin: 37, parking: true,
    kakaoId: "1605931589",
    note: "원님로399번길 31-7. 카카오맵(2026-10-31): 10:00~18:00(입장 16:30까지), 농장 체험 9,500원, 반려동물 동반, 장애인 시설, 아이놀이방, 무료 주차.",
    sources: ["https://place.map.kakao.com/1605931589"]
  },
  {
    id: "citrus-farm", name: "최남단체험감귤농장", type: "볼거리",
    desc: "감귤 따기 체험 농장",
    stayMin: 60, cost: 20000, open: "09:00", close: "18:00", closedDays: [],
    breaks: [["12:00","13:00"]],
    lat: 33.28992, lng: 126.69376,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "최남단체험감귤농장 정류장 걸어서 1분", bikeRack: null, evChargerMin: 23, parking: null,
    kakaoId: "9966725",
    note: "남위남성로 164. 카카오맵(2026-10-31): 09:00~18:00, 12:00~13:00 쉼, 감귤따기체험 20,000원, 카페·식당.",
    sources: ["https://place.map.kakao.com/9966725"]
  },
  {
    id: "hueree", name: "휴애리자연생활공원", type: "볼거리",
    desc: "분홍빛 자연 산책길",
    stayMin: 80, cost: 13000, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.30941, lng: 126.63541,
    dog: true, stroller: true, stepFree: true, solo: null,
    station: "휴애리 자연생활공원 정류장 걸어서 5분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "27581976",
    note: "신례동로 256. 카카오맵(2026-10-31): 09:00~18:00, 연중무휴, 성인 13,000원, 휠체어 접근, 유모차 가능, 반려동물 동반.",
    sources: ["https://place.map.kakao.com/27581976"]
  },
  {
    id: "petit-camellia", name: "쁘띠동백", type: "쇼핑",
    desc: "동백 기념품 가게",
    stayMin: 30, cost: 0, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.27561, lng: 126.67713,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "동백수목원 정류장 걸어서 2분", bikeRack: null, evChargerMin: 6, parking: null,
    kakaoId: "1627183484",
    note: "태위로 278. 카카오맵(2026-10-31): 10:00~19:00. 물건값은 빼고 0원으로 넣었어요.",
    sources: ["https://place.map.kakao.com/1627183484"]
  },
  {
    id: "pencil-shop", name: "연필가게", type: "쇼핑",
    desc: "연필과 문구 가게",
    stayMin: 30, cost: 0, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.28618, lng: 126.74454,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "태흥초등학교 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "1974620820",
    note: "태위로 929. 카카오맵(2026-10-31): 10:00~19:00, 반려동물 동반, 장애인 시설. 물건값은 빼고 0원으로 넣었어요.",
    sources: ["https://place.map.kakao.com/1974620820"]
  },
  {
    id: "beomil-bunsik", name: "범일분식", type: "식당",
    desc: "노포 제주 순대국밥",
    stayMin: 40, cost: 10000, open: "09:00", close: "17:00", closedDays: ["토"],
    dogReview: true,
    lat: 33.27845, lng: 126.71692,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "남원포구입구 정류장 걸어서 2분", bikeRack: null, evChargerMin: 2, parking: true,
    kakaoId: "17682261",
    note: "태위로 658. 카카오맵(2026-10-31): 09:00~17:00, 토 휴무, 순대백반 10,000원, 건너편 무료 공영주차장. 반려견 후기(블로그, 2026-10-31 확인): 반려견 동반이 된다는 글 2건.",
    sources: ["https://place.map.kakao.com/17682261","https://blog.naver.com/joon3094/224182743282","https://blog.naver.com/simi2973/223759737315"]
  },
  {
    id: "taeheung-hoe", name: "태흥횟집", type: "식당",
    desc: "푸짐한 모듬회",
    stayMin: 90, cost: 80000, open: "10:00", close: "21:30", closedDays: [],
    lat: 33.28186, lng: 126.74605,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "태흥초등학교 정류장 걸어서 9분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "12611086",
    note: "남태해안로 435. 카카오맵(2026-10-31): 10:00~21:30, 모듬회 160,000원(2명 기준으로 1인 80,000원).",
    sources: ["https://place.map.kakao.com/12611086"]
  },
  {
    id: "gongcheonpo", name: "공천포식당", type: "식당",
    desc: "된장육수 제주식 물회",
    stayMin: 50, cost: 16000, open: "10:00", close: "15:30", closedDays: ["목"],
    lastOrder: "15:00",
    dogReview: true,
    lat: 33.26639, lng: 126.64259,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "신례2리교차로 정류장 걸어서 2분", bikeRack: null, evChargerMin: 12, parking: null,
    kakaoId: "8204729",
    note: "공천포로 89. 카카오맵(2026-10-31): 10:00~15:30, 15:00 마지막 주문, 목 휴무, 전복물회 16,000원. 반려견 후기(블로그, 2026-10-31 확인): 반려견과 다녀온 글 2건.",
    sources: ["https://place.map.kakao.com/8204729","https://blog.naver.com/ssssaera/224248300654","https://blog.naver.com/ththdks0307/224057460264"]
  },
  {
    id: "wimi-jeongsik", name: "위미정식", type: "식당",
    desc: "도민이 찾는 푸짐한 한상",
    stayMin: 50, cost: 11000, open: "10:30", close: "15:00", closedDays: ["일"],
    lat: 33.27177, lng: 126.66382,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "상원동 정류장 걸어서 7분", bikeRack: null, evChargerMin: 8, parking: null,
    kakaoId: "452183254",
    note: "위미중앙로196번길 15. 카카오맵(2026-10-31): 10:30~15:00, 일 휴무, 수육·제육정식 11,000원.",
    sources: ["https://place.map.kakao.com/452183254"]
  },
  {
    id: "iruhuje", name: "이루후제", type: "식당",
    desc: "제주 재료 퓨전 중식",
    stayMin: 60, cost: 10000, open: "10:30", close: "20:00", closedDays: ["수"],
    lastOrder: "19:30",
    breaks: [["15:00","17:00"]],
    lat: 33.25974, lng: 126.63016,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "하례초등학교 정류장 걸어서 8분", bikeRack: null, evChargerMin: 9, parking: true,
    kakaoId: "847127040",
    note: "하신로 63. 카카오맵(2026-10-31): 10:30~20:00, 15:00~17:00 브레이크타임, 19:30 마지막 주문, 수 휴무, 흑돼지불고기 짬뽕 10,000원, 유아의자, 옆 주차장.",
    sources: ["https://place.map.kakao.com/847127040"]
  },
  {
    id: "gongsaemi59", name: "공새미59", type: "식당",
    desc: "제주 농가 보말칼국수",
    stayMin: 50, cost: 11000, open: "08:30", close: "15:00", closedDays: ["월","화"],
    lat: 33.26427, lng: 126.64042,
    dog: true, stroller: null, stepFree: true, solo: null,
    station: "공천포 정류장 걸어서 3분", bikeRack: null, evChargerMin: 17, parking: null,
    kakaoId: "25854301",
    note: "공천포로 59-1. 카카오맵(2026-10-31): 08:30~15:00, 월·화 휴무, 보말 칼국수 11,000원, 반려동물 동반, 장애인 시설. 구글 지도(2026-10-31): 휠체어 이용가능 입구 있음 → 계단 없음으로 넣었어요.",
    sources: ["https://place.map.kakao.com/25854301"]
  },
  {
    id: "dongseon-jemyeon", name: "동선제면가", type: "식당",
    desc: "담백한 제주 고기국수",
    stayMin: 40, cost: 9000, open: "09:30", close: "16:00", closedDays: ["수"],
    lastOrder: "15:30",
    lat: 33.27197, lng: 126.64846,
    dog: true, stroller: null, stepFree: true, solo: null,
    station: "농협주유소 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "1101068317",
    note: "태위로 3. 카카오맵(2026-10-31): 09:30~16:00, 15:30 마지막 주문, 수 휴무, 몰망국수 9,000원, 유아의자, 키즈메뉴, 반려동물 동반. 관광공사 무장애: 출입구까지·주출입구 턱 없음.",
    sources: ["관광공사 API 2843815","https://place.map.kakao.com/1101068317"]
  },
  {
    id: "gwendang", name: "괸당네식당 본점", type: "식당",
    desc: "흑돼지 주물럭",
    stayMin: 60, cost: 10000, open: "10:00", close: "20:00", closedDays: ["월"],
    lat: 33.27845, lng: 126.71836,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "남원포구입구 정류장 걸어서 2분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "1297845544",
    note: "태위로 672-6. 카카오맵(2026-10-31): 10:00~20:00, 월 휴무, 1인분 10,000원.",
    sources: ["https://place.map.kakao.com/1297845544"]
  },
  {
    id: "chwihyang-kitchen", name: "취향의섬 키친", type: "식당",
    desc: "제주 식재료 퓨전 파스타",
    stayMin: 60, cost: 19000, open: "11:00", close: "16:00", closedDays: [],
    lastOrder: "15:00",
    lat: 33.27435, lng: 126.68979,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "위미3리 마을회관 정류장 걸어서 2분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "1564244372",
    note: "태위로398번길 7. 카카오맵(2026-10-31): 11:00~16:00, 15시 마지막 주문, 재료 소진 시 조기 마감, 고사리멜젓파스타 19,000원.",
    sources: ["https://place.map.kakao.com/1564244372"]
  },
  {
    id: "wimi-gukbap", name: "위미국밥", type: "식당",
    desc: "제주산 생등뼈 국밥",
    stayMin: 40, cost: 11000, open: "11:00", close: "15:00", closedDays: ["화"],
    lastOrder: "14:30",
    lat: 33.27424, lng: 126.66267,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "상원동 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "131627715",
    note: "위미중앙로 178. 카카오맵(2026-10-31): 11:00~15:00, 14:30 마지막 주문, 화 휴무, 뼈해장국 11,000원.",
    sources: ["https://place.map.kakao.com/131627715"]
  },
  {
    id: "heukdwaeji-brothers", name: "흑돼지브라더스 본점", type: "식당",
    desc: "초벌구이 제주 흑돼지",
    stayMin: 80, cost: 33000, open: "12:30", close: "22:00", closedDays: [],
    lat: 33.28293, lng: 126.67052,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "위미감협 정류장 걸어서 5분", bikeRack: null, evChargerMin: 12, parking: null,
    kakaoId: "2065544005",
    note: "위미대성로 58. 카카오맵(2026-10-31): 12:30~22:00, 2인 66,000원(1인 33,000원), 반려동물 동반, 장애인 시설.",
    sources: ["https://place.map.kakao.com/2065544005"]
  },
  {
    id: "haebaragi-sikdang", name: "해바라기식당", type: "식당",
    desc: "푸짐한 두루치기",
    stayMin: 50, cost: 10000, open: "11:00", close: "20:00", closedDays: ["수"],
    lat: 33.31234, lng: 126.71999,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "제3의귀교 정류장 걸어서 2분", bikeRack: null, evChargerMin: 6, parking: null,
    kakaoId: "1065490906",
    note: "한신로 280. 카카오맵(2026-10-31): 11:00~20:00, 수 휴무, 돼지두루치기 10,000원.",
    sources: ["https://place.map.kakao.com/1065490906"]
  },
  {
    id: "sinheung-poguyeok", name: "신흥포구역", type: "카페",
    desc: "포구 앞 카페",
    stayMin: 40, cost: 3500, open: "11:00", close: "22:00", closedDays: [],
    lastOrder: "21:30",
    lat: 33.30044, lng: 126.76635,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "신흥교차로 정류장 걸어서 2분", bikeRack: null, evChargerMin: 8, parking: null,
    kakaoId: "1263342103",
    note: "일주동로 6630. 카카오맵(2026-10-31): 11:00~22:00, 21:30 마지막 주문, 아메리카노 3,500원.",
    sources: ["https://place.map.kakao.com/1263342103"]
  },
  {
    id: "warangwarang", name: "와랑와랑", type: "카페",
    desc: "제주 돌담과 정원 카페",
    stayMin: 50, cost: 6300, open: "11:00", close: "17:00", closedDays: ["수","목"],
    lat: 33.27229, lng: 126.67655,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "세천동 정류장 걸어서 7분", bikeRack: null, evChargerMin: 10, parking: null,
    kakaoId: "18815393",
    note: "위미중앙로300번길 28. 카카오맵(2026-10-31): 11:00~17:00, 수·목 휴무, 아인슈페너 6,300원, 반려동물 동반.",
    sources: ["https://place.map.kakao.com/18815393"]
  },
  {
    id: "monocle-jeju", name: "모노클제주", type: "카페",
    desc: "귤밭 품은 치즈케이크 카페",
    stayMin: 50, cost: 7200, open: "10:00", close: "17:00", closedDays: ["수"],
    dogRule: "야외 잔디석만",
    dogReview: true,
    lat: 33.27289, lng: 126.68456,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "위미3리 정류장 걸어서 6분", bikeRack: null, evChargerMin: 6, parking: null,
    kakaoId: "337455511",
    note: "태위로360번길 30-8. 카카오맵(2026-10-31): 10:00~17:00, 수 휴무, 클래식 치즈케이크 7,200원. 반려견 후기(블로그, 2026-10-31 확인): 후기 2건.",
    sources: ["https://place.map.kakao.com/337455511","https://blog.naver.com/mozzi0626-/223899237207","https://blog.naver.com/noonseol2/224409263119"]
  },
  {
    id: "seoyeon-house", name: "카페서연의집", type: "카페",
    desc: "위미 바다 앞 카페",
    stayMin: 50, cost: 7500, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.26941, lng: 126.65558,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "위미초등학교 정류장 걸어서 9분", bikeRack: null, evChargerMin: 7, parking: null,
    kakaoId: "19639423",
    note: "위미해안로 86. 카카오맵(2026-10-31): 10:00~19:00, 구좌당근주스 7,500원, 테라스.",
    sources: ["https://place.map.kakao.com/19639423"]
  },
  {
    id: "lemon-museum", name: "레몬뮤지엄", type: "카페",
    desc: "노란빛 레몬 카페",
    stayMin: 50, cost: 6800, open: "09:00", close: "18:00", closedDays: [],
    lastOrder: "17:30",
    lat: 33.29886, lng: 126.61785,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "진학농원 정류장 걸어서 4분", bikeRack: null, evChargerMin: 7, parking: null,
    kakaoId: "1406187011",
    note: "하례로620번길 41. 카카오맵(2026-10-31): 09:00~18:00, 17:30 마지막 주문, 제주찐레몬에이드 6,800원, 반려동물 동반, 장애인 시설.",
    sources: ["https://place.map.kakao.com/1406187011"]
  },
  {
    id: "sumang-dawon", name: "수망다원", type: "카페",
    desc: "제주 유기농 차 공간",
    stayMin: 50, cost: 7000, open: "10:00", close: "17:00", closedDays: [],
    dogRule: "야외 공간만",
    dogReview: true,
    lat: 33.33681, lng: 126.71822,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "디삘레 정류장 걸어서 16분", bikeRack: null, evChargerMin: 18, parking: null,
    kakaoId: "1838214127",
    note: "수망리 535-5. 카카오맵(2026-10-31): 10:00~17:00, 말차라떼 7,000원, 유아의자, 테라스. 반려견 후기(블로그, 2026-10-31 확인): 후기 2건.",
    sources: ["https://place.map.kakao.com/1838214127","https://blog.naver.com/jejuda-he/224417741371","https://blog.naver.com/laurel__is/224176301153"]
  },
  {
    id: "oasis-garden", name: "오아시스가든 제주", type: "카페",
    desc: "한라산과 오리가 있는 정원 카페",
    stayMin: 60, cost: 6500, open: "10:00", close: "19:00", closedDays: [],
    dogReview: true,
    strollerReview: true,
    lat: 33.29028, lng: 126.60855,
    dog: true, stroller: true, stepFree: null, solo: null,
    station: "하례2리 정류장 걸어서 5분", bikeRack: null, evChargerMin: 5, parking: null,
    kakaoId: "59281417",
    note: "중산간동로 7373. 카카오맵(2026-10-31): 10:00~19:00, 연중무휴, 딸기라떼 6,500원. 반려견 후기(블로그, 2026-10-31 확인): 반려견과 온 손님이 있다는 후기 2건. 유모차 후기(블로그, 2026-10-31 확인): 매장이 넓어 유모차가 된다는 후기 2건.",
    sources: ["https://place.map.kakao.com/59281417","https://blog.naver.com/hiel_joon/224441794107","https://blog.naver.com/porori4611/224438351705","https://blog.naver.com/jadore_yoon/224353375652","https://blog.naver.com/haloveyun/224426249030"]
  },
  {
    id: "heavenly", name: "헤븐리", type: "카페",
    desc: "남원 카페",
    stayMin: 40, cost: 4000, open: "09:30", close: "19:00", closedDays: ["목"],
    lat: 33.27684, lng: 126.71410,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "남원우체국 정류장 걸어서 3분", bikeRack: null, evChargerMin: 3, parking: null,
    kakaoId: "619401213",
    note: "남태해안로 75-5. 카카오맵(2026-10-31): 09:30~19:00, 목 휴무, 아메리카노 4,000원.",
    sources: ["https://place.map.kakao.com/619401213"]
  },
  {
    id: "jini-citrus", name: "지니귤카페", type: "카페",
    desc: "귤 카페",
    stayMin: 40, cost: 2500, open: "09:00", close: "18:00", closedDays: [],
    lat: 33.28734, lng: 126.66622,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "자미성 정류장 걸어서 10분", bikeRack: null, evChargerMin: 12, parking: null,
    kakaoId: "1468875277",
    note: "위미상원북로24번길 88. 카카오맵(2026-10-31): 09:00~18:00, 아메리카노 2,500원, 장애인 시설.",
    sources: ["https://place.map.kakao.com/1468875277"]
  },
  {
    id: "osulloc-factory", name: "오설록티하우스 티팩토리점", type: "카페",
    desc: "숲과 차 향의 공간",
    stayMin: 50, cost: null, open: "10:00", close: "18:00", closedDays: [],
    dogRule: "바깥 자리만",
    dogReview: true,
    lat: 33.31562, lng: 126.68138,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "한남제재소 앞 정류장 걸어서 18분", bikeRack: null, evChargerMin: 1, parking: null,
    kakaoId: "1536636635",
    note: "서성로652번길 191. 카카오맵(2026-10-31): 10:00~18:00, 유아의자, 키즈프렌들리, 테라스. 가격은 확인 못 했어요. 반려견 후기(블로그, 2026-10-31 확인): 후기 2건.",
    sources: ["https://place.map.kakao.com/1536636635","https://blog.naver.com/olyvia8484/224436011861","https://blog.naver.com/boriwithpets/224326146891"]
  },
  {
    id: "bella-wimi", name: "벨라위미", type: "카페",
    desc: "귤밭 품은 향기 카페",
    stayMin: 40, cost: 4000, open: "08:00", close: "18:00", closedDays: ["일"],
    dogRule: "야외만, 전화 확인",
    dogReview: true,
    lat: 33.27646, lng: 126.66546,
    dog: true, stroller: null, stepFree: null, solo: null,
    station: "위미리 정류장 걸어서 2분", bikeRack: null, evChargerMin: 6, parking: null,
    kakaoId: "917328798",
    note: "태위로151번길 14-14. 카카오맵(2026-10-31): 08:00~18:00, 일 휴무, 아메리카노 4,000원, 테라스. 반려견 후기(블로그, 2026-10-31 확인): 후기 2건.",
    sources: ["https://place.map.kakao.com/917328798","https://blog.naver.com/borihousejeju/223925421735","https://blog.naver.com/odd0222/223992603774"]
  },
  {
    id: "cat-world", name: "제주캣월드", type: "카페",
    desc: "고양이들과 쉬는 카페",
    stayMin: 60, cost: 4500, open: "10:00", close: "18:00", closedDays: [],
    lat: 33.27578, lng: 126.69941,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "남원취락구조 정류장 걸어서 2분", bikeRack: null, evChargerMin: 1, parking: null,
    kakaoId: "1941900518",
    note: "태위로 485. 카카오맵(2026-10-31): 10:00~18:00, 아메리카노 4,500원, 단체석.",
    sources: ["https://place.map.kakao.com/1941900518"]
  },
  {
    id: "travel-shop-jeju", name: "여행가게 제주", type: "카페",
    desc: "여행 기념품과 차",
    stayMin: 40, cost: 6000, open: "10:00", close: "19:00", closedDays: [],
    lat: 33.28615, lng: 126.74450,
    dog: null, stroller: null, stepFree: null, solo: null,
    station: "태흥초등학교 정류장 걸어서 1분", bikeRack: null, evChargerMin: 4, parking: null,
    kakaoId: "1024104421",
    note: "태위로 929. 카카오맵(2026-10-31): 10:00~19:00, 핸드드립 커피 6,000원.",
    sources: ["https://place.map.kakao.com/1024104421"]
  }
];
