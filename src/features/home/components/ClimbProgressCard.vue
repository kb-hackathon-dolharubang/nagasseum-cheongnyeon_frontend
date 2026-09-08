<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatManwon } from '@/shared/utils/formatter'

import climbBackground from '@/assets/images/climb-bg.png'
import { useAvatar } from '@/shared/composables/useAvatar'

/**
 * 목표가 없으면 climb·goal이 null로 온다. 그때도 일러스트는 그대로 보여주고
 * 캐릭터만 출발점에 세운다. 목표를 세우면 이 산을 오르게 된다는 걸 그림으로 보여주려는 것이다.
 */
const props = defineProps({
  climb: { type: Object, default: null },
  goal: { type: Object, default: null },
})

defineEmits(['create-goal'])

// 산을 오르는 캐릭터는 회원이 고른 프로필 캐릭터와 같아야 한다
const { avatarSrc } = useAvatar()

const hasGoal = computed(() => Boolean(props.goal && props.climb))

/**
 * 길 위의 기준점. 달성률을 좌표로 바꾸는 데 쓴다.
 *
 * <p>값은 배경 이미지(climb-bg.png) 기준 백분율이다. 길이 지그재그라 달성률을 좌표로
 * 바로 환산할 수 없어서, 배경의 길 픽셀에서 10% 간격으로 중심점을 뽑아뒀다.
 * 그 사이는 직선으로 잇는다.
 */
const PATH = [
  { at: 0, left: 44.5, top: 99.8 },
  { at: 10, left: 47.1, top: 93.2 },
  { at: 20, left: 52.5, top: 86.7 },
  { at: 30, left: 58.5, top: 80.1 },
  { at: 40, left: 61.3, top: 73.5 },
  { at: 50, left: 57.8, top: 67.0 },
  { at: 60, left: 49.5, top: 60.4 },
  { at: 70, left: 43.4, top: 53.8 },
  { at: 80, left: 50.7, top: 47.3 },
  { at: 90, left: 54.4, top: 40.7 },
  { at: 100, left: 49.9, top: 34.2 },
]

const progress = computed(() =>
  hasGoal.value ? Math.min(100, Math.max(0, props.climb.progressPercent)) : 0,
)

/**
 * 화면에 실제로 그려지는 진행률. 캐릭터 위치는 이 값을 따라간다.
 *
 * <p>목표 퍼센트(progress)는 카드가 열리자마자 최종값이라, 그대로 쓰면 캐릭터가
 * 처음부터 도착 지점에 서 있게 된다. 0에서 출발해 목표까지 프레임마다 조금씩 올려서
 * 지그재그 길을 따라 걸어 올라가는 것처럼 보이게 한다.
 */
const displayProgress = ref(0)

let rafId = null

function animateProgressTo(target) {
  if (rafId !== null) cancelAnimationFrame(rafId)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    displayProgress.value = target
    return
  }

  const from = displayProgress.value
  const duration = 1500
  const start = performance.now()

  const step = (now) => {
    const elapsed = now - start
    const t = Math.min(1, elapsed / duration)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out

    displayProgress.value = from + (target - from) * eased

    rafId = t < 1 ? requestAnimationFrame(step) : null
  }

  rafId = requestAnimationFrame(step)
}

watch(progress, (target) => animateProgressTo(target), { immediate: true })

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})

/** 기준점 두 개를 찾아 그 사이를 비례로 나눈다. */
const climberPosition = computed(() => {
  const value = displayProgress.value
  let from = PATH[0]
  let to = PATH[PATH.length - 1]

  for (let i = 0; i < PATH.length - 1; i++) {
    if (value >= PATH[i].at && value <= PATH[i + 1].at) {
      from = PATH[i]
      to = PATH[i + 1]
      break
    }
  }

  const span = to.at - from.at
  const ratio = span === 0 ? 0 : (value - from.at) / span

  return {
    left: `${from.left + (to.left - from.left) * ratio}%`,
    top: `${from.top + (to.top - from.top) * ratio}%`,
  }
})

/* ------------------------------------------------------------------ */

