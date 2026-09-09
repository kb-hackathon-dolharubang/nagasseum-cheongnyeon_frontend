import { computed, ref } from 'vue'

// index 0은 항상 "저축만"(대출 미적용) 고정 옵션이다.
const NO_LOAN_OPTION = { policyId: 'none', productName: '저축만', eligible: true }

// 목표 상세화면의 "대출 활용" 토글 상태와, 선택된 옵션에 따라 카드에 보여줄 progress/forecasts를
// 계산한다. detail.loanOptions가 없으면(대출 추천 이력이 없는 목표) options가 빈 배열이 되므로,
// 호출 측에서 이를 보고 토글 자체를 숨기면 된다.
export function useLoanScenario(detail) {
  const selectedIndex = ref(0)

  const options = computed(() => {
    const loanOptions = detail.value?.loanOptions
    if (!loanOptions?.length) return []
    return [NO_LOAN_OPTION, ...loanOptions]
  })

  const selectedOption = computed(() =>
    selectedIndex.value === 0 ? null : options.value[selectedIndex.value],
  )

  const isIneligible = computed(() => selectedOption.value?.eligible === false)

  const displayProgress = computed(() => selectedOption.value?.progress ?? detail.value?.progress)

  const displayForecasts = computed(
    () => selectedOption.value?.forecasts ?? detail.value?.forecasts,
  )

  return {
    selectedIndex,
    options,
    selectedOption,
    isIneligible,
    displayProgress,
    displayForecasts,
  }
}
