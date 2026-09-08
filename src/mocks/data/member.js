export const mockMemberProfile = {
  id: 1,
  nickname: '김OO',
  incomeBracket: 'INCOME_DECILE_2_3',
  monthlyIncome: 3000000,
  occupationType: 'OFFICE_WORKER',
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
