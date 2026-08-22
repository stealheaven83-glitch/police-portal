import type { ButtonVariants } from "@/components/custom/button"
import type { BadgeVariants } from "@/components/custom/badge"

export { default as TabulatorGrid } from "./TabulatorGrid.vue"

/** 그리드 레이아웃 모드 (Tabulator layout 옵션) */
export type TabulatorGridLayout = "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch"

/** 셀에 넣을 수 있는 커스텀 셀 종류 */
export type TabulatorCellType = "date" | "input" | "button" | "select" | "switch" | "checkbox" | "badge"

export interface SelectCellOption {
  label: string
  value: string | number
  disabled?: boolean
}

/**
 * 컬럼 정의.
 * Tabulator 의 컬럼 옵션을 그대로 쓰되, 자주 쓰는 셀 형태는 `cellType` 으로 지정하면
 * TabulatorGrid 가 알아서 formatter 를 붙여준다(직접 formatter 를 넘기면 그쪽이 우선).
 *
 * 모두 custom/ 폴더의 공용 컴포넌트를 셀에 실제 마운트하는 방식이라,
 * 공용 컴포넌트의 스펙이 바뀌면 그리드 셀에도 그대로 반영된다.
 *
 * - `date`     : custom/datepicker  — 셀에 항상 달력이 보이는 날짜 입력
 * - `input`    : 셀에 항상 텍스트 input 이 보이는 입력 (편집모드 진입 불필요)
 * - `button`   : custom/button      — 셀 안의 액션 버튼
 * - `select`   : custom/select      — 셀에 항상 셀렉트가 보이는 선택 입력
 * - `switch`   : custom/switch      — boolean 값 토글
 * - `checkbox` : custom/checkbox    — boolean 값 체크박스
 * - `badge`    : custom/badge       — 읽기 전용 상태 뱃지
 */
export interface TabulatorGridColumn {
  title?: string
  field?: string
  cellType?: TabulatorCellType

  /* cellType: 'button' */
  /** 버튼에 표시할 텍스트 */
  buttonLabel?: string
  /** 버튼 variant (기본 tertiary) */
  buttonVariant?: ButtonVariants["variant"]
  /** 버튼 size (기본 sm) */
  buttonSize?: ButtonVariants["size"]
  /** 행 데이터를 받아 버튼 비활성 여부를 반환 */
  buttonDisabled?: (rowData: any) => boolean
  /** 버튼 클릭 핸들러 */
  onButtonClick?: (rowData: any, cell: any) => void

  /* cellType: 'select' */
  /** 셀렉트 옵션 목록 */
  selectOptions?: SelectCellOption[]

  /* cellType: 'badge' */
  /** 셀 값 -> Badge 색상 매핑. 지정 안 된 값은 badgeFallbackColor 로 표시 */
  badgeColorMap?: Record<string, BadgeVariants["color"]>
  /** badgeColorMap 에 없는 값에 쓸 색상 (기본 grayLighter) */
  badgeFallbackColor?: BadgeVariants["color"]

  /** 그 외 Tabulator 컬럼 옵션(width, editor, validator, hozAlign, frozen ...)은 그대로 전달됨 */
  [key: string]: any
}

export interface PageSizeOption {
  label: string
  value: string
}
