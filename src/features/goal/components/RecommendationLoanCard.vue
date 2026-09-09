<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'

defineProps({
  loan: { type: Object, required: true },
})
</script>

<template>
  <BaseCard class="recommendation-loan-card">
    <div class="recommendation-loan-card__head">
      <span class="recommendation-loan-card__name">{{ loan.productName }}</span>
      <BaseBadge :variant="loan.statusVariant">{{ loan.statusLabel }}</BaseBadge>
    </div>

    <!-- 핵심 요건별 판정. 백엔드는 전체 적격 라벨을 주지 않고 이 목록만 준다. -->
    <ul v-if="loan.coreFindings.length > 0" class="recommendation-loan-card__findings">
      <li
        v-for="finding in loan.coreFindings"
        :key="finding.requirement"
        class="recommendation-loan-card__finding"
      >
        <div class="recommendation-loan-card__finding-head">
          <span class="recommendation-loan-card__finding-name">{{ finding.requirement }}</span>
          <BaseBadge :variant="finding.resultVariant">{{ finding.resultLabel }}</BaseBadge>
        </div>
        <p v-if="finding.basis" class="recommendation-loan-card__finding-basis">
          {{ finding.basis }}
        </p>
      </li>
    </ul>

    <!-- 대출을 꼈을 때의 저축 계획 변화 · 자금 계산. 적격일 때만 노출한다. -->
    <template v-if="loan.status === 'ELIGIBLE' && loan.plan">
      <div class="recommendation-loan-card__delta">
        <div class="recommendation-loan-card__delta-row">
          <span class="recommendation-loan-card__delta-label">월 저축</span>
          <span
            v-if="loan.delta.monthlySaving.changed"
            class="recommendation-loan-card__delta-values"
          >
            <span class="recommendation-loan-card__delta-from">{{
              loan.delta.monthlySaving.from
            }}</span>
            <span class="recommendation-loan-card__delta-arrow">→</span>
            <span class="recommendation-loan-card__delta-to">{{
              loan.delta.monthlySaving.to
            }}</span>
          </span>
          <span v-else class="recommendation-loan-card__delta-same">{{
            loan.delta.monthlySaving.to
          }}</span>
        </div>
        <div class="recommendation-loan-card__delta-row">
          <span class="recommendation-loan-card__delta-label">예상 도달 시점</span>
          <span v-if="loan.delta.targetDate.changed" class="recommendation-loan-card__delta-values">
            <span class="recommendation-loan-card__delta-from">{{
              loan.delta.targetDate.from
            }}</span>
            <span class="recommendation-loan-card__delta-arrow">→</span>
            <span class="recommendation-loan-card__delta-to">{{ loan.delta.targetDate.to }}</span>
          </span>
          <span v-else class="recommendation-loan-card__delta-same">{{
            loan.delta.targetDate.to
          }}</span>
        </div>
      </div>

      <div class="recommendation-loan-card__calc">
        <p class="recommendation-loan-card__calc-formula">
          내가 가진 돈 <strong>{{ loan.calc.ownFundsLabel }}</strong> + 대출 가능액
          <strong>{{ loan.calc.loanAmountLabel }}</strong> =
          <strong>{{ loan.calc.sumLabel }}</strong>
        </p>
        <p v-if="loan.calc.shortfallLabel" class="recommendation-loan-card__calc-result">
          목표 금액까지 <strong>{{ loan.calc.shortfallLabel }}</strong> 더 필요해요
        </p>
      </div>
    </template>

    <div v-if="loan.advice" class="recommendation-loan-card__ai-guide">
      <span class="recommendation-loan-card__ai-guide-label">AI 가이드</span>
      <p class="recommendation-loan-card__ai-guide-text">{{ loan.advice }}</p>
    </div>
  </BaseCard>
</template>

<style scoped>
.recommendation-loan-card {
  display: flex;
  flex-direction: column;
}

.recommendation-loan-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.recommendation-loan-card__name {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-loan-card__findings {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.recommendation-loan-card__finding {
  padding: 10px 0;
  border-top: 1px solid var(--color-border, #262626);
}

.recommendation-loan-card__finding-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.recommendation-loan-card__finding-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-loan-card__finding-basis {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-loan-card__delta {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
}

.recommendation-loan-card__delta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid var(--color-border, #262626);
}

.recommendation-loan-card__delta-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-loan-card__delta-values {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13.5px;
}

.recommendation-loan-card__delta-from {
  color: var(--color-text-secondary, #9aa09a);
  text-decoration: line-through;
}

.recommendation-loan-card__delta-arrow {
  color: var(--color-text-tertiary, #6f766d);
}

.recommendation-loan-card__delta-to {
  font-weight: 800;
  color: var(--color-primary, #1d6b3f);
}

.recommendation-loan-card__delta-same {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-loan-card__calc {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--color-app-bg, #111111);
}

.recommendation-loan-card__calc-formula {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
  font-variant-numeric: tabular-nums;
}

.recommendation-loan-card__calc-formula strong {
  color: var(--color-text-primary, #ffffff);
  font-weight: 700;
}

.recommendation-loan-card__calc-result {
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-loan-card__calc-result strong {
  color: var(--color-point, #c1442e);
}

.recommendation-loan-card__ai-guide {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px dashed var(--color-border, #262626);
  border-radius: 12px;
  background: var(--color-app-bg, #111111);
}

.recommendation-loan-card__ai-guide-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-tertiary, #6f766d);
}

.recommendation-loan-card__ai-guide-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
