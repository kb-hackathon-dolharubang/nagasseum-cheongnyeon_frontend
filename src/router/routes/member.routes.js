import { MyPageView, EditInfoView, TermsView, PrivacyPolicyView } from '@/features/member'

export const memberRoutes = [
  { path: 'my', name: 'my', component: MyPageView },
  { path: 'my/edit', name: 'edit-info', component: EditInfoView },
  { path: 'my/terms', name: 'terms', component: TermsView },
  { path: 'my/privacy', name: 'privacy', component: PrivacyPolicyView },
]
