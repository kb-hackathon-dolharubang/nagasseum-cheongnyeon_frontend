import { computed, reactive, ref } from 'vue'

import { formatEok, formatManwon } from '@/shared/utils/formatter'

// label은 화면 표시용 한글, value는 백엔드 추천 API가 기대하는 propertyType/tradeType enum 그대로.
// (HousingType = APT / ROW_HOUSE / OFFICETEL / DETACHED, DealType = JEONSE / WOLSE)
export const PROPERTY_TYPE_OPTIONS = [
  { label: '아파트', value: 'APT' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '연립·다세대', value: 'ROW_HOUSE' },
  { label: '단독·다가구', value: 'DETACHED' },
]

// 매매(PURCHASE)는 백엔드가 전월세 실거래만 수집하고 있어 지원하지 않는다.
export const TRADE_TYPE_OPTIONS = [
  { label: '전세', value: 'JEONSE' },
  { label: '월세', value: 'WOLSE' },
]

function formatPyeong(value) {
  return `${value}평`
}

// BaseYearMonthSelect가 고를 수 있는 최소 목표 시점(다음 달)과 같은 규칙.
function getNextMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1~12
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`
}

/**
 * 목표 조건을 한 화면에 하나씩 물어보는 플로우의 상태를 담는다.
 *
 * 화면 개수가 고정이 아니라는 점이 핵심이다. 월세 단계는 거래 유형으로 월세를 골랐을 때만
 * 생기므로, 단계를 배열 인덱스가 아니라 key로 추적한다. 인덱스로 추적하면 뒤로 가서 거래
 * 유형을 바꾸는 순간 단계 하나가 통째로 끼거나 빠져서 엉뚱한 화면으로 점프한다.
 */
export function useGoalConditionSteps() {
  const form = reactive({
    // 시군구 5자리(예: 11440 마포구) 또는 시도 2자리(예: 11 서울). 유일한 필수 조건이다.
    regionCode: null,
    propertyType: null,
    tradeType: null,
    // 범위형 입력은 슬라이더가 항상 어떤 값을 들고 있어야 해서 기본 범위를 미리 채워둔다.
    // 이 값이 실제로 전송될지는 answered가 결정한다.
    deposit: { min: 100000000, max: 300000000 },
    monthlyRent: { min: 300000, max: 800000 },
    size: { min: 10, max: 20 },
    targetDate: '', // BaseYearMonthSelect가 마운트 시 다음 달로 자동 보정한다
    // 만원 단위 문자열. 유일하게 기본값 없이 비워두는 입력이며, 지역과 함께 필수다.
    monthlySaving: '',
  })

  /**
   * "사용자가 이 조건에 실제로 답했는가". 슬라이더처럼 기본값이 항상 눈에 보이는 입력은
   * 값만 봐서는 답한 것과 건너뛴 것을 구분할 수 없어서 따로 기록한다.
   * 건너뛴 조건은 payload에서 null로 나가고, 그 빈 칸은 백엔드 추천 알고리즘이 알아서 채운다.
   */
  const answered = reactive({
    propertyType: false,
    tradeType: false,
    deposit: false,
    size: false,
    targetDate: false,
  })

  const isWolse = computed(() => form.tradeType === 'WOLSE')

  // 각 단계의 질문/설명은 화면이 아니라 여기 모아둔다 — 순서와 문구를 한자리에서 보기 위함.
  const steps = computed(() => {
    const list = [
      {
        key: 'region',
        kind: 'region',
        title: '어디에서\n살고 싶으세요?',
        description:
          '국토교통부 실거래가로 그 지역 시세를 확인해요. 구·군까지 정하지 않으면 시·도 안에서 찾아드릴게요.',
      },
      {
        key: 'propertyType',
        kind: 'choice',
        title: '어떤 집을\n생각하고 있나요?',
        description: '아직 정하지 않았다면 건너뛰어도 괜찮아요. 모든 형태를 놓고 찾아드릴게요.',
        options: PROPERTY_TYPE_OPTIONS,
      },
      {
        key: 'tradeType',
        kind: 'choice',
        title: '전세와 월세 중\n어느 쪽인가요?',
        description: '매매는 아직 지원하지 않아요. 건너뛰면 두 유형을 모두 살펴봅니다.',
        options: TRADE_TYPE_OPTIONS,
      },
      {
        key: 'deposit',
        kind: 'range',
        title: '보증금은 얼마까지\n생각하세요?',
        description: '지금 모은 돈이 아니라, 목표로 삼고 싶은 금액대를 골라주세요.',
        field: 'deposit',
        min: 0,
        max: 1000000000,
        step: 10000000,
        formatValue: formatEok,
      },
    ]

    // 월세를 골랐다면 월세 범위는 반드시 받아야 한다. 백엔드가 tradeType이 WOLSE인데
    // monthlyRentMax가 없으면 400으로 거절한다(GoalRecommendationRequest#isMonthlyRentRequiredForWolse).
    if (isWolse.value) {
      list.push({
        key: 'monthlyRent',
        kind: 'range',
        title: '월세는 얼마까지\n괜찮으세요?',
        description: '월세를 고르셨으니 이 단계는 건너뛸 수 없어요.',
        field: 'monthlyRent',
        min: 0,
        max: 2000000,
        step: 100000,
        formatValue: formatManwon,
      })
    }

    list.push(
      {
        key: 'size',
        kind: 'range',
        title: '집은 어느 정도\n넓이면 좋을까요?',
        description: '전용면적 기준이에요. 감이 잘 안 오면 건너뛰어도 됩니다.',
        field: 'size',
        min: 1,
        max: 50,
        step: 1,
        formatValue: formatPyeong,
      },
      {
        key: 'targetDate',
        kind: 'targetDate',
        title: '언제까지\n독립하고 싶으세요?',
        description: '시점을 정해두면 그 안에 갈 수 있는 조건을 찾아드려요.',
      },
      // 필수 항목이라 마지막에 둔다. 중간에 두면 앞뒤로 오가는 사이 비워둔 채로
      // 제출까지 도달할 여지가 생긴다.
      {
        key: 'monthlySaving',
        kind: 'amount',
        title: '매달 얼마씩\n모을 수 있나요?',
        description: '이 금액으로 목표에 언제 도달할 수 있는지 계산해요.',
      },
    )

    return list
  })

  const currentKey = ref('region')

  // 이론상 -1이 될 일은 없지만(월세 단계에 있는 동안은 거래 유형을 바꿀 수 없다),
  // 진행률 계산이 음수로 새지 않도록 0으로 막는다.
  const currentIndex = computed(() =>
    Math.max(
      steps.value.findIndex((step) => step.key === currentKey.value),
      0,
    ),
  )
  const currentStep = computed(() => steps.value[currentIndex.value])
  const totalSteps = computed(() => steps.value.length)
  const isLastStep = computed(() => currentIndex.value === totalSteps.value - 1)
  const isFirstStep = computed(() => currentIndex.value === 0)

  /**
   * 지역과 월 저축액은 필수라 채우기 전에는 다음으로 넘어갈 수 없다.
   *
   * 선택형(주거유형·거래유형)도 아무것도 고르지 않은 상태에서는 막는다. 고르지 않고 '다음'을
   * 누르면 answered만 true가 되고 값은 null이라, 결국 '이 조건은 건너뛸게요'와 완전히 같은
   * payload가 나간다 — 버튼 두 개가 같은 일을 하게 되어 사용자가 둘의 차이를 오해한다.
   * 정하지 않았다면 '건너뛸게요'로 가도록 유도한다.
   *
   * 범위형·목표 시점은 막지 않는다. 슬라이더와 연월 선택은 항상 어떤 값을 들고 있어서
   * "화면에 보이는 이 값으로 하겠다"는 확정이 성립하기 때문이다.
   */
  const canGoNext = computed(() => {
    const step = currentStep.value
    if (step.key === 'region') return Boolean(form.regionCode)
    if (step.key === 'monthlySaving') return Number(form.monthlySaving) > 0
    if (step.kind === 'choice') return Boolean(form[step.key])
    return true
  })

  // 지역·월 저축액은 필수라서, 월세는 백엔드 검증 때문에 건너뛸 수 없다.
  const canSkip = computed(
    () => !['region', 'monthlyRent', 'monthlySaving'].includes(currentStep.value.key),
  )

  function goNext() {
    if (!canGoNext.value) return false

    // 이 단계까지 왔고 다음을 눌렀다면 화면에 보이던 값을 실제 답으로 확정한다.
    if (currentStep.value.key in answered) answered[currentStep.value.key] = true

    const next = steps.value[currentIndex.value + 1]
    if (!next) return true // 마지막 단계 — 호출부가 제출로 넘긴다

    currentKey.value = next.key
    return false
  }

  function goPrev() {
    const prev = steps.value[currentIndex.value - 1]
    if (prev) currentKey.value = prev.key
  }

  /**
   * 첫 단계로 되돌린다. 추천 실패 화면의 '조건 다시 고르기'용.
   *
   * <p>입력값과 answered는 건드리지 않는다. 조건을 처음부터 다시 훑어보게 하려는 것이지
   * 답한 내용을 버리려는 것이 아니다 — 지우면 필수값(지역·월 저축액)까지 비어서 사용자가
   * 같은 값을 처음부터 다시 넣어야 한다.
   */
  function goFirst() {
    currentKey.value = steps.value[0].key
  }

  function skip() {
    if (!canSkip.value) return false

    const { key } = currentStep.value
    if (key in answered) answered[key] = false
    // 골라둔 값이 남아 있으면 "건너뛰었는데 왜 반영됐지"가 된다. 선택형은 값까지 지운다.
    if (key === 'propertyType') form.propertyType = null
    if (key === 'tradeType') form.tradeType = null

    const next = steps.value[currentIndex.value + 1]
    if (!next) return true

    currentKey.value = next.key
    return false
  }

  /*
    목표 수정으로 들어왔을 때 기존 목표(GET /goals/{goalId} 응답)를 각 단계에 채운다.

    값만 넣는 것으로는 부족하고 answered까지 세워야 한다. answered가 false면 buildPayload가
    그 조건을 null로 보내버려서, 사용자가 손대지 않은 조건이 "지정하지 않음"으로 바뀐다.
    이미 목표에 들어 있던 조건은 사용자가 한 번 답한 조건이므로 답한 것으로 취급한다.
  */
  function applyInitialValue(goal) {
    if (!goal) return

    form.regionCode = goal.regionCode ?? null

    if (goal.propertyType) {
      form.propertyType = goal.propertyType
      answered.propertyType = true
    }
    if (goal.tradeType) {
      form.tradeType = goal.tradeType
      answered.tradeType = true
    }
    if (goal.depositMin != null && goal.depositMax != null) {
      form.deposit = { min: goal.depositMin, max: goal.depositMax }
      answered.deposit = true
    }
    // 전세 목표는 서버가 월세를 0으로 정규화해 저장한다. 그대로 채우면 슬라이더가 0~0이 되어
    // 거래 유형을 월세로 바꿨을 때 범위를 처음부터 다시 잡아야 하므로 기본값을 남긴다.
    if (goal.tradeType === 'WOLSE' && goal.monthlyRentMax) {
      form.monthlyRent = { min: goal.monthlyRentMin ?? 0, max: goal.monthlyRentMax }
    }
    if (goal.sizeMin != null && goal.sizeMax != null) {
      form.size = { min: goal.sizeMin, max: goal.sizeMax }
      answered.size = true
    }
    // 목표 시점이 이미 지났으면 연/월 드롭다운의 선택지에 없다. 채우지 않고 컴포넌트가
    // 보정해둔 다음 달을 그대로 둔다(답한 것으로도 치지 않는다).
    if (goal.targetDate && goal.targetDate >= getNextMonth()) {
      form.targetDate = goal.targetDate
      answered.targetDate = true
    }
    // 저장된 값은 원 단위, 이 화면의 입력은 만원 단위다.
    if (goal.monthlySavings != null) {
      form.monthlySaving = String(Math.round(goal.monthlySavings / 10000))
    }
  }

  /** 백엔드 GoalRecommendationRequest와 1:1로 맞춘 요청 본문. 답하지 않은 조건은 null이다. */
  function buildPayload() {
    return {
      regionCode: form.regionCode,
      propertyType: answered.propertyType ? form.propertyType : null,
      tradeType: answered.tradeType ? form.tradeType : null,
      sizeMin: answered.size ? form.size.min : null,
      sizeMax: answered.size ? form.size.max : null,
      depositMin: answered.deposit ? form.deposit.min : null,
      depositMax: answered.deposit ? form.deposit.max : null,
      // 월세 범위는 거래 유형이 월세일 때만 의미가 있다. 전세로 되돌린 뒤에도 값이 남아
      // 함께 전송되면 백엔드가 쓸 수 없는 조건을 받게 되므로 여기서 잘라낸다.
      monthlyRentMin: isWolse.value ? form.monthlyRent.min : null,
      monthlyRentMax: isWolse.value ? form.monthlyRent.max : null,
      targetDate: answered.targetDate ? form.targetDate : null,
      // 화면은 만원 단위로 받고 서버에는 원 단위(Long)로 보낸다. 필드 이름과 단위는
      // GoalSaveRequest·GoalDiagnosisRequest의 monthlySavings에 맞췄다.
      monthlySavings: Number(form.monthlySaving) * 10000,
    }
  }

  return {
    form,
    answered,
    steps,
    currentKey,
    currentStep,
    currentIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canSkip,
    goNext,
    goPrev,
    goFirst,
    skip,
    applyInitialValue,
    buildPayload,
  }
}
