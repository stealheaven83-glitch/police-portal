import { computed, ref } from 'vue'

/** 메인화면에 올릴 수 있는 메뉴 한 개 */
export interface MainMenuItem {
  key: string
  label: string
}

export interface MainMenuGroup {
  /** 상위 업무 구분 (지역경찰 / 생활안전 / 탄력순찰 / 게시판) */
  title: string
  items: MainMenuItem[]
}

/** 메인화면 카드 자리는 4개 — 번호가 곧 위치다 */
export const SLOT_COUNT = 4

export const menuGroups: MainMenuGroup[] = [
  {
    title: '지역경찰',
    items: [
      { key: 'notebook', label: '개인수첩' },
      { key: 'workLog', label: '근무일지' },
      { key: 'handover', label: '인수인계' },
      { key: 'allowance', label: '출동수당' },
      { key: 'district', label: '관내현황' },
      { key: 'equipment', label: '장비관리' },
      { key: 'hr', label: '인사관리' },
    ],
  },
  {
    title: '생활안전',
    items: [
      { key: 'cpted', label: '범죄예방진단' },
      { key: 'youth', label: '여성청소년' },
      { key: 'partner', label: '방범협력단체' },
      { key: 'sunflower', label: '해바라기센터' },
      { key: 'protect', label: '보호조치 대응팀' },
      { key: 'report', label: '보고서' },
    ],
  },
  {
    title: '탄력순찰',
    items: [
      { key: 'request', label: '요청관리' },
      { key: 'safetyMap', label: '범죄 안전 지도' },
      { key: 'patrolStatus', label: '탄력순찰 이행현황' },
      { key: 'patrolResult', label: '탄력순찰 이행실적' },
    ],
  },
  {
    title: '게시판',
    items: [
      { key: 'notice', label: '공지사항' },
      { key: 'qna', label: 'Q&A' },
      { key: 'best', label: '우수사례' },
      { key: 'archive', label: '자료실' },
      { key: 'edu', label: '교육자료 나눔터' },
      { key: 'talk', label: '현장공감 TalkTalk' },
    ],
  },
]

/** 선택된 메뉴 한 건 — 어느 번호 자리에 어떤 이미지로 놓을지 */
export interface MainSelection {
  menuKey: string
  /** 1~4 */
  slot: number
  /** 이미지 선택 팝업에서 고른 이미지 id */
  imageId: string
}

/** 이미지 선택 팝업에 늘어놓는 후보 이미지 */
export interface MainImage {
  id: string
  name: string
}

export const mainImages: MainImage[] = [
  { id: 'patrolCar', name: '순찰차' },
  { id: 'officer', name: '경찰관' },
  { id: 'chat', name: '말풍선' },
  { id: 'cuffs', name: '수갑' },
  { id: 'station', name: '경찰서' },
  { id: 'gate', name: '지구대' },
  { id: 'mascotA', name: '포순이' },
  { id: 'mascotB', name: '포돌이' },
  { id: 'radio', name: '무전기' },
  { id: 'flashlight', name: '손전등' },
  { id: 'pistol', name: '권총' },
  { id: 'taser', name: '테이저건' },
  { id: 'vest', name: '방검복' },
  { id: 'whistle', name: '호루라기' },
  { id: 'siren', name: '경광등' },
  { id: 'family', name: '가족' },
  { id: 'gear', name: '설정' },
  { id: 'folder', name: '자료' },
  { id: 'checklist', name: '점검표' },
]

const DEFAULT_SELECTIONS: MainSelection[] = [
  { menuKey: 'allowance', slot: 1, imageId: 'patrolCar' },
  { menuKey: 'safetyMap', slot: 2, imageId: 'officer' },
  { menuKey: 'qna', slot: 3, imageId: 'chat' },
  { menuKey: 'report', slot: 4, imageId: 'cuffs' },
]

const allItems = menuGroups.flatMap((g) => g.items)

export function useScreenSetting() {
  const darkMode = ref(false)
  const selections = ref<MainSelection[]>(DEFAULT_SELECTIONS.map((s) => ({ ...s })))

  function selectionOf(menuKey: string) {
    return selections.value.find((s) => s.menuKey === menuKey)
  }

  /** 이미 다른 메뉴가 쓰고 있는 번호는 고를 수 없다(한 번호당 한 메뉴) */
  function slotTakenBy(slot: number) {
    return selections.value.find((s) => s.slot === slot)
  }

  /** 4개가 다 찼으면 더 못 고른다 — 체크박스를 비활성으로 만든다 */
  const isFull = computed(() => selections.value.length >= SLOT_COUNT)

  function toggleMenu(menuKey: string, checked: boolean) {
    if (!checked) {
      selections.value = selections.value.filter((s) => s.menuKey !== menuKey)
      return
    }
    if (isFull.value || selectionOf(menuKey)) return
    const free = [1, 2, 3, 4].find((n) => !slotTakenBy(n))
    if (!free) return
    selections.value = [...selections.value, { menuKey, slot: free, imageId: mainImages[0].id }]
  }

  function setSlot(menuKey: string, slot: number) {
    // 그 번호를 쓰고 있던 메뉴와 자리를 맞바꾼다(중복 방지)
    const mine = selectionOf(menuKey)
    if (!mine) return
    const other = slotTakenBy(slot)
    selections.value = selections.value.map((s) => {
      if (s.menuKey === menuKey) return { ...s, slot }
      if (other && s.menuKey === other.menuKey) return { ...s, slot: mine.slot }
      return s
    })
  }

  function setImage(menuKey: string, imageId: string) {
    selections.value = selections.value.map((s) => (s.menuKey === menuKey ? { ...s, imageId } : s))
  }

  /** 미리보기 카드 4칸 — 비어 있는 번호는 null */
  const previewSlots = computed(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => {
      const sel = selections.value.find((s) => s.slot === i + 1)
      if (!sel) return null
      return {
        slot: i + 1,
        label: allItems.find((m) => m.key === sel.menuKey)?.label ?? '',
        imageId: sel.imageId,
      }
    }),
  )

  /** 이미 다른 메뉴가 쓰고 있는 이미지 id — 팝업에서 비활성으로 표시한다 */
  function usedImageIds(exceptMenuKey: string) {
    return selections.value.filter((s) => s.menuKey !== exceptMenuKey).map((s) => s.imageId)
  }

  function resetToDefault() {
    darkMode.value = false
    selections.value = DEFAULT_SELECTIONS.map((s) => ({ ...s }))
  }

  return {
    darkMode,
    selections,
    isFull,
    previewSlots,
    selectionOf,
    toggleMenu,
    setSlot,
    setImage,
    usedImageIds,
    resetToDefault,
  }
}
