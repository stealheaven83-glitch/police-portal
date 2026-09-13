import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * WorkLayout(업무화면 골격) 상태.
 *
 * 기본은 work-body 자체는 스크롤하지 않고, 필요한 화면이 내부에 ScrollWrapper 등으로
 * 일부 영역만 스크롤시키는 방식이다. 본문 전체가 하나의 흐름이라 work-body 째로
 * 스크롤돼야 하는 화면은 useWorkLayoutSetup 으로 scrollable:true 를 걸어 이 값을 켠다.
 */
export const useWorkLayoutStore = defineStore('useWorkLayout', () => {
  const scrollable = ref(false)

  function setScrollable(next: boolean) {
    scrollable.value = next
  }

  return {
    scrollable,
    setScrollable,
  }
})

export default useWorkLayoutStore
