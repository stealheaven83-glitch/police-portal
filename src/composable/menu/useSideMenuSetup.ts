import { getCurrentInstance, onActivated, onUnmounted } from 'vue'
import { useSideMenuStore } from '@/stores/menu/useSideMenu'
import { loadSideMenuPreset } from './sidemenu/presets'
import type { SideMenuConfig } from './sidemenu/types'

/**
 * 화면(View)의 setup 에서 호출해 그 화면의 사이드메뉴를 등록한다.
 *
 *   useSideMenuSetup('publicSafety')    // 미리 등록된 키
 *   useSideMenuSetup({ title, items })  // 인라인 구성
 *   useSideMenuSetup(false)             // 사이드메뉴가 없는 화면
 *
 * KeepAlive 로 캐시된 화면은 다시 열려도 onMounted 가 돌지 않으므로 setup 시점과
 * onActivated 두 곳에서 같은 처리를 건다. 프리셋 로딩이 비동기라 화면을 빠르게 옮기면
 * 늦게 끝난 이전 화면이 다음 화면 메뉴를 덮어쓸 수 있어서, 스토어의 소유권으로 막는다.
 */
export function useSideMenuSetup(config: string | SideMenuConfig | false) {
  const sideMenuStore = useSideMenuStore()
  // 화면 인스턴스마다 고유한 토큰. 같은 화면이 탭으로 여러 번 열려도 서로 구분된다.
  const ownerId = Symbol(getCurrentInstance()?.type.name ?? 'side-menu-owner')

  async function apply() {
    sideMenuStore.claim(ownerId)

    if (config === false) {
      sideMenuStore.setVisible(false)
      return
    }

    if (typeof config !== 'string') {
      sideMenuStore.apply(config)
      return
    }

    sideMenuStore.setLoading(true)
    try {
      const preset = await loadSideMenuPreset(config)
      // 로딩 중에 다른 화면이 메뉴를 가져갔으면 반영하지 않는다
      if (!sideMenuStore.isOwner(ownerId)) return
      if (!preset) {
        console.warn(`[useSideMenuSetup] 등록되지 않은 사이드메뉴 키입니다: ${config}`)
        return
      }
      sideMenuStore.apply(preset)
    } finally {
      if (sideMenuStore.isOwner(ownerId)) sideMenuStore.setLoading(false)
    }
  }

  apply()
  onActivated(apply)
  onUnmounted(() => sideMenuStore.release(ownerId))
}

export default useSideMenuSetup
