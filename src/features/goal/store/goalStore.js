import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  postGoalDiagnosis,
  fetchGoalRecommendations,
  fetchGoalRecommendation,
  postGoal,
  fetchGoalDetail,
  fetchGoal,
  putGoal,
  deleteGoal,
  fetchMonthlySavingSimulation,
  fetchGoalMarketTrend,
  fetchGoalSummary,
} from '@/features/goal/api/goalApi'
import { toMarketAlertViewModel } from '@/features/goal/utils/marketAlertViewModel'

export const useGoalStore = defineStore('goal', () => {
  const diagnosisResult = ref(null) // 진단 결과 { budget, results }
  const isSubmitting = ref(false)
  const error = ref(null)

  // 조건 입력 플로우가 받아온 추천 대안 목록. 대안을 내지 못한 알고리즘은 응답에서 빠지므로
  // 길이가 4보다 작을 수 있고, 조건에 따라 아예 0개일 수도 있다.
  const recommendations = ref([])
  const isRecommending = ref(false)
  const recommendError = ref(null)

  // 진단 결과 화면(GET /goals/recommendation) 응답에서 recommendations를 제외한 나머지 —
  // 세 계획에 공통으로 적용된 진단 기준(현재 활용 가능 자금/월 저축/목표 시점). 아직 응답에
  // 없을 수 있어 null로 시작하고, 없으면 화면에서 "이번 진단 기준" 영역 자체를 숨긴다.
  const recommendationBasis = ref(null)

  // 진단을 마치고 결과 화면에 "처음" 들어왔을 때만 안내 문구가 중앙에서 나타나 상단으로
  // 이동하는 인트로 애니메이션을 재생하기 위한 1회성 신호. GoalConditionStepsView.submit()이
  // 결과 화면으로 넘어가기 직전에 true로 세팅하고, GoalRecommendationsView는 마운트 시 이
  // 값을 한 번 읽자마자 바로 false로 되돌린다(consume-once) — 그래서 상세 화면을 갔다가
  // 돌아오는 등 이후 재진입에서는 항상 false이고, 기존 결과 화면 애니메이션만 그대로 탄다.
  const playResultIntro = ref(false)

  const isSaving = ref(false)
  const saveError = ref(null)

  // 목표 수정 화면이 폼을 채우는 데 쓰는 기존 목표 원본(GET /goals/{goalId} 응답).
  // 상세 조회(goalDetail)와 달리 regionCode·평수·보증금 범위 등 입력값 그대로가 들어 있다.
  const goalForEdit = ref(null)
  const isLoadingGoal = ref(false)
  const goalLoadError = ref(null)

  /*
    지금 수정 중인 목표의 id. 조건 입력 화면(GoalConditionStepsView)이 진입할 때 세우고,
    저장을 실제로 하는 추천 상세 화면(RecommendationDetailView)이 읽어 POST/PUT을 가른다.
    생성과 수정이 화면을 그대로 공유하기 때문에, 어느 쪽으로 들어왔는지를 화면 사이에
    전달할 곳이 필요하다. 생성으로 들어오면 null로 되돌아간다.
  */
  const editingGoalId = ref(null)

  const goalDetail = ref(null) // 목표 상세 조회 결과 { housing, progress, savingStatus, forecasts, ... }
  const isLoadingDetail = ref(false)
  const detailError = ref(null)

  // 목표 상세 화면 맨 아래 시세 변화 카드용. 목표 상세 조회와 독립적이라 실패해도 나머지 화면엔 영향 없다.
  const marketAlert = ref(null)

  /*
    목표 요약(달성률). 홈의 등반 카드가 쓰는 GET /goals/summary와 같은 응답이다.
    마이페이지의 등반 고도도 이 값을 보게 해서, 두 화면이 다른 숫자를 보여주지 않도록 한다.
  */
  const goalSummary = ref(null)

  const isUpdating = ref(false)
  const updateError = ref(null)

  const isDeleting = ref(false)
  const deleteError = ref(null)

  // 직접 입력한 월 저축액의 예상 달성 시점. 상세 조회 forecasts[] 항목과 같은 형태다.
  const savingSimulation = ref(null)
  const isSimulating = ref(false)
  const simulationError = ref(null)
  // 입력할 때마다 호출되므로 응답이 역순으로 도착할 수 있다. 마지막 요청 결과만 반영한다.
  let latestSimulationId = 0

  async function submitDiagnosis(payload) {
    isSubmitting.value = true
    error.value = null

    try {
      diagnosisResult.value = await postGoalDiagnosis(payload)
    } catch (e) {
      // 백엔드가 {success:false, error:{code,message,fields}}로 내려주므로, 있으면 그 메시지를 그대로 쓴다.
      error.value = e.response?.data?.error ?? e
    } finally {
      isSubmitting.value = false
    }
  }

  // 조건 입력을 마치고 추천 목록을 불러온다. 호출부(로딩 화면)가 성공/실패로 화면을 갈라야 해서
  // 에러를 상태에만 담지 않고 boolean으로도 돌려준다.
  async function loadRecommendations(condition) {
    isRecommending.value = true
    recommendError.value = null

    try {
      const result = await fetchGoalRecommendations(condition)
      // 추천이 0개여도 정상 응답이다 — 화면에서 "조건에 맞는 대안 없음"으로 구분해 다룬다.
      recommendations.value = result?.recommendations ?? []
      return true
    } catch (e) {
      // 백엔드가 {success:false, error:{code,message,fields}}로 내려주므로, 있으면 그 메시지를 그대로 쓴다.
      recommendError.value = e.response?.data?.error ?? e
      recommendations.value = []
      return false
    } finally {
      isRecommending.value = false
    }
  }

  // 진단 결과 화면(추천 계획 비교 리스트)에 진입할 때 호출한다. 조건 입력 단계에서 이미
  // recommendations를 채워뒀더라도, 이 화면은 서버가 들고 있는 값을 다시 받아와 최신 상태로
  // 덮어쓴다 — 새로고침이나 링크로 직접 들어와도 store에만 의존하지 않도록 하기 위함.
  async function loadRecommendationResult() {
    isRecommending.value = true
    recommendError.value = null

    try {
      const result = await fetchGoalRecommendation()
      recommendations.value = result?.recommendations ?? []
      // recommendations를 뺀 나머지 필드가 공통 진단 기준이다. 필드가 하나도 없는 구버전
      // 응답이면 빈 객체가 되는데, 이때는 toDiagnosisBasisViewModel이 빈 배열을 돌려줘
      // 화면에서 자연히 숨겨진다.
      const basis = { ...result }
      delete basis.recommendations
      recommendationBasis.value = basis
      return true
    } catch (e) {
      recommendError.value = e.response?.data?.error ?? e
      recommendations.value = []
      recommendationBasis.value = null
      return false
    } finally {
      isRecommending.value = false
    }
  }

  /*
    추천 상세 화면의 "이 계획으로 목표 설정하기" 저장.

    이 화면은 목표 생성과 수정 양쪽의 마지막 단계다. 둘은 요청 본문이 완전히 같고 엔드포인트만
    POST/PUT으로 갈리므로, 호출부가 구분하지 않아도 되도록 여기서 가른다 — 어느 쪽으로 들어왔는지는
    조건 입력 화면이 세워둔 editingGoalId가 알려준다.

    수정을 생성으로 잘못 보내면 저장 자체가 실패한다(활성 목표가 이미 있으면 POST는
    GOAL_003 "이미 활성 목표가 존재합니다"로 거부된다).
  */
  async function saveGoal(payload) {
    isSaving.value = true
    saveError.value = null

    try {
      const goalId = editingGoalId.value
      const saved = goalId ? await putGoal(goalId, payload) : await postGoal(payload)

      // 저장이 끝나면 비운다. 남겨두면 다음에 만드는 새 목표가 조용히 수정으로 새어나간다.
      editingGoalId.value = null
      return saved
    } catch (e) {
      saveError.value = e.response?.data?.error ?? e
      return null
    } finally {
      isSaving.value = false
    }
  }

  /*
    목표 수정 화면이 폼을 기존 목표 값으로 채우기 위해 호출한다.
    상세 조회(loadGoalDetail)는 화면 표시용으로 가공된 응답이라 지역이 이름으로만 들어 있어
    폼을 되돌릴 수 없다. GET /goals/{goalId}는 저장 요청과 같은 평평한 구조 — 특히 regionCode를
    그대로 내려주므로, 이 응답만 폼 초기값으로 쓸 수 있다.
  */
  async function loadGoal(goalId) {
    isLoadingGoal.value = true
    goalLoadError.value = null
    // 이전에 열었던 목표가 남아 있으면 새 목표를 받아오기 전 한 프레임 동안 폼에 채워진다. 먼저 비운다.
    goalForEdit.value = null

    try {
      goalForEdit.value = await fetchGoal(goalId)
      return true
    } catch (e) {
      goalLoadError.value = e.response?.data?.error ?? e
      goalForEdit.value = null
      return false
    } finally {
      isLoadingGoal.value = false
    }
  }

  // 진단 화면을 수정 모드로 들어왔을 때 쓴다. 생성(saveGoal)과 요청 본문 스키마가 완전히 같고
  // 엔드포인트만 POST -> PUT으로 바뀌므로, 호출부가 상태를 따로 다루지 않도록 isSaving/saveError를
  // 그대로 공유한다.
  async function updateGoal(goalId, payload) {
    isSaving.value = true
    saveError.value = null

    try {
      return await putGoal(goalId, payload)
    } catch (e) {
      saveError.value = e.response?.data?.error ?? e
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function loadGoalDetail(goalId) {
    isLoadingDetail.value = true
    detailError.value = null

    try {
      goalDetail.value = await fetchGoalDetail(goalId)
    } catch (e) {
      detailError.value = e
      goalDetail.value = null
    } finally {
      isLoadingDetail.value = false
    }
  }

  /**
   * 활성 목표가 없으면 이 API는 실패한다. 오류가 아니라 "아직 오를 산이 없음"이라는 상태라
   * 에러를 따로 담지 않고 null로 비운다 — 호출부는 그때 0%로 표시한다.
   */
  async function loadGoalSummary() {
    try {
      goalSummary.value = await fetchGoalSummary()
    } catch {
      goalSummary.value = null
    }
  }

  // 실패해도 조용히 카드만 숨기면 되므로 별도 에러 상태 없이 marketAlert를 null로 둔다.
  async function loadMarketAlert() {
    try {
      marketAlert.value = toMarketAlertViewModel(await fetchGoalMarketTrend())
    } catch {
      marketAlert.value = null
    }
  }

  async function loadSavingSimulation(goalId, monthlySaving) {
    const requestId = ++latestSimulationId
    isSimulating.value = true
    simulationError.value = null

    try {
      const result = await fetchMonthlySavingSimulation(goalId, monthlySaving)
      if (requestId !== latestSimulationId) return
      savingSimulation.value = result
    } catch (e) {
      // 계산에 실패하면 이전 결과를 남겨두지 않는다 (틀린 날짜를 보여주는 것보다 안 보여주는 편이 낫다)
      if (requestId !== latestSimulationId) return
      savingSimulation.value = null
      simulationError.value = e
    } finally {
      if (requestId === latestSimulationId) isSimulating.value = false
    }
  }

  // 진행 중인 요청 결과까지 버린다 (추천 금액으로 되돌아가거나 팝업을 닫을 때)
  function clearSavingSimulation() {
    latestSimulationId += 1
    savingSimulation.value = null
    simulationError.value = null
    isSimulating.value = false
  }

  // 월 저축액만 바꾸는 화면이지만 목표 수정 API가 전체 교체(PUT)라, 기존 목표를 먼저 조회해
  // 나머지 필드(목표 금액/시점/주거 조건)를 그대로 실어 보낸다. 상세 조회 응답에는 지역 "코드"가
  // 없어서 detail 값만으로는 요청 본문을 만들 수 없다.
  // 조회 응답(GoalResponse)과 수정 요청 본문은 필드 구성이 같아, 월 저축액만 갈아끼우면 된다.
  async function updateMonthlySaving(goalId, monthlySaving) {
    isUpdating.value = true
    updateError.value = null

    try {
      const goal = await fetchGoal(goalId)
      await putGoal(goalId, {
        regionCode: goal.regionCode,
        propertyType: goal.propertyType,
        tradeType: goal.tradeType,
        sizeMin: goal.sizeMin,
        sizeMax: goal.sizeMax,
        depositMin: goal.depositMin,
        depositMax: goal.depositMax,
        monthlyRentMin: goal.monthlyRentMin,
        monthlyRentMax: goal.monthlyRentMax,
        targetDate: goal.targetDate,
        targetAmount: goal.targetAmount,
        targetRentMiddleAmount: goal.targetRentMiddleAmount,
        monthlySavings: monthlySaving,
      })
      return true
    } catch (e) {
      updateError.value = e
      return false
    } finally {
      isUpdating.value = false
    }
  }

  // 목표 상세 화면 맨 아래 삭제 버튼. 삭제 후엔 상세 화면에 더 보여줄 목표가 없으므로 비운다.
  async function removeGoal(goalId) {
    isDeleting.value = true
    deleteError.value = null

    try {
      await deleteGoal(goalId)
      goalDetail.value = null
      return true
    } catch (e) {
      deleteError.value = e.response?.data?.error ?? e
      return false
    } finally {
      isDeleting.value = false
    }
  }

  return {
    diagnosisResult,
    isSubmitting,
    error,
    submitDiagnosis,
    recommendations,
    isRecommending,
    recommendError,
    recommendationBasis,
    playResultIntro,
    loadRecommendations,
    loadRecommendationResult,
    isSaving,
    saveError,
    saveGoal,
    goalForEdit,
    isLoadingGoal,
    goalLoadError,
    editingGoalId,
    loadGoal,
    updateGoal,
    goalDetail,
    isLoadingDetail,
    detailError,
    loadGoalDetail,
    marketAlert,
    goalSummary,
    loadGoalSummary,
    loadMarketAlert,
    isUpdating,
    updateError,
    updateMonthlySaving,
    isDeleting,
    deleteError,
    removeGoal,
    savingSimulation,
    isSimulating,
    simulationError,
    loadSavingSimulation,
    clearSavingSimulation,
  }
})
