/** 사이드메뉴(LNB) 한 항목. 1뎁스는 children 을 갖고, 2뎁스는 path 또는 href 를 갖는다. */
export interface SideMenuItem {
  /** 화면에 표시되는 메뉴명. 활성 표시(activeChild)의 키이기도 하다 */
  name: string
  /** 클릭 시 이동할 내부 라우트 경로 */
  path?: string
  /** 외부 시스템 링크. 지정하면 새 창으로 열고 path 보다 우선한다 */
  href?: string
  children?: SideMenuItem[]
}

/** 화면 하나가 요구하는 사이드메뉴 구성 */
export interface SideMenuConfig {
  /** 사이드메뉴 최상단 타이틀 (기본값 '지역경찰') */
  title?: string
  /** 기본으로 펼쳐둘 1뎁스 항목 인덱스 */
  openIndex?: number
  /** 기본 활성 표시할 2뎁스 메뉴명 */
  activeChild?: string
  items: SideMenuItem[]
}

/** 미리 등록해둔 메뉴 구성의 키 */
export type SideMenuPresetKey =
  | 'localPolice'
  | 'publicSafety'
  | 'systemAdmin'
  | 'menuTabSample'