/**
 * 게이지 10칸 각각의 채움 비율(0~100).
 *
 * <p>반올림해서 칸 단위로 채우지 않는다. 27%면 두 칸은 100%, 세 번째 칸은 70%,
 * 나머지는 0%다 — 세 칸이 다 찬 것처럼 보이면 안 된다. 채워지는 색은 다 찬 칸과
 * 동일하게 둔다(부분 채움만 다른 색으로 표시하지 않는다).
 */
const segments = computed(() =>
  Array.from({ length: 10 }, (_, i) => {
    const segmentStart = i * 10
    const segmentEnd = segmentStart + 10

    if (progress.value >= segmentEnd) return 100
    if (progress.value <= segmentStart) return 0
    return ((progress.value - segmentStart) / 10) * 100
  }),
)
</script>

<template>
  <div class="climb-progress-card">
    <div class="climb-card__illustration">
      <img class="climb-card__bg" :src="climbBackground" alt="" />

      <div class="climb-card__climber" :style="climberPosition">
        <img class="climb-card__climber-img" :src="avatarSrc" alt="" />
      </div>
    </div>

    <BaseCard class="climb-card__body">
      <template v-if="!hasGoal">
        <div class="climb-card__status">
          <span class="climb-card__quest-badge">NEW QUEST</span>
          <span class="climb-card__quest-label">아직 오를 정상이 없어요</span>
        </div>

        <div class="climb-card__empty">
          <p class="climb-card__empty-title">목표를 정하면 등반을 시작해요</p>
          <p class="climb-card__empty-desc">
            원하는 동네와 보증금을 입력하면 구간별 등반 계획을 만들어 드려요
          </p>
          <BaseButton
            variant="quest"
            size="md"
            class="climb-card__empty-cta"
            @click="$emit('create-goal')"
          >
            + 목표 설정하러 가기
          </BaseButton>
        </div>
      </template>

      <template v-else>
        <p class="climb-card__title">집까지 {{ progress }}% 왔어요</p>

        <div class="climb-card__amounts">
          <span class="climb-card__amount-item">
            <strong class="climb-card__amount-value">{{
              formatManwon(climb.currentAmount)
            }}</strong>
            <span class="climb-card__amount-label">모음</span>
          </span>
          <span class="climb-card__amount-item">
            <strong class="climb-card__amount-value">{{
              formatManwon(climb.remainingAmount)
            }}</strong>
            <span class="climb-card__amount-label">남음</span>
          </span>
        </div>

        <div class="climb-card__segments">
          <span v-for="(percent, i) in segments" :key="i" class="climb-card__segment">
            <span class="climb-card__segment-fill" :style="{ width: `${percent}%` }" />
          </span>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<style scoped>
.climb-progress-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  /* 일러스트+진행바 띠가 시각적으로 하나의 카드라, 그림자도 둘을 합친 바깥 테두리 기준으로
     한 번만 준다. 안쪽 BaseCard(.climb-card__body) 자체 그림자는 아래에서 꺼둔다. */
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* ── 일러스트 ─────────────────────────────────────────────── */

.climb-card__illustration {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  /* 배경 이미지가 높이를 정한다. 값을 따로 주면 이미지와 좌표가 어긋난다. */
  line-height: 0;
}

/* 픽셀 그림은 브라우저가 부드럽게 늘리면 뿌옇게 뭉갠다. */
.climb-card__illustration img {
  image-rendering: pixelated;
}

.climb-card__bg {
  display: block;
  width: 100%;
  height: auto;
}

/*
  캐릭터 폭은 (스프라이트 원본 폭 ÷ 배경 원본 폭) × 100 으로 준다.
*/
.climb-card__climber {
  position: absolute;
  width: 13%;
  /* 발끝이 길에 닿아야 해서 아래쪽을 기준으로 잡는다. */
  transform: translate(-50%, -100%);
  /* 길을 따라 걸어 올라가는 움직임은 requestAnimationFrame으로 프레임마다 좌표를
     직접 갱신해서 만든다(스크립트의 animateProgressTo). 여기서 또 transition을 걸면
     이미 완화(ease)된 값 위에 한 번 더 완화가 걸려 움직임이 밀리듯 어긋난다. */
}

.climb-card__climber-img {
  display: block;
  width: 100%;
}

