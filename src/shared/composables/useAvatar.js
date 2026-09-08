import { computed, reactive } from 'vue'

import climberBlue from '@/assets/images/climber.png'
import climberGreen from '@/assets/images/climber1.png'
import climberStraw from '@/assets/images/climber3.png'
import climberPink from '@/assets/images/climber4.png'

const STORAGE_KEY = 'avatar'

export const AVATAR_OPTIONS = [
  {
    id: 'climber',
    label: '파란 후드',
    src: climberBlue,
    crop: { width: '123.4%', left: '-12.4%', top: '4.5%' },
  },
  {
    id: 'climber1',
    label: '초록 재킷',
    src: climberGreen,
    crop: { width: '123%', left: '-13.5%', top: '5%' },
  },
  {
    id: 'climber3',
    label: '밀짚모자',
    src: climberStraw,
    crop: { width: '110%', left: '-6%', top: '9.5%' },
  },
  {
    id: 'climber4',
    label: '분홍 후드',
    src: climberPink,
    crop: { width: '108%', left: '-8%', top: '11.5%' },
  },
]

const DEFAULT_AVATAR_ID = AVATAR_OPTIONS[0].id

function isKnownId(id) {
  return AVATAR_OPTIONS.some((option) => option.id === id)
}

function readStoredAvatarId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isKnownId(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStoredAvatarId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // 저장에 실패해도 이번 세션 동안은 화면에 반영된다
  }
}

const state = reactive({
  avatarId: readStoredAvatarId() ?? DEFAULT_AVATAR_ID,
})

export function useAvatar() {
  const avatarId = computed(() => state.avatarId)

  const currentOption = computed(
    () => AVATAR_OPTIONS.find((option) => option.id === state.avatarId) ?? AVATAR_OPTIONS[0],
  )

  const avatarSrc = computed(() => currentOption.value.src)
  const avatarCrop = computed(() => currentOption.value.crop)

  function setAvatar(id) {
    if (!isKnownId(id)) return
    state.avatarId = id
    writeStoredAvatarId(id)
  }

  return { avatarId, avatarSrc, avatarCrop, setAvatar }
}
