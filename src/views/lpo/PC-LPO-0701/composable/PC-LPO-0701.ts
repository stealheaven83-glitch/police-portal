import { computed, ref, type InjectionKey } from 'vue'
import type { EquipmentCategory, EquipmentListRow } from './types'
import { useMobileDetail, createMobileMockRows } from './mobile'
import { useVehicle112 } from './vehicle112'
import { useCommDetail, createCommMockRows } from './comm'
import { useWeaponDetail, createWeaponMockRows } from './weapon'
import { useAmmoDetail, createAmmoMockRows } from './ammo'
import { useCuffsDetail, createCuffsMockRows } from './cuffs'
import { useEtcDetail, createEtcMockRows } from './etc'
import { useMaintenanceHistory } from './maintenance'

// 이 파일을 import 하던 기존 코드(페이지/팝업 컴포넌트)가 경로를 안 바꿔도 되도록,
// 카테고리별로 쪼갠 파일들의 타입/옵션/컴포저블을 전부 여기서 다시 내보낸다(배럴).
export * from './types'
export * from './mobile'
export * from './vehicle112'
export * from './comm'
export * from './weapon'
export * from './ammo'
export * from './cuffs'
export * from './etc'
export * from './maintenance'

function createMockList(): EquipmentListRow[] {
  return [
    ...createMobileMockRows(),
    ...createCommMockRows(),
    ...createWeaponMockRows(),
    ...createAmmoMockRows(),
    ...createCuffsMockRows(),
    ...createEtcMockRows(),
  ]
}

function createEquipmentListStore() {
  const activeCategory = ref<EquipmentCategory>('mobile')
  const showAdvancedSearch = ref(true)

  const allRows = ref<EquipmentListRow[]>(createMockList())
  const rowsByCategory = computed(() => allRows.value.filter((r) => r.category === activeCategory.value))

  const mobile = useMobileDetail(allRows)
  const vehicle112 = useVehicle112(mobile.detail)
  const comm = useCommDetail(allRows)
  const weapon = useWeaponDetail(allRows)
  const ammo = useAmmoDetail(allRows)
  const cuffs = useCuffsDetail(allRows)
  const etc = useEtcDetail(allRows)
  const maintenance = useMaintenanceHistory(allRows)

  return {
    activeCategory,
    showAdvancedSearch,
    rowsByCategory,
    ...mobile,
    ...vehicle112,
    ...comm,
    ...weapon,
    ...ammo,
    ...cuffs,
    ...etc,
    ...maintenance,
  }
}

let singleton: ReturnType<typeof createEquipmentListStore> | null = null

/**
 * 장비관리(PC-LPO-0701~0714) 전체 상태 — 카테고리별 로직은 같은 폴더의 mobile.ts / comm.ts /
 * weapon.ts / ammo.ts / cuffs.ts / etc.ts / vehicle112.ts / maintenance.ts 로 나눠뒀고,
 * 이 함수는 그것들을 allRows(목록 전체) 하나로 묶어주는 조립 지점이다.
 *
 * PC-LPO-0701.vue 에서 provide 하고, 하위 팝업 컴포넌트(components/)들은 EquipmentListKey 로
 * inject 해서 같은 인스턴스를 공유한다.
 *
 * 모듈 스코프 싱글턴으로 두는 이유: 이 페이지는 0701~0714 를 화면ID별 라우트로 나눠 등록해
 * useAutoTrigger 로 URL↔상태를 동기화하는데, 최상위 Layout.vue 가
 * `<component :is="Component" :key="route.fullPath" />` 로 라우트마다 컴포넌트를 새로
 * 마운트한다(멀티탭 UX를 위한 의도적 설계). 그래서 useAutoTrigger 가 내부적으로
 * router.replace 를 부를 때마다(예: 팝업을 닫아 화면ID가 0705→0704 로 바뀔 때)
 * PC-LPO-0701.vue 가 통째로 리마운트되어 setup() 이 다시 실행된다 — 이 함수를 호출할
 * 때마다 새 상태를 만들면 방금 입력/저장한 내용이 리마운트로 날아간다. 그래서 최초 호출
 * 때 만든 store 를 모듈 스코프에 붙잡아두고, 이후 호출은 전부 같은 인스턴스를 반환한다.
 */
export function useEquipmentList() {
  if (!singleton) {
    singleton = createEquipmentListStore()
  }
  return singleton
}

export type EquipmentListStore = ReturnType<typeof useEquipmentList>
export const EquipmentListKey: InjectionKey<EquipmentListStore> = Symbol('PC-LPO-0701-equipment-list')
