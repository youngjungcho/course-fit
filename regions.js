// 지역 목록. 지역마다 regions/<id>/places.js 와 travel.js 를 따로 둬요 (이동 시간표는 장소 수의 제곱으로 커져서 한 파일에 못 담아요)
// name = 화면에 보여 줄 이름, search = 네이버지도에서 장소를 찾을 때 이름 뒤에 붙이는 말
const REGIONS = [
  { id: "aewol", name: "애월", search: "애월" },
  { id: "hallim", name: "한림·협재", search: "한림" },
  { id: "jejusi", name: "제주시내", search: "제주시" },
  { id: "seogwipo", name: "서귀포·중문", search: "서귀포" },
  { id: "east", name: "함덕·조천·구좌", search: "제주" }
];
