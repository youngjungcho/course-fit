// 장소 데이터 (지금은 모두 "예시"예요. 실제 장소가 아니에요.)
//
// 한 장소 = 아래 칸들을 가진 묶음 하나.
// true = 돼요 / false = 안 돼요 / null = 확인 필요 (모르면 꼭 null로 두기)
//
//   id            겹치지 않는 영어 이름
//   name          장소 이름
//   type          "식당" | "카페" | "볼거리" | "공원" | "쇼핑"
//   stayMin       머무는 시간(분)
//   cost          1인 예상 비용(원). 무료면 0
//   open, close   운영시간 "HH:MM" (24시간이면 "00:00", "24:00" / 모르면 null)
//   closedDays    쉬는 요일 예: ["월"] (모르면 null)
//   lat, lng      위치 (지도에서 복사)
//   dog           반려견 들어가도 돼요?
//   stroller      유모차 다닐 수 있어요?
//   stepFree      계단 없이 들어갈 수 있어요? (휠체어·어르신)
//   solo          혼자 가기 좋아요?
//   station       가까운 역·정류장과 걸어서 몇 분
//   bikeRack      자전거 세울 곳 있어요?
//   evChargerMin  가장 가까운 전기차 충전소까지 몇 분 (모르면 null)
//   parking       주차돼요?
//   note          메모 (확인한 날짜, 출처 등)

const START = { name: "예시역 1번 출구", lat: 37.5000, lng: 127.0000 };

const PLACES = [
  {
    id: "sample-cafe-a", name: "예시 카페 A", type: "카페",
    stayMin: 50, cost: 7000, open: "09:00", close: "21:00", closedDays: [],
    lat: 37.5021, lng: 127.0012,
    dog: true, stroller: true, stepFree: true, solo: true,
    station: "예시역 도보 4분", bikeRack: true, evChargerMin: 5, parking: false,
    note: "예시 데이터"
  },
  {
    id: "sample-cafe-b", name: "예시 카페 B", type: "카페",
    stayMin: 40, cost: 6000, open: "11:00", close: "22:00", closedDays: ["월"],
    lat: 37.5058, lng: 127.0071,
    dog: false, stroller: false, stepFree: false, solo: true,
    station: "예시역 도보 12분", bikeRack: null, evChargerMin: null, parking: false,
    note: "예시 데이터 · 2층이라 계단 있음(예시)"
  },
  {
    id: "sample-food-a", name: "예시 국밥집", type: "식당",
    stayMin: 50, cost: 11000, open: "10:30", close: "21:00", closedDays: [],
    lat: 37.4988, lng: 127.0035,
    dog: false, stroller: true, stepFree: true, solo: true,
    station: "예시역 도보 3분", bikeRack: false, evChargerMin: 10, parking: true,
    note: "예시 데이터"
  },
  {
    id: "sample-food-b", name: "예시 테라스 식당", type: "식당",
    stayMin: 70, cost: 22000, open: "11:30", close: "22:00", closedDays: ["화"],
    lat: 37.5040, lng: 126.9958,
    dog: true, stroller: true, stepFree: null, solo: false,
    station: "예시역 도보 9분", bikeRack: true, evChargerMin: 3, parking: true,
    note: "예시 데이터 · 테라스만 반려견 가능(예시)"
  },
  {
    id: "sample-food-c", name: "예시 분식", type: "식당",
    stayMin: 30, cost: 8000, open: "11:00", close: "20:00", closedDays: ["일"],
    lat: 37.5072, lng: 127.0020,
    dog: false, stroller: null, stepFree: true, solo: true,
    station: "예시역 도보 10분", bikeRack: true, evChargerMin: null, parking: false,
    note: "예시 데이터"
  },
  {
    id: "sample-park-a", name: "예시 강변공원", type: "공원",
    stayMin: 60, cost: 0, open: "00:00", close: "24:00", closedDays: [],
    lat: 37.4962, lng: 126.9975,
    dog: true, stroller: true, stepFree: true, solo: true,
    station: "예시역 도보 7분", bikeRack: true, evChargerMin: 8, parking: true,
    note: "예시 데이터 · 24시간(예시)"
  },
  {
    id: "sample-park-b", name: "예시 숲길", type: "공원",
    stayMin: 80, cost: 0, open: "06:00", close: "20:00", closedDays: [],
    lat: 37.5095, lng: 126.9930,
    dog: true, stroller: false, stepFree: false, solo: true,
    station: "예시역 버스 10분", bikeRack: false, evChargerMin: 15, parking: true,
    note: "예시 데이터 · 흙길·계단(예시)"
  },
  {
    id: "sample-museum", name: "예시 미술관", type: "볼거리",
    stayMin: 90, cost: 15000, open: "10:00", close: "18:00", closedDays: ["월"],
    lat: 37.5015, lng: 126.9920,
    dog: false, stroller: true, stepFree: true, solo: true,
    station: "예시역 도보 11분", bikeRack: true, evChargerMin: 2, parking: true,
    note: "예시 데이터 · 엘리베이터 있음(예시)"
  },
  {
    id: "sample-market", name: "예시 골목시장", type: "볼거리",
    stayMin: 60, cost: 10000, open: "09:00", close: "19:00", closedDays: null,
    lat: 37.4975, lng: 127.0080,
    dog: null, stroller: false, stepFree: true, solo: true,
    station: "예시역 도보 8분", bikeRack: null, evChargerMin: null, parking: false,
    note: "예시 데이터 · 쉬는 날 확인 필요"
  },
  {
    id: "sample-shop", name: "예시 소품숍", type: "쇼핑",
    stayMin: 30, cost: 15000, open: "12:00", close: "21:00", closedDays: [],
    lat: 37.5032, lng: 127.0045,
    dog: true, stroller: false, stepFree: false, solo: true,
    station: "예시역 도보 5분", bikeRack: false, evChargerMin: 6, parking: false,
    note: "예시 데이터"
  }
];
