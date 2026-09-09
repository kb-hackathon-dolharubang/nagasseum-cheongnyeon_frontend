// 시연 녹화용 상태. "목표가 아직 없는 사용자"로 앱을 시작해, 홈의 목표 만들기 → 진단 →
// 추천 선택 → 목표 확정까지를 한 번에 촬영할 수 있게 한다.
//
// 켜는 법 (브라우저 콘솔):
//   localStorage.setItem('demo-no-goal', 'true')   // 새로고침하면 목표 없는 상태로 시작
//   localStorage.removeItem('demo-no-goal')        // 평소 상태로 복귀
//
// 켜져 있어도 POST /api/v1/goals가 성공하면 그때부터 목표가 있는 것으로 바뀌므로, 촬영 중
// 목표를 만들면 홈·비교 화면이 바로 목표가 있는 화면으로 이어진다. 이 전환은 메모리에만
// 남아서 새로고침하면 다시 "목표 없음"으로 돌아간다 — 재촬영은 F5 한 번이면 된다.
//
// 기본값은 "목표 있음"이다. 이 스위치를 켜지 않은 팀원의 개발 환경은 지금까지와 똑같이
// 처음부터 목표가 있는 상태로 뜬다.
const DEMO_NO_GOAL_KEY = 'demo-no-goal'

function readDemoSwitch() {
  try {
    return localStorage.getItem(DEMO_NO_GOAL_KEY) === 'true'
  } catch {
    // 프라이빗 모드 등에서 localStorage 접근 자체가 막히면 평소 상태로 둔다.
    return false
  }
}

let goalCreated = !readDemoSwitch()

export function hasActiveGoal() {
  return goalCreated
}

export function markGoalCreated() {
  goalCreated = true
}
