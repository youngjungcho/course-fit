// 지역 목록. 지역마다 regions/<id>/places.js 와 travel.js 를 따로 둬요 (이동 시간표는 장소 수의 제곱으로 커져서 한 파일에 못 담아요)
// name = 화면에 보여 줄 이름, search = 네이버지도에서 장소를 찾을 때 이름 뒤에 붙이는 말
// area = 시·도 이름(지역 목록 묶음), router = 이동 시간 계산 출처(없으면 openrouteservice.org)
// 아래 칸은 시·도마다 달라요
//   sun      일몰 계산 기준 위치 [위도, 경도]
//   bounds   "지금 내 위치"를 쓸 수 있는 범위
//   hub      타고 떠나는 곳 (STARTS의 id "airport"). buffer = 몇 분 일찍 도착할지, bufferLabel = 화면 문구
//   taxiBase 택시 기본요금(원, 2km까지), taxiMeter 몇 m마다 100원인지, taxiFarKm 거리요금이 2배가 되는 거리(없으면 할증 없음)
//   noBus    버스 자료가 없는 지역: "뚜벅이"를 빼고 busNote를 보여 줘요
//   noSeaSunset 바다로 해가 지지 않는 곳: 바닷가라고 노을 명소로 치지 않아요
const JEJU_AREA = {
  area: "제주", sun: [33.46, 126.33], bounds: { latMin: 33.1, latMax: 33.6, lngMin: 126.1, lngMax: 127.0 },
  hub: { label: "제주공항 (비행기)", emoji: "✈️", ride: "비행기", place: "공항", buffer: 90, bufferLabel: "1시간 반" }, taxiBase: 4300, taxiMeter: 126
};
const GANGWON_EAST = {
  area: "강원", sun: [37.75, 128.88], bounds: { latMin: 37.45, latMax: 38.0, lngMin: 128.5, lngMax: 129.2 },
  hub: { label: "강릉역 (기차)", emoji: "🚆", ride: "기차", place: "역", buffer: 30, bufferLabel: "30분" },
  taxiBase: 4600, taxiMeter: 131, taxiFarKm: 6 // 강릉시 2024-08-05 시행 요금 (파이낸셜뉴스 2024-07-29). 2026년 고시는 못 찾았어요
};
const REGIONS = [
  { ...JEJU_AREA, id: "aewol", name: "애월", search: "애월" },
  { ...JEJU_AREA, id: "hallim", name: "한림·협재", search: "한림" },
  { ...JEJU_AREA, id: "jejusi", name: "제주시내", search: "제주시" },
  { ...JEJU_AREA, id: "seogwipo", router: "OSRM", name: "서귀포·중문", search: "서귀포" },
  { ...JEJU_AREA, id: "east", router: "OSRM", name: "함덕·조천·구좌", search: "제주" },
  { ...JEJU_AREA, id: "seongsan", router: "OSRM", name: "성산·표선", search: "서귀포" },
  { ...JEJU_AREA, id: "southwest", router: "OSRM", name: "한경·대정·안덕", search: "제주" },
  { ...JEJU_AREA, id: "namwon", router: "OSRM", name: "남원", search: "서귀포 남원" },
  { ...GANGWON_EAST, id: "gangneung", router: "OSRM", name: "강릉", search: "강릉", noBus: true, noSeaSunset: true,
    busNote: "강릉은 버스 정보를 아직 넣지 않았어요. 버스 시간표가 뜸한 곳이 많아 차나 택시로 다니는 코스로 짜요." }
];
