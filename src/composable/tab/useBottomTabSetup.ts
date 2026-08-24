import { onActivated } from 'vue'
import { useBottomTabStore } from '@/stores/tab/useBottomTab'
import type { BottomTabItem } from '@/components/custom/bottom-tab/types'

/**
 * 화면(View)의 setup 에서 호출해 자기 자신을 하단 탭에 등록하고 활성화한다.
 *
 *   useBottomTabSetup({
 *     value: 'PC-COM-2301',
 *     label: '시스템모니터링 관리',
 *     path: '/views/com/PC-COM-2301',
 *     componentName: 'PcCom2301',   // defineOptions({ name }) 과 일치해야 KeepAlive 가 걸린다
 *   })
 *
 *   useBottomTabSetup(false)        // 탭 바를 쓰지 않는 화면
 *
 * KeepAlive 로 캐시된 화면은 다시 열려도 onMounted 가 돌지 않는다. 그래서 setup 시점과
 * onActivated 두 곳에서 같은 처리를 걸어, 탭을 오가더라도 활성 탭이 화면을 따라오게 한다.
 */
export function useBottomTabSetup(config: BottomTabItem | false) {
  const bottomTabStore = useBottomTabStore()

  function apply() {
    if (config === false) {
      bottomTabStore.setVisible(false)
      return
    }

    bottomTabStore.setVisible(true)
    bottomTabStore.openTab(config)
  }

  apply()
  onActivated(apply)
}

export default useBottomTabSetup
