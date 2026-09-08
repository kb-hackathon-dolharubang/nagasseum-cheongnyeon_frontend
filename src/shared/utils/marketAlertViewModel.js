import { formatAreaRange, monthsBetweenYm } from '@/shared/utils/formatter'
import { HOUSING_TYPE_LABEL, DEAL_TYPE_LABEL } from '@/shared/constants/housing'

// GET /goals/market-trend 응답 -> MarketPriceAlertCard가 쓰는 marketAlert 뷰모델
// 홈 화면과 목표 상세 화면 양쪽에서 같은 카드를 재사용하므로 변환 로직을 공용으로 둔다.
export function toMarketAlertViewModel(marketTrend) {
  return {
    regionName: marketTrend.regionName,
    housingType: HOUSING_TYPE_LABEL[marketTrend.housingType] ?? marketTrend.housingType,
    dealType: DEAL_TYPE_LABEL[marketTrend.dealType] ?? marketTrend.dealType,
    areaLabel: formatAreaRange(marketTrend.areaMin, marketTrend.areaMax),
    updatedYm: marketTrend.updatedYm,
    currentMiddleAmount: marketTrend.currentMiddleAmount,
    predictionTargetYm: marketTrend.predictionTargetYm,
    initialMiddleAmount: marketTrend.initialMiddleAmount,
    latestPredictedMarketAmount: marketTrend.latestPredictedMarketAmount,
    predictionChangeAmount: marketTrend.predictionChangeAmount,
    targetAmount: marketTrend.targetAmount,
    maintainEta: marketTrend.maintainEta,
    reflectEta: marketTrend.reflectEta,
  }
}

// 홈 화면 "현재 목표" 카드용 "최근 시세를 반영하면 예상 시점이 N개월 빨라져요/늦어져요" 한 줄
// insight. { prefix, emphasis }로 나눠 돌려주는 이유는 문장 전체가 아니라 실제로 바뀌는 값
// (emphasis)만 강조색으로 보여주기 위함이다 — 호출부가 prefix는 기본 톤, emphasis만 primary
// green으로 렌더링한다.
//
// maintainEta(현재 목표 금액을 유지했을 때 시점)와 reflectEta(현재 시세를 반영했을 때 시점) 사이에
// 차이가 없으면 보여줄 내용이 없다는 뜻이라 null을 돌려주고, 호출부가 해당 줄을 조용히 숨긴다.
//
// reflectEta는 실제로 적용된 값이 아니라 "지금 시세로 목표를 바꾼다면"이라는 가정 시나리오다
// (목표 상세 화면의 "수정하기 버튼을 눌러주세요" 안내가 이를 뒷받침한다). 그래서 "빨라졌어요"처럼
// 이미 일어난 일로 단정하지 않고, "반영하면 ~해요"라는 조건부 문장으로 표현한다(대출 활용 카드의
// "대출을 활용하면 예상 도달 시점이 N 빨라져요"와 같은 어투).
//
// changeAmount(최근 시세가 오른 방향)와 reflectEta가 maintainEta보다 빠른지 느린지는 서로 다른
// 축이다 — 시세가 올랐어도(changeAmount>0) 현재 시세가 여전히 원래 목표 금액보다 낮으면
// reflectEta는 더 빨라질 수 있다. 그래서 "상승/하락"을 시점 변화의 원인처럼 단정하지 않고,
// 실제로 확인된 시점 변화(reflectEta vs maintainEta)만 그대로 설명한다.
export function toHomeMarketInsightLabel(marketAlert) {
  if (!marketAlert || !marketAlert.maintainEta || !marketAlert.reflectEta) return null

  const monthsDiff = monthsBetweenYm(marketAlert.maintainEta, marketAlert.reflectEta)
  if (monthsDiff === 0) return null

  const emphasis = monthsDiff > 0 ? `${monthsDiff}개월 늦어져요` : `${-monthsDiff}개월 빨라져요`
  return { prefix: '최근 시세를 반영하면 예상 시점이 ', emphasis }
}
