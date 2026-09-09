import type { ButtonVariants } from "@/components/custom/button";
import type { BadgeVariants } from "@/components/custom/badge";

export { default as TabulatorGrid } from "./TabulatorGrid.vue";

/** 그리드 레이아웃 모드 (Tabulator layout 옵션) */
export type TabulatorGridLayout =
  | "fitColumns"
  | "fitData"
  | "fitDataFill"
  | "fitDataStretch";
export type TabulatorGridResponsiveLayout = "hide" | "collapse" | undefined;

/** 셀에 넣을 수 있는 커스텀 셀 종류 */
export type TabulatorCellType =
  | "date"
  | "input"
  | "button"
  | "select"
  | "switch"
  | "checkbox"
  | "badge";

export interface SelectCellOption {
  label: string;
  value: string | number;
  disabled?: boolean;
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
  title?: string;
  field?: string;
  cellType?: TabulatorCellType;

  /* cellType: 'button' */
  /**
   * 버튼에 표시할 텍스트.
   * 셀 값이나 다른 컬럼 값을 버튼 텍스트로 쓰려면 행 데이터를 받는 함수를 넘긴다.
   * 예) buttonLabel: (row) => row.managementName
   */
  buttonLabel?: string | ((rowData: any, cell: any) => string);
  /** 버튼 variant (기본 tertiary) */
  buttonVariant?: ButtonVariants["variant"];
  /** 버튼 size (기본 sm) */
  buttonSize?: ButtonVariants["size"];
  /** 버튼에 추가로 붙일 클래스 (크기 미세조정 등) */
  buttonClass?: string;
  /** 행 데이터를 받아 버튼 비활성 여부를 반환 */
  buttonDisabled?: (rowData: any) => boolean;
  /**
   * 행 데이터를 받아 이 행에서 버튼을 실제 버튼 모양으로 보여줄지 결정한다(기본 true).
   * false 를 반환하면 버튼 테두리/배경 없이 buttonLabel 텍스트만 표시한다(클릭은 그대로 동작) —
   * 예: 값이 비어 있을 때만 "선택" 버튼으로 보이고, 값이 채워지면 그 값 자체가 텍스트로만
   * 보이면서 눌러서 바꿀 수 있는 패턴.
   */
  buttonVisible?: (rowData: any) => boolean;
  /** 버튼 클릭 핸들러 */
  onButtonClick?: (rowData: any, cell: any) => void;

  /* cellType: 'input' */
  /**
   * 값이 비어 있을 때 입력 셀에 깔리는 안내 문구.
   * (컬럼 옵션 이름을 placeholder 로 두면 Tabulator 의 표 전체 placeholder 와 헷갈려 cellPlaceholder 로 둔다)
   */
  cellPlaceholder?: string;
  /**
   * 값이 있을 때 입력 오른쪽에 지우기(X) 버튼을 보여준다.
   * 켜면 그 셀만 custom/input 의 InputField2 로 그린다(X 버튼이 그쪽에만 있다).
   */
  cellClearable?: boolean;
  /**
   * 입력 오른쪽에 붙일 아이콘 버튼의 이미지 경로(돋보기 등). 조회 팝업을 여는 자리에 쓴다.
   * 켜면 그 셀만 custom/input 의 InputField2 로 그린다.
   */
  cellIcon?: string;
  /** cellIcon 버튼의 접근성 이름 (기본 '조회') */
  cellIconLabel?: string;
  /** cellIcon 버튼을 눌렀을 때 */
  onCellIconClick?: (rowData: any, cell: any) => void;
  /**
   * 입력 셀의 최대 입력 글자수.
   * 지정 시 InputField2/Input 에 maxlength 가 적용되고 초과 입력이 방지됩니다.
   */
  cellMaxlength?: number | string;
  /** cellMaxlength 의 별칭 (maxlength 로 지정해도 동일하게 동작) */
  maxlength?: number | string;
  /** 글자수 카운터 표시 여부 (InputField2 에서 표시) */
  cellShowCount?: boolean;

  /* cellType: 'select' */
  /** 셀렉트 옵션 목록 */
  selectOptions?: SelectCellOption[];
  /** 값이 비어 있을 때 셀렉트에 표시할 안내 문구 (예: '선택') */
  selectPlaceholder?: string;

  /* cellType: 'badge' */
  /** 셀 값 -> Badge 색상 매핑. 지정 안 된 값은 badgeFallbackColor 로 표시 */
  badgeColorMap?: Record<string, BadgeVariants["color"]>;
  /** badgeColorMap 에 없는 값에 쓸 색상 (기본 grayLighter) */
  badgeFallbackColor?: BadgeVariants["color"];

  /* ── 좁은 폭 카드 목록(cardOnMobile)에서의 표시 방법 ─────────────────
   * 아무것도 안 주면 columns 순서 그대로, 첫 컬럼이 카드 제목, 나머지는 "라벨 값" 줄이 된다. */
  /** 카드에서는 이 컬럼을 빼고 싶을 때(표에는 그대로 나온다) */
  cardHidden?: boolean;
  /** 카드에서의 표시 순서. 작을수록 위. 안 주면 columns 순서를 따른다 */
  cardOrder?: number;
  /** 카드에서 라벨(컬럼명)은 숨기고 값만 보이고 싶을 때 */
  cardHideTitle?: boolean;
  /** 이 컬럼을 카드 제목으로 쓴다(안 주면 카드에 나오는 첫 컬럼이 제목) */
  cardHeading?: boolean;

  /**
   * 헤더 그룹(컬럼 중첩).
   *
   * Tabulator 6.x 는 데이터 셀의 rowspan/colspan(셀 병합)을 지원하지 않는다.
   * 상단 헤더를 묶는 것은 이 `columns` 중첩으로 처리하며, 자식 컬럼에서도
   * `cellType` 을 포함한 위 옵션을 그대로 쓸 수 있다.
   */
  columns?: TabulatorGridColumn[];

  /** 그 외 Tabulator 컬럼 옵션(width, editor, validator, hozAlign, frozen ...)은 그대로 전달됨 */
  [key: string]: any;
}

export interface PageSizeOption {
  label: string;
  value: string;
}

/** 유효성 검사 실패 정보 */
export interface TabulatorValidationError {
  row: any;
  field: string;
  value?: any;
  message: string;
  cell?: any;
}
