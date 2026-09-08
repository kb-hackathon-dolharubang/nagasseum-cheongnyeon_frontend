export const mockKakaoSignupRequiredResponse = {
  success: true,
  data: {
    status: 'SIGNUP_REQUIRED',
    accessToken: null,
    refreshToken: null,
    memberId: null,
    kakaoId: '1234567890',
    kakaoNickname: '김OO',
  },
  error: null,
}

export const mockKakaoLoginResponse = {
  success: true,
  data: {
    status: 'LOGIN',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    memberId: 1,
    kakaoId: null,
    kakaoNickname: null,
  },
  error: null,
}

export const mockKakaoSignupResponse = {
  success: true,
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    memberId: 1,
  },
  error: null,
}

export const mockRefreshResponse = {
  success: true,
  data: {
    accessToken: 'mock-access-token-refreshed',
    refreshToken: 'mock-refresh-token-refreshed',
    memberId: 1,
  },
  error: null,
}

export const mockRefreshInvalidResponse = {
  success: false,
  data: null,
  error: {
    code: 'AUTH_001',
    message: '유효하지 않은 토큰입니다.',
  },
}

export const mockLogoutResponse = {
  success: true,
  data: null,
  error: null,
}
