// 임시 지역 데이터 — 백엔드에 지역 코드 마스터 API(GET /api/v1/regions 등)가 아직 없어
// 프론트에 하드코딩. 실제 법정동 코드(시군구 5자리) 기준이며, 백엔드 API가 확정되면 교체 필요.
// 서울 25개 구는 전체, 그 외 시/도는 대표 구/군 일부만 채워둠 — 없는 시/도는 빈 배열.
export const SIDO_LIST = [
  { code: '11', name: '서울특별시' },
  { code: '26', name: '부산광역시' },
  { code: '27', name: '대구광역시' },
  { code: '28', name: '인천광역시' },
  { code: '29', name: '광주광역시' },
  { code: '30', name: '대전광역시' },
  { code: '31', name: '울산광역시' },
  { code: '36', name: '세종특별자치시' },
  { code: '41', name: '경기도' },
  { code: '42', name: '강원특별자치도' },
  { code: '43', name: '충청북도' },
  { code: '44', name: '충청남도' },
  { code: '45', name: '전북특별자치도' },
  { code: '46', name: '전라남도' },
  { code: '47', name: '경상북도' },
  { code: '48', name: '경상남도' },
  { code: '50', name: '제주특별자치도' },
]

export const GUGUN_BY_SIDO = {
  11: [
    { code: '11110', name: '종로구' },
    { code: '11140', name: '중구' },
    { code: '11170', name: '용산구' },
    { code: '11200', name: '성동구' },
    { code: '11215', name: '광진구' },
    { code: '11230', name: '동대문구' },
    { code: '11260', name: '중랑구' },
    { code: '11290', name: '성북구' },
    { code: '11305', name: '강북구' },
    { code: '11320', name: '도봉구' },
    { code: '11350', name: '노원구' },
    { code: '11380', name: '은평구' },
    { code: '11410', name: '서대문구' },
    { code: '11440', name: '마포구' },
    { code: '11470', name: '양천구' },
    { code: '11500', name: '강서구' },
    { code: '11530', name: '구로구' },
    { code: '11545', name: '금천구' },
    { code: '11560', name: '영등포구' },
    { code: '11590', name: '동작구' },
    { code: '11620', name: '관악구' },
    { code: '11650', name: '서초구' },
    { code: '11680', name: '강남구' },
    { code: '11710', name: '송파구' },
    { code: '11740', name: '강동구' },
  ],
  26: [
    { code: '26110', name: '중구' },
    { code: '26140', name: '서구' },
    { code: '26170', name: '동구' },
    { code: '26200', name: '영도구' },
    { code: '26230', name: '부산진구' },
    { code: '26260', name: '동래구' },
    { code: '26290', name: '남구' },
    { code: '26320', name: '북구' },
    { code: '26350', name: '해운대구' },
    { code: '26380', name: '사하구' },
  ],
  41: [
    { code: '41111', name: '수원시 장안구' },
    { code: '41113', name: '수원시 팔달구' },
    { code: '41131', name: '성남시 수정구' },
    { code: '41133', name: '성남시 중원구' },
    { code: '41135', name: '성남시 분당구' },
    { code: '41190', name: '부천시' },
    { code: '41210', name: '광명시' },
    { code: '41273', name: '고양시 덕양구' },
    { code: '41281', name: '고양시 일산동구' },
    { code: '41285', name: '고양시 일산서구' },
  ],
  28: [
    { code: '28110', name: '중구' },
    { code: '28140', name: '동구' },
    { code: '28177', name: '미추홀구' },
    { code: '28185', name: '연수구' },
    { code: '28200', name: '남동구' },
    { code: '28237', name: '부평구' },
    { code: '28245', name: '계양구' },
    { code: '28260', name: '서구' },
  ],

  27: [],
  29: [],
  30: [],
  31: [],
  36: [],
  42: [],
  43: [],
  44: [],
  45: [],
  46: [],
  47: [],
  48: [],
  50: [],
}

// 구/군 코드로 찾는 동(읍/면/동) 목록. 상담 예약의 희망 주거 조건처럼 동 단위까지 필요한
// 화면에서만 쓴다 - 시연에 필요한 구/군만 채워뒀고, 나머지는 GUGUN_BY_SIDO의 빈 배열과
// 같은 방식으로 빈 배열([])로 둔다.
export const DONG_BY_GUGUN = {
  11440: [
    { code: '11440-SEOGYO', name: '서교동' },
    { code: '11440-HAPJEONG', name: '합정동' },
    { code: '11440-YEONNAM', name: '연남동' },
    { code: '11440-MANGWON', name: '망원동' },
  ],
  11200: [
    { code: '11200-SEONGSU1', name: '성수동1가' },
    { code: '11200-SEONGSU2', name: '성수동2가' },
  ],
}

// 구/군 코드로 "시/도 구/군" 라벨을 찾는다 (진단 결과 팝업의 조건 요약줄 등에 사용)
export function getRegionLabel(gugunCode) {
  for (const sido of SIDO_LIST) {
    const gugun = GUGUN_BY_SIDO[sido.code]?.find((item) => item.code === gugunCode)
    if (gugun) return `${sido.name} ${gugun.name}`
  }
  return ''
}

export function findRegionBySigunguCode(gugunCode) {
  for (const sido of SIDO_LIST) {
    const gugun = GUGUN_BY_SIDO[sido.code]?.find((item) => item.code === gugunCode)
    if (gugun) return { sidoName: sido.name, sigunguName: gugun.name, sidoCode: sido.code }
  }
  return null
}
