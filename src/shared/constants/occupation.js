export const OCCUPATION_OPTIONS = [
  { value: 'STUDENT', label: '학생' },
  { value: 'JOB_SEEKER', label: '취업 준비' },
  { value: 'OFFICE_WORKER', label: '회사원' },
  { value: 'PUBLIC_SERVANT', label: '공무원·공공기관' },
  { value: 'PROFESSIONAL', label: '전문직' },
  { value: 'SELF_EMPLOYED', label: '자영업' },
  { value: 'FREELANCER', label: '프리랜서' },
  { value: 'SOLDIER', label: '군인' },
  { value: 'OTHER', label: '기타' },
]

export const OCCUPATION_LABEL = {
  ...Object.fromEntries(OCCUPATION_OPTIONS.map(({ value, label }) => [value, label])),
  UNKNOWN: '미입력',
}