/* 화면 움직임을 꺼둔 사용자는 스크립트의 prefersReducedMotion 분기에서
   애니메이션 없이 바로 최종 위치로 세운다. */

/* ── 아래 요약 카드 ────────────────────────────────────────── */

/*
  글자색 두 단계.
    --climb-card-ink        목표 제목, 퍼센트   제일 진하게
    --climb-card-ink-muted  보조 정보           회녹색

  opacity 대신 색을 직접 준다. 투명도로 흐리게 하면 배경색이 바뀔 때 같이 흔들린다.
  (main.css의 [data-theme] 블록에서 테마별 값을 정의한다.)
*/
.climb-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background: var(--climb-card-surface, #cdedd3);
  /* 위쪽은 일러스트와 맞닿아 이미 둥글어서(.climb-card__illustration) 각지게 두고,
     카드 바깥 아래쪽 두 모서리만 다른 카드처럼 둥글린다. */
  border-radius: 0 0 16px 16px;
  /* 그림자는 .climb-progress-card가 일러스트까지 합쳐 한 번만 준다. */
  box-shadow: none;
  letter-spacing: 0.02em;
  /*
    루트의 145%는 18px 기준으로 계산된 26.1px이 그대로 상속된다. 여기 글자는 11~15px이라
    줄 사이가 과하게 벌어진다. 단위 없는 값으로 덮어써야 각 글자 크기에 맞춰 계산된다.
  */
  line-height: 1.25;
}

/* ── 목표가 없을 때 ──────────────────────────────────────── */

.climb-card__quest-badge {
  flex: none;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--climb-card-cta-bg, #12281c);
  color: var(--climb-card-cta-text, #ffd939);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.climb-card__quest-label {
  flex: 1;
  margin-left: 8px;
  font-weight: 700;
  color: var(--climb-card-ink-muted, #6f8b79);
}

.climb-card__empty {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 목표가 있을 때의 목표 제목과 같은 크기. 이 카드에서 제일 큰 글자다. */
.climb-card__empty-title {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  color: var(--home-ink-text, #12281c);
}

.climb-card__empty-desc {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--climb-card-ink-muted, #6f8b79);
}

/*
  가로를 꽉 채운다. 이 화면에서 할 수 있는 일이 이것 하나뿐이라 작게 둘 이유가 없다.
  색상·radius(pill)·높이는 BaseButton의 quest variant/md 사이즈가 정한다 — 여기서는
  이 카드에서만 필요한 폭·여백만 덮어쓴다.
*/
.climb-card__empty-cta {
  width: 100%;
  margin-top: 4px;
}

/* ── 목표가 있을 때 ──────────────────────────────────────── */

/* NEW QUEST 배지 줄(목표 없을 때)에서만 쓰인다. 목표가 있을 때는 title/subtitle로 대체했다. */
.climb-card__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 900;
  color: var(--climb-card-ink, #12281c);
}

/* "서초구 원룸 전세까지 27% 왔어요" — 이 카드에서 가장 먼저 읽혀야 하는 한 줄. */
.climb-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: var(--climb-card-ink, #12281c);
}

/*
  "2,000만원 모음"(왼쪽) · "8,000만원 남음"(오른쪽) — progress bar 시작점/끝점과 맞춰
  좌우로 나눠 배치한다(모은 금액 = 시작 쪽, 남은 금액 = 끝 쪽이라는 의미가 bar와 이어지도록).
*/
.climb-card__amounts {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.climb-card__amount-item {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

/* 금액이 먼저 읽혀야 해서 "모음"/"남음"보다 진하게 둔다. title(14px/900)보다는 작게. */
.climb-card__amount-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--climb-card-ink, #12281c);
}

.climb-card__amount-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--climb-card-ink-muted, #6f8b79);
}

.climb-card__segments {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* 칸 자체는 미달성 색의 트랙이고, 그 안을 실제 달성 비율(%)만큼 fill이 채운다.
   반올림해서 칸 단위로 채우지 않기 위해 opacity가 아니라 width로 정확한 비율을 표현한다. */
.climb-card__segment {
  position: relative;
  flex: 1;
  height: 11px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--climb-card-progress-inactive, #a9c6af);
}

.climb-card__segment-fill {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: var(--color-progress-active, #1d6b3f);
}
</style>
