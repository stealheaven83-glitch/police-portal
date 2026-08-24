import type { Component } from 'vue'

/**
 * 하단 동적 탭 한 칸.
 * 화면(View)에서 useBottomTabSetup 으로 넘기는 값이 그대로 이 형태다.
 */
export interface BottomTabItem {
  /** 탭의 고유 식별자 (화면 코드) */
  value: string
  /** 탭에 표시되는 명칭 */
  label: string
  /** 탭 클릭 시 이동할 라우트 경로 */
  path?: string
  /**
   * KeepAlive 캐싱 대상 컴포넌트 name.
   * 생략하면 value 를 대신 쓰지만, 화면의 defineOptions({ name }) 과 반드시 일치해야
   * 캐싱이 걸린다. (menu-tab-guide.md 5.2)
   */
  componentName?: string
  /** 닫기(X) 버튼 노출 여부. 기본값 true */
  closable?: boolean
  /** 비활성화 여부 */
  disabled?: boolean
  /** 탭 라벨 앞에 붙일 아이콘 컴포넌트 */
  icon?: Component
}
