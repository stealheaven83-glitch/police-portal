import { onActivated, onDeactivated, onUnmounted } from 'vue'
import { useWorkLayoutStore } from '@/stores/layout/useWorkLayout'

/**
 * 화면(View)의 setup 에서 호출해 WorkLayout 의 work-body 스크롤 여부를 지정한다.
 *
 *   useWorkLayoutSetup({ scrollable: true })   // work-body 째로 스크롤돼야 하는 화면
 *   useWorkLayoutSetup()                       // 기본값(스크롤 없음) — 안 불러도 동일
 *
 * KeepAlive 로 캐시된 화면은 다른 탭으로 옮겨가도 unmounted 되지 않으므로, onDeactivated 에서
 * 기본값으로 되돌려야 그 다음에 보이는 화면(아직 이 composable 을 안 부르는 화면)이 이전 화면의
 * 설정을 이어받지 않는다.
 */
export function useWorkLayoutSetup(config: { scrollable?: boolean } = {}) {
  const workLayoutStore = useWorkLayoutStore()

  function apply() {
    workLayoutStore.setScrollable(!!config.scrollable)
  }

  function reset() {
    workLayoutStore.setScrollable(false)
  }

  apply()
  onActivated(apply)
  onDeactivated(reset)
  onUnmounted(reset)
}

export default useWorkLayoutSetup
