import { computed, ref } from 'vue'
// 메인 카드 3D 일러스트 (Figma Main_3D icon 을 노드 내보내기로 받은 것)
import patrolCarImg from '@/assets/images/main-card/img_patrolCar.png'
import officerImg from '@/assets/images/main-card/img_officer.png'
import chatImg from '@/assets/images/main-card/img_chat.png'
import cuffsImg from '@/assets/images/main-card/img_cuffs.png'
import stationImg from '@/assets/images/main-card/img_station.png'
import gateImg from '@/assets/images/main-card/img_gate.png'
import mascotAImg from '@/assets/images/main-card/img_mascotA.png'
import mascotBImg from '@/assets/images/main-card/img_mascotB.png'
import radioImg from '@/assets/images/main-card/img_radio.png'
import flashlightImg from '@/assets/images/main-card/img_flashlight.png'
import pistolImg from '@/assets/images/main-card/img_pistol.png'
import taserImg from '@/assets/images/main-card/img_taser.png'
import vestImg from '@/assets/images/main-card/img_vest.png'
import whistleImg from '@/assets/images/main-card/img_whistle.png'
import megaphoneImg from '@/assets/images/main-card/img_megaphone.png'
import familyImg from '@/assets/images/main-card/img_family.png'
import gearImg from '@/assets/images/main-card/img_gear.png'
import folderImg from '@/assets/images/main-card/img_folder.png'
import checklistImg from '@/assets/images/main-card/img_checklist.png'

/** 메인화면에 올릴 수 있는 메뉴 한 개 */
export interface MainMenuItem {
  key: string
  /** 아래 메뉴 목록의 체크박스에 쓰는 이름 */
  label: string
  /**
   * 미리보기 카드에 찍히는 이름. 메뉴 이름과 다를 때만 준다
   * (시안 13312:146403 — 메뉴는 '출동수당' 인데 카드는 '출동수당 조회').
   */
  cardLabel?: string
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
      { key: 'allowance', label: '출동수당', cardLabel: '출동수당 조회' },
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
  /** 3D 일러스트 경로 (Figma 이미지선택 팝업 13393:29314 의 19개) */
  src: string
}

export const mainImages: MainImage[] = [
  { id: 'patrolCar', name: '순찰차', src: patrolCarImg },
  { id: 'officer', name: '경찰관', src: officerImg },
  { id: 'chat', name: '말풍선', src: chatImg },
  { id: 'cuffs', name: '수갑', src: cuffsImg },
  { id: 'station', name: '경찰서', src: stationImg },
  { id: 'gate', name: '지구대', src: gateImg },
  { id: 'mascotA', name: '포돌이', src: mascotAImg },
  { id: 'mascotB', name: '포순이', src: mascotBImg },
  { id: 'radio', name: '무전기', src: radioImg },
  { id: 'flashlight', name: '손전등', src: flashlightImg },
  { id: 'pistol', name: '권총', src: pistolImg },
  { id: 'taser', name: '테이저건', src: taserImg },
  { id: 'vest', name: '방검복', src: vestImg },
  { id: 'whistle', name: '호루라기', src: whistleImg },
  { id: 'megaphone', name: '확성기', src: megaphoneImg },
  { id: 'family', name: '가족', src: familyImg },
  { id: 'gear', name: '설정', src: gearImg },
  { id: 'folder', name: '자료', src: folderImg },
  { id: 'checklist', name: '점검표', src: checklistImg },
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

  /** 아직 아무 카드도 안 쓴 이미지 — 새로 체크한 메뉴의 기본 이미지로 준다 */
  function firstFreeImageId(taken: MainSelection[]) {
    const used = new Set(taken.map((s) => s.imageId))
    return (mainImages.find((img) => !used.has(img.id)) ?? mainImages[0]).id
  }

  /**
   * 기획서 5-1 — 최대 4개. 4개가 찬 상태에서 새로 체크하면 막지 않고
   * **가장 먼저 체크한 메뉴를 해제하고 그 번호를 새 메뉴가 물려받는다**(5-2 마지막 줄).
   * selections 는 체크한 순서대로 쌓이므로 맨 앞이 '가장 먼저 체크한' 것이다.
   */
  function toggleMenu(menuKey: string, checked: boolean) {
    if (!checked) {
      selections.value = selections.value.filter((s) => s.menuKey !== menuKey)
      return
    }
    if (selectionOf(menuKey)) return

    if (selections.value.length >= SLOT_COUNT) {
      const [oldest, ...rest] = selections.value
      selections.value = [...rest, { menuKey, slot: oldest.slot, imageId: firstFreeImageId(rest) }]
      return
    }

    const free = [1, 2, 3, 4].find((n) => !slotTakenBy(n))
    if (!free) return
    selections.value = [
      ...selections.value,
      { menuKey, slot: free, imageId: firstFreeImageId(selections.value) },
    ]
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

  /**
   * 한 이미지를 두 카드가 같이 쓸 수 없으므로(기획서 3), 이미 다른 카드가 쓰는 이미지를 고르면
   * 그 카드와 이미지를 맞바꾼다 — 번호 셀렉트(setSlot)가 자리를 맞바꾸는 것과 같은 방식이다.
   */
  function setImage(menuKey: string, imageId: string) {
    const mine = selectionOf(menuKey)
    if (!mine || mine.imageId === imageId) return
    const other = selections.value.find((s) => s.menuKey !== menuKey && s.imageId === imageId)
    selections.value = selections.value.map((s) => {
      if (s.menuKey === menuKey) return { ...s, imageId }
      if (other && s.menuKey === other.menuKey) return { ...s, imageId: mine.imageId }
      return s
    })
  }

  /** 미리보기 카드 4칸 — 비어 있는 번호는 null */
  const previewSlots = computed(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => {
      const sel = selections.value.find((s) => s.slot === i + 1)
      if (!sel) return null
      const image = mainImages.find((img) => img.id === sel.imageId)
      const menu = allItems.find((m) => m.key === sel.menuKey)
      return {
        slot: i + 1,
        label: menu?.cardLabel ?? menu?.label ?? '',
        imageId: sel.imageId,
        imageSrc: image?.src,
        imageName: image?.name ?? '',
      }
    }),
  )

  /**
   * 지금 쓰이고 있는 이미지 → 그 카드의 번호. 팝업에서 'N번 메뉴' 로 보여주고 고를 수 없게 한다.
   * 시안(13393:29314)은 지금 편집 중인 메뉴의 이미지까지 포함해 4개 모두 'N번 메뉴' 로 표시한다 —
   * 한 이미지를 두 카드가 같이 쓸 수 없기 때문이다(기획서 3).
   */
  function usedImageSlots(): Record<string, number> {
    return Object.fromEntries(selections.value.map((s) => [s.imageId, s.slot]))
  }

  function resetToDefault() {
    darkMode.value = false
    selections.value = DEFAULT_SELECTIONS.map((s) => ({ ...s }))
  }

  return {
    darkMode,
    selections,
    previewSlots,
    selectionOf,
    toggleMenu,
    setSlot,
    setImage,
    usedImageSlots,
    resetToDefault,
  }
}
