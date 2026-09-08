<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

const router = useRouter()

// 마이페이지에서 "또래 비교 데이터 제공" 항목이 바로 보이도록 스크롤 대상을 쿼리로 알려준다.
function goToAgreement() {
  router.push({ name: 'my', query: { scrollTo: 'compare-data-agreed' } })
}
</script>

<template>
  <section class="locked">
    <div class="locked__art">
      <span class="locked__line"></span>
      <span class="locked__line"></span>
      <span class="locked__line"></span>
      <span class="locked__lock">
        <svg class="locked__lock-icon" viewBox="0 0 11 11" aria-hidden="true">
          <rect x="3" y="0" width="5" height="1" />
          <rect x="2" y="1" width="1" height="3" />
          <rect x="8" y="1" width="1" height="3" />
          <rect x="1" y="4" width="9" height="1" />
          <rect x="1" y="5" width="1" height="5" />
          <rect x="9" y="5" width="1" height="5" />
          <rect x="5" y="6" width="1" height="3" />
          <rect x="1" y="10" width="9" height="1" />
        </svg>
      </span>
    </div>

    <span class="locked__badge">LOCKED</span>
    <h2 class="locked__title">아직 비교할 수 없어요</h2>

    <p class="locked__body">
      다른 사용자의 목표를 조회하고 싶으시다면 마이페이지에서<br />
      <b>"또래 비교 데이터 제공"</b> 약관에 동의해주세요.
    </p>

    <div class="locked__info">
      <p class="locked__info-title"><span class="locked__dot"></span>왜 동의가 필요한가요?</p>
      <ul class="locked__info-list">
        <li>내 익명화된 목표 데이터를 함께 제공하고</li>
        <li>비슷한 자산의 사용자 데이터를 볼 수 있어요</li>
      </ul>
    </div>

    <BaseButton class="locked__cta" variant="primary" size="lg" @click="goToAgreement">
      약관 동의하러 가기
    </BaseButton>
  </section>
</template>

<style scoped>
.locked {
  --badge: var(--c-value);
  /* 안내 상자는 양쪽 테마 모두 옅은 바탕에 진한 글씨로 둔다. */
  --on-pale: var(--c-pale-ink);
  --on-pale-strong: var(--c-pale-ink);

  --art-face: var(--c-accent-soft);
  --art-line: var(--c-accent-mid);
  --art-lock: var(--c-accent);
  --art-gap: var(--c-bg);
  /*
    자물쇠는 --art-lock 원 위에 올라간다. 그 원이 테마에 따라 밝은 민트와 진초록으로
    뒤집히므로 아이콘도 같이 뒤집혀야 한다. 강조색 위에 얹는 색을 뜻하는 토큰을 쓴다.
    (다크 진초록 9.5:1 / 라이트 흰색 6.5:1)
  */
  --art-lock-ink: var(--c-on-accent);

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 0;
  text-align: center;
  line-height: 1.45;
}

/*
  홈/비교/목표 상세/마이페이지와 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용해서
  잠금 화면 요소들도 순서대로 살짝 떠오르며 나타나게 한다.
*/
.locked > * {
  animation: card-rise 0.35s ease-out both;
}

.locked > *:nth-child(2) {
  animation-delay: 0.06s;
}

.locked > *:nth-child(3) {
  animation-delay: 0.12s;
}

.locked > *:nth-child(4) {
  animation-delay: 0.18s;
}

.locked > *:nth-child(5) {
  animation-delay: 0.24s;
}

.locked > *:nth-child(6) {
  animation-delay: 0.3s;
}

.locked__art {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--art-face);
}

.locked__line {
  position: absolute;
  left: 30px;
  height: 10px;
  background: var(--art-line);
}

.locked__line:nth-of-type(1) {
  top: 40px;
  width: 60px;
}

.locked__line:nth-of-type(2) {
  top: 58px;
  width: 46px;
}

.locked__line:nth-of-type(3) {
  top: 76px;
  width: 54px;
}

.locked__lock {
  position: absolute;
  top: 84px;
  left: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 4px solid var(--art-gap);
  background: var(--art-lock);
  box-sizing: border-box;
}

/*
  자물쇠는 그림 파일이 아니라 SVG로 그린다. locked.png의 11×11 격자를 사각형 여덟 개로
  옮긴 것이라 모양은 같다.

  PNG를 11칸에서 17px로 늘리면 1.5배라 어떤 줄은 두 배로 굵어지고 어떤 줄은 그대로
  남는다. 화면 배율이 125%·150%면 더 어긋난다. SVG는 도형이라 크기가 얼마든 같은
  비율로 그려진다.
*/
.locked__lock-icon {
  width: 15px;
  height: 15px;
  fill: var(--art-lock-ink);
}

.locked__badge {
  margin-top: 16px;
  border: 1px solid var(--badge);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--badge);
}

.locked__title {
  margin: 10px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--c-ink);
}

.locked__body {
  margin: 20px 0 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.7;
  color: var(--c-ink-muted);
}

.locked__body b {
  font-weight: 700;
  color: var(--c-ink);
}

.locked__info {
  width: 100%;
  margin-top: 32px;
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--c-pale-bg);
  text-align: left;
  color: var(--on-pale);
}

.locked__info-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--on-pale-strong);
}

.locked__dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: currentColor;
}

.locked__info-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11px;
  font-weight: 600;
}

.locked__info-list li {
  display: flex;
  gap: 6px;
}

.locked__info-list li + li {
  margin-top: 4px;
}

.locked__info-list li::before {
  content: '·';
}

.locked__cta {
  margin-top: 20px;
}
</style>
