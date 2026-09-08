<script setup>
const props = defineProps({
  policy: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function openApplyUrl() {
  if (props.policy?.applyUrl) {
    window.open(props.policy.applyUrl, '_blank', 'noopener,noreferrer')
  }
}

function getDeadlineText(policy) {
  if (policy.applyPeriodType === '상시') return '상시 모집'
  if (policy.applyStartDate && policy.applyEndDate) {
    return `${policy.applyStartDate} ~ ${policy.applyEndDate}`
  }
  if (policy.applyEndDate) return `~ ${policy.applyEndDate}`
  return '-'
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal__top-bar">
          <button type="button" class="modal__close" @click="emit('close')">✕</button>
        </div>

        <div v-if="loading" class="modal__loading">
          <span class="modal__loading-spinner" />
        </div>

        <template v-else-if="policy">
          <div class="modal__header">
            <span class="modal__category">{{ policy.largeCategory }}</span>
          </div>

          <h2 class="modal__name">{{ policy.policyName }}</h2>
          <p class="modal__summary">{{ policy.policySummary }}</p>

          <div v-if="policy.conditions?.length" class="modal__conditions">
            <div class="modal__conditions-header">
              <span class="modal__conditions-label">내 조건 매칭</span>
              <span class="modal__conditions-score">
                {{ policy.matchCount }}/{{ policy.totalConditions }}
              </span>
            </div>
            <ul class="modal__conditions-list">
              <li
                v-for="condition in policy.conditions"
                :key="condition.text"
                class="modal__condition"
                :class="{ 'modal__condition--unmet': !condition.met }"
              >
                <span class="modal__condition-icon">{{ condition.met ? '✓' : '✗' }}</span>
                <span>{{ condition.text }}</span>
              </li>
            </ul>
          </div>

          <div class="modal__info">
            <div class="modal__info-row">
              <span class="modal__info-label">혜택</span>
              <span class="modal__info-value">{{ policy.benefitDescription }}</span>
            </div>
            <div class="modal__info-row">
              <span class="modal__info-label">신청 기간</span>
              <span class="modal__info-value">{{ getDeadlineText(policy) }}</span>
            </div>
            <div class="modal__info-row">
              <span class="modal__info-label">주관 기관</span>
              <span class="modal__info-value">{{ policy.providingOrgName }}</span>
            </div>
            <div v-if="policy.targetDescription" class="modal__info-row">
              <span class="modal__info-label">지원 대상</span>
              <span class="modal__info-value">{{ policy.targetDescription }}</span>
            </div>
          </div>

          <button type="button" class="modal__cta" @click="openApplyUrl">신청 페이지 이동</button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.modal {
  width: 100%;
  max-width: 368px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--color-surface, #161616);
  border: 1px solid var(--color-border, #262626);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal__top-bar {
  display: flex;
  justify-content: flex-end;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary, #9aa09a);
  font-size: 16px;
  cursor: pointer;
}

.modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}

.modal__loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border, #262626);
  border-top-color: var(--color-primary, #1d6b3f);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal__category {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: var(--color-primary-soft, #e3ffe8);
  color: var(--color-primary, #1d6b3f);
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  font-family: var(--sans-normal);
}

.modal__name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  line-height: 1.35;
  font-family: var(--sans-normal);
}

.modal__summary {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
  line-height: 1.6;
  font-family: var(--sans-normal);
}

.modal__conditions {
  background: rgba(29, 107, 63, 0.1);
  border: 1px solid var(--color-primary, #1d6b3f);
  border-radius: 12px;
  padding: 12px;
}

.modal__conditions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal__conditions-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
  font-family: var(--sans-normal);
}

.modal__conditions-score {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
  font-family: var(--sans-normal);
}

.modal__conditions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal__condition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-primary, #1d6b3f);
  font-family: var(--sans-normal);
}

.modal__condition--unmet {
  color: var(--color-text-tertiary, #6f766d);
}

.modal__condition-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.modal__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--color-border, #262626);
}

.modal__info-row {
  display: flex;
  gap: 10px;
  font-family: var(--sans-normal);
}

.modal__info-label {
  flex-shrink: 0;
  width: 60px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary, #6f766d);
}

.modal__info-value {
  font-size: 13px;
  color: var(--color-text-primary, #ffffff);
  line-height: 1.5;
}

.modal__cta {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
  font-size: 14px;
  font-weight: 700;
  font-family: var(--sans-normal);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.modal__cta:active {
  opacity: 0.8;
}
</style>
