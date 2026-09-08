import {
  AssetLinkView,
  AssetAuthView,
  AssetSyncingView,
  AssetDetailView,
  AssetManageView,
} from '@/features/asset'

// 로그인 전 자산 연동 플로우. AuthLayout 하위에 등록된다.
export const assetRoutes = [
  {
    path: 'asset-link',
    name: 'asset-link',
    component: AssetLinkView,
  },
  {
    path: 'asset-auth',
    name: 'asset-auth',
    component: AssetAuthView,
  },
  {
    path: 'asset-syncing',
    name: 'asset-syncing',
    component: AssetSyncingView,
  },
]

// 로그인 후 자산 조회 화면. 하단 네비바가 있는 MobileLayout 하위에 등록된다.
export const assetDetailRoutes = [
  {
    path: 'assets',
    name: 'asset-detail',
    component: AssetDetailView,
  },
]

export const assetManagementRoutes = [
  {
    path: 'my/asset-link',
    name: 'asset-link-additional',
    component: AssetManageView,
  },
]
