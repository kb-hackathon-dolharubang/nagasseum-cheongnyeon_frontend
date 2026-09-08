export function isEmpty(value) {
  return value === null || value === undefined || value === ''
}

const BIRTH_DATE_PATTERN = /^\d{6}$/
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// "YYMMDD" 6자리 생년월일 형식 검증. 월/일 범위까지 확인한다.
export function isValidBirthDate(value) {
  if (!BIRTH_DATE_PATTERN.test(value)) return false
  const month = Number(value.slice(2, 4))
  const day = Number(value.slice(4, 6))
  return month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1]
}
