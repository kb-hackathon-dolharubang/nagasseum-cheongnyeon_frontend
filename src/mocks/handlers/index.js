import { authHandlers } from '@/mocks/handlers/authHandlers'
import { assetHandlers } from '@/mocks/handlers/assetHandlers'
import { compareHandlers } from '@/mocks/handlers/compareHandlers'
import { dashboardExtrasHandlers } from '@/mocks/handlers/dashboardExtrasHandlers'
import { goalHandlers } from '@/mocks/handlers/goalHandlers'
import { memberHandlers } from '@/mocks/handlers/memberHandlers'
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
