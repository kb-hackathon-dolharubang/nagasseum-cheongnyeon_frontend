import { authHandlers } from '@/mocks/handlers/authHandlers'
import { assetHandlers } from '@/mocks/handlers/assetHandlers'
import { compareHandlers } from '@/mocks/handlers/compareHandlers'
import { dashboardExtrasHandlers } from '@/mocks/handlers/dashboardExtrasHandlers'
import { goalHandlers } from '@/mocks/handlers/goalHandlers'
import { memberHandlers } from '@/mocks/handlers/memberHandlers'
// consult 도메인은 예약/채팅/종료는 실제 톰캣 백엔드로 검증 중이라 그 핸들러들은 등록하지
// 않는다 - consultHandlers는 아직 백엔드에 없는 리포트 조회만 mock한다 (consultHandlers.js 참고)
import { consultHandlers } from '@/mocks/handlers/consultHandlers'
import { policyHandlers } from '@/mocks/handlers/policyHandlers'

export const handlers = [
  ...authHandlers,
  ...assetHandlers,
  ...compareHandlers,
  ...dashboardExtrasHandlers,
  ...goalHandlers,
  ...memberHandlers,
  ...consultHandlers,
  ...policyHandlers,
]
