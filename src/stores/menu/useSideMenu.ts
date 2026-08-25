import { ref } from 'vue'
import { defineStore } from 'pinia'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import type { SideMenuConfig, SideMenuItem } from '@/composable/menu/sidemenu/types'

/**
 * 사이드메뉴(LNB) 상태.
 *
 * 소유권(ownerId)이 있는 이유: 화면을 빠르게 옮기면 이전 화면의 메뉴 로딩이 늦게 끝나
 * 다음 화면의 메뉴를 덮어쓸 수 있다. useSideMenuSetup 이 claim() 으로 자기 토큰을 걸어두고
 * 로딩이 끝난 뒤 isOwner() 로 아직 자기 차례인지 확인한 다음에만 반영한다.
 *
 * 초기값은 지역경찰 메뉴다. useSideMenuSetup 을 부르지 않은 기존 화면들이
 * 지금까지와 똑같은 LNB 를 유지하도록 하기 위한 것이다.
 */
export const useSideMenuStore = defineStore('useSideMenu', () => {
  const visible = ref(true)
  const title = ref(localPoliceMenu.title ?? '지역경찰')
  const items = ref<SideMenuItem[]>(localPoliceMenu.items)
  const openIndex = ref(localPoliceMenu.openIndex ?? 0)
  const activeChild = ref(localPoliceMenu.activeChild ?? '')
  const loading = ref(false)

  /** 지금 메뉴를 소유한 화면의 토큰 */
  const ownerId = ref<symbol | null>(null)

  function claim(owner: symbol) {
    ownerId.value = owner
  }

  function isOwner(owner: symbol) {
    return ownerId.value === owner
  }

  /** 화면이 사라질 때 자기 소유권만 내려놓는다(이미 다음 화면이 가져갔으면 건드리지 않는다) */
  function release(owner: symbol) {
    if (isOwner(owner)) ownerId.value = null
  }

  function setVisible(next: boolean) {
    visible.value = next
  }

  function setLoading(next: boolean) {
    loading.value = next
  }

  /** 화면이 요구한 구성으로 메뉴를 갈아끼운다 */
  function apply(config: SideMenuConfig) {
    title.value = config.title ?? '지역경찰'
    items.value = config.items
    openIndex.value = config.openIndex ?? 0
    activeChild.value = config.activeChild ?? ''
    visible.value = true
  }

  /** 1뎁스 펼침/접힘 */
  function toggleDepth1(index: number) {
    openIndex.value = openIndex.value === index ? -1 : index
  }

  /**
   * 프리셋의 activeChild 는 프리셋 하나에 고정값 하나뿐이라, 화면이 여러 개(예: 방범협력단체
   * 하위 4개 화면)를 공유하는 프리셋을 쓰면 그 프리셋을 쓰는 다른 화면에 있어도 늘 같은
   * 자식만 활성 표시된다. 그래서 각 화면이 useSideMenuSetup(preset) 직후 이 함수로 자기
   * 화면에 맞는 항목명을 넘긴다. 그 항목이 속한 1뎁스도 함께 펼쳐야 실제로 보이므로,
   * items 에서 역으로 찾아 openIndex 도 같이 맞춘다.
   */
  function setActiveChild(name: string) {
    activeChild.value = name
    const depth1Index = items.value.findIndex((item) => item.children?.some((child) => child.name === name))
    if (depth1Index !== -1) openIndex.value = depth1Index
  }

  return {
    visible,
    title,
    items,
    openIndex,
    activeChild,
    loading,
    ownerId,
    claim,
    isOwner,
    release,
    setVisible,
    setLoading,
    apply,
    toggleDepth1,
    setActiveChild,
  }
})

export default useSideMenuStore
