import { SEED_MEMBER } from '@/mocks/data/seed'

export const mockMemberProfile = {
  id: SEED_MEMBER.id,
  nickname: SEED_MEMBER.nickname,
  incomeBracket: SEED_MEMBER.incomeBracket,
  monthlyIncome: SEED_MEMBER.monthlyIncome,
  occupationType: SEED_MEMBER.occupationType,
  notificationAgreed: true,
  compareDataAgreed: false,
}

export const mockAgreementNotFoundResponse = {
  success: false,
  data: null,
  error: {
    code: 'AGREEMENT_NOT_FOUND',
    message: '존재하지 않는 동의 항목입니다.',
  },
}

export const mockMemberNotFoundResponse = {
  success: false,
  data: null,
  error: {
    code: 'MEMBER_001',
    message: '회원을 찾을 수 없습니다.',
  },
}
