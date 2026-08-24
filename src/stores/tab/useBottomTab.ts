import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { BottomTabItem } from '@/components/custom/bottom-tab/types'

/**
 * 하단 동적 탭 상태.
 *
 * 탭 목록이 곧 KeepAlive 캐시 목록이다(cachedTabNames). 탭을 닫으면 이름이 빠지고
 * Vue 가 해당 화면 인스턴스를 메모리에서 해제한다. 그래서 탭 추가/삭제는 여기 한 곳에서만
 * 일어나야 하고, 라우팅은 이 스토어가 아니라 호출부(BottomTab.vue)가 담당한다.
 */
export const useBottomTabStore = defineStore('useBottomTab', () => {
  /** 탭 바 노출 여부. useBottomTabSetup(false) 인 화면에서는 숨긴다 */
  const visible = ref(true)
  const tabs = ref<BottomTabItem[]>([])
  /** 현재 활성 탭의 value */
  const activeTab = ref('')
  /** 동시에 열어둘 수 있는 탭 수 (KeepAlive 캐시 상한과 같다) */
  const maxTabs = ref(10)

  /** KeepAlive :include 로 넘길 컴포넌트 이름 목록 */
  const cachedTabNames = computed<string[]>(() => {
    return tabs.value
      .map(tab => tab.componentName || tab.value)
      .filter((name): name is string => Boolean(name))
  })

  const activeTabItem = computed(() => tabs.value.find(tab => tab.value === activeTab.value))

  function setVisible(next: boolean) {
    visible.value = next
  }

  function findIndex(value: string) {
    return tabs.value.findIndex(tab => tab.value === value)
  }

  /**
   * 탭을 추가하고 활성화한다. 이미 열려 있으면 최신 정보로 갱신만 하고 활성화한다.
   * 상한을 넘으면 가장 오래 전에 연 '닫을 수 있는' 탭을 밀어낸다.
   */
  function openTab(item: BottomTabItem) {
    const index = findIndex(item.value)

    if (index === -1) {
      if (tabs.value.length >= maxTabs.value) {
        const evictIndex = tabs.value.findIndex(tab => tab.closable !== false)
        if (evictIndex === -1) {
          toast.warning(`탭은 최대 ${maxTabs.value}개까지 열 수 있습니다.`)
          return
        }
        tabs.value.splice(evictIndex, 1)
      }
      tabs.value.push({ closable: true, ...item })
    } else {
      tabs.value[index] = { ...tabs.value[index], ...item }
    }

    activeTab.value = item.value
  }

  function setActiveTab(value: string) {
    if (findIndex(value) !== -1) activeTab.value = value
  }

  /**
   * 탭을 닫는다.
   * 활성 탭을 닫은 경우 이동해야 할 다음 탭을 돌려주므로, 호출부가 router.push 를 이어서 한다.
   * (닫은 탭이 활성 탭이 아니었거나 남은 탭이 없으면 undefined)
   */
  function closeTab(value: string): BottomTabItem | undefined {
    const index = findIndex(value)
    if (index === -1) return undefined
    if (tabs.value[index].closable === false) return undefined

    const wasActive = activeTab.value === value
    tabs.value.splice(index, 1)

    if (!wasActive) return undefined

    // 닫은 자리를 이어받을 탭: 오른쪽 우선, 없으면 왼쪽
    const next = tabs.value[index] ?? tabs.value[index - 1]
    activeTab.value = next?.value ?? ''
    return next
  }

  /** 지정한 탭만 남기고 모두 닫는다 */
  function closeOthers(value: string) {
    tabs.value = tabs.value.filter(tab => tab.value === value || tab.closable === false)
    setActiveTab(value)
  }

  /** 닫을 수 있는 탭을 모두 닫는다 */
  function closeAll() {
    tabs.value = tabs.value.filter(tab => tab.closable === false)
    activeTab.value = tabs.value[0]?.value ?? ''
  }

  return {
    visible,
    tabs,
    activeTab,
    activeTabItem,
    maxTabs,
    cachedTabNames,
    setVisible,
    openTab,
    setActiveTab,
    closeTab,
    closeOthers,
    closeAll,
  }
})

export default useBottomTabStore
