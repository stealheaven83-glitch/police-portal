export interface SelectOption {
  label: string
  value: string
}

export type EquipmentCategory = 'mobile' | 'comm' | 'weapon' | 'ammo' | 'cuffs' | 'etc'

/** 장비관리 목록 한 행 — 카테고리마다 안 쓰는 필드가 많아서 카테고리 전용 필드는 전부 optional. */
export interface EquipmentListRow {
  id: number
  category: EquipmentCategory
  typeLabel: string
  managementName: string
  manufacturer: string
  model: string
  plateNumber: string
  location: string
  note: string
  maintenanceCount: number
  inUse: boolean
  updater: string
  updatedAt: string
  /** 무기 전용 — 총번 */
  serialNumber?: string
  /** 무기 전용 — 휴대자 / 수갑 전용 — 사용자 */
  holder?: string
  /** 수갑 전용 — 상태일자 */
  statusDate?: string
  /** 수갑 전용 — 보급일자 */
  deliveryDate?: string
  /** 수갑 전용 — 지급일자 */
  issuedDate?: string
  /** 수갑 전용 — 상태사유 */
  statusReason?: string
  /** 탄약 전용 — 단위 */
  unit?: string
  /** 탄약(결수량)/기타(보유수량) 전용 */
  stock?: number
  /** 탄약 전용 — 청수량 */
  current?: number
}

export const categoryTabs: { value: EquipmentCategory; label: string }[] = [
  { value: 'mobile', label: '기동장비' },
  { value: 'comm', label: '통신장비' },
  { value: 'weapon', label: '무기' },
  { value: 'ammo', label: '탄약' },
  { value: 'cuffs', label: '수갑' },
  { value: 'etc', label: '기타' },
]

/** 배치장소 — 기동장비/통신장비/무기/수갑/탄약 상세 팝업이 공통으로 쓴다 */
export const locationOptions: SelectOption[] = [
  { label: '지구대/파출소', value: 'substation' },
  { label: '본청', value: 'hq' },
  { label: '치안센터', value: 'center' },
]
