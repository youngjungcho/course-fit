// 지역 목록. 지역마다 regions/<id>/places.js 와 travel.js 를 따로 둬요 (이동 시간표는 장소 수의 제곱으로 커져서 한 파일에 못 담아요)
// name = 화면에 보여 줄 이름, search = 네이버지도에서 장소를 찾을 때 이름 뒤에 붙이는 말
// count = 장소 수(지역 고르기 화면에 보여 줘요. 장소를 더하면 같이 고쳐요), note = 지역 고르기 화면의 한 줄 설명, keywords = 지역 찾기에서 더 찾을 동네 이름
// area = 시·도 이름(지역 목록 묶음), router = 이동 시간 계산 출처(없으면 openrouteservice.org)
// 아래 칸은 시·도마다 달라요
//   sun      일몰 계산 기준 위치 [위도, 경도]
//   bounds   "지금 내 위치"를 쓸 수 있는 범위
//   hub      타고 떠나는 곳 (STARTS의 id "airport"). buffer = 몇 분 일찍 도착할지, bufferLabel = 화면 문구
//   extraHubs 더 있는 역·공항. start = STARTS의 id
//   taxiBase 택시 기본요금(원, 2km까지), taxiMeter 몇 m마다 100원인지,
//   taxiFarKm 장거리 할증이 붙는 거리(없으면 할증 없음), taxiFarRate 그 뒤 거리요금 배수(없으면 2배)
//   subway   지하철이 있는 곳: 지하철·버스 요금(교통카드, 원)
//   splitTransit 대중교통 칸을 regions/<id>/transit.js로 나눠 뚜벅이를 고를 때만 불러와요
//   zones    큰 도시에서 고르는 구역. 장소의 zone 칸과 맞춰요. near = "옆 구역도 조금"에서 같이 쓰는 구역
//   noBus    버스 자료가 없는 지역: "뚜벅이"를 빼고 busNote를 보여 줘요
//   noSeaSunset 바다로 해가 지지 않는 곳: 바닷가라고 노을 명소로 치지 않아요
const JEJU_AREA = {
  area: "제주", sun: [33.46, 126.33], bounds: { latMin: 33.1, latMax: 33.6, lngMin: 126.1, lngMax: 127.0 },
  hub: { label: "제주공항 (비행기)", emoji: "✈️", ride: "비행기", place: "공항", buffer: 90, bufferLabel: "1시간 반" },
  taxiBase: 4300, taxiMeter: 126, taxiFarKm: 20, taxiFarRate: 1.2 // 제주도 택시요금표 2024-07-01 시행 (20km 넘으면 126m당 120원). 2026-11-11 jeju.go.kr에서 확인
};
const GANGWON_EAST = {
  area: "강원", sun: [37.75, 128.88], bounds: { latMin: 37.45, latMax: 38.0, lngMin: 128.5, lngMax: 129.2 },
  hub: { label: "강릉역 (기차)", emoji: "🚆", ride: "기차", place: "역", buffer: 30, bufferLabel: "30분" },
  taxiBase: 4600, taxiMeter: 131, taxiFarKm: 6, taxiFarRate: 2 // 강릉시 2024-08-05 시행 요금, 6km 넘으면 거리요금 100% 할증 (파이낸셜뉴스 2024-07-29). 2026-11-11 검색에서 그 뒤 인상 소식 없음
};
const BUSAN_AREA = {
  area: "부산", sun: [35.16, 129.06], bounds: { latMin: 34.95, latMax: 35.42, lngMin: 128.75, lngMax: 129.35 },
  hub: { label: "부산역 (기차)", emoji: "🚆", ride: "기차", place: "역", buffer: 30, bufferLabel: "30분" },
  taxiBase: 4800, taxiMeter: 132, // 부산시 2023-06-01 시행 요금 (busan.go.kr 보도). 2026-11-11 검색에서 그 뒤 인상 없음(업계 인상 요구만 있음)
  extraHubs: [{ id: "gimhae", start: "gimhae", label: "김해공항 (비행기)", emoji: "✈️", ride: "비행기", place: "공항", buffer: 90, bufferLabel: "1시간 반" }],
  subway: { busFare: 1550, railFare: 1600 } // 교통카드 성인: 버스 2023-10-06, 지하철 1구간 2024-05-03 시행 (부산시 보도). 2026-11-11 검색에서 그 뒤 인상 없음
};
const REGIONS = [
  { ...JEJU_AREA, id: "aewol", count: 65, name: "애월", search: "애월" },
  { ...JEJU_AREA, id: "hallim", count: 57, name: "한림·협재", keywords: "협재 금능", search: "한림" },
  { ...JEJU_AREA, id: "jejusi", count: 66, name: "제주시내", search: "제주시" },
  { ...JEJU_AREA, id: "seogwipo", count: 61, router: "OSRM", name: "서귀포·중문", keywords: "중문 서귀포", search: "서귀포" },
  { ...JEJU_AREA, id: "east", count: 56, router: "OSRM", name: "함덕·조천·구좌", keywords: "김녕 월정리 세화", search: "제주" },
  { ...JEJU_AREA, id: "seongsan", count: 55, router: "OSRM", name: "성산·표선", search: "서귀포" },
  { ...JEJU_AREA, id: "southwest", count: 53, router: "OSRM", name: "한경·대정·안덕", keywords: "모슬포 산방산 사계", search: "제주" },
  { ...JEJU_AREA, id: "namwon", count: 37, router: "OSRM", name: "남원", search: "서귀포 남원" },
  { ...GANGWON_EAST, id: "gangneung", count: 60, router: "OSRM", name: "강릉", search: "강릉", keywords: "경포 정동진 주문진 안목", note: "차로 다니는 곳", noBus: true, noSeaSunset: true,
    busNote: "강릉은 버스 정보를 아직 넣지 않았어요. 버스 시간표가 뜸한 곳이 많아 차나 택시로 다니는 코스로 짜요." },
  { ...BUSAN_AREA, id: "busan", count: 106, router: "OSRM", name: "부산", search: "부산", keywords: "해운대 광안리 서면 남포동 영도 기장 송도", note: "지하철·버스", noSeaSunset: true, splitTransit: true,
    zones: [{ id: "east", count: 27, label: "해운대·송정·기장", near: ["gwangan"] }, { id: "gwangan", count: 20, label: "광안리·수영·남구", near: ["east", "seomyeon"] }, { id: "seomyeon", count: 19, label: "서면·전포·동래", near: ["gwangan", "nampo"] }, { id: "nampo", count: 40, label: "남포동·영도·송도·다대포", near: ["seomyeon"] }],
    busNote: "뚜벅이는 지하철과 버스로 짜요. 배차 간격은 평균이고 실시간 도착 정보는 아니에요. 휠체어 코스는 저상버스·엘리베이터 자료가 아직 없어 걷기·차 기준으로 짜요." }
];
