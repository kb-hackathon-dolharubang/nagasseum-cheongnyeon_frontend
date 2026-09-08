import { INCOME_BRACKET_OPTIONS } from '@/shared/constants/incomeBracket'

const DECILE_LABEL = Object.fromEntries(
  INCOME_BRACKET_OPTIONS.map((option) => [option.value, option.label]),
)

export const INCOME_BRACKET_LABEL = {
  ...DECILE_LABEL,
  UNKNOWN: '미입력',
}

export const INCOME_BRACKET_SHORT_LABEL = INCOME_BRACKET_LABEL
export const INCOME_BRACKET_BAND_LABEL = INCOME_BRACKET_LABEL

export const INCOME_BRACKET_ORDER = [
  ...INCOME_BRACKET_OPTIONS.map((option) => option.value),
  'UNKNOWN',
]
