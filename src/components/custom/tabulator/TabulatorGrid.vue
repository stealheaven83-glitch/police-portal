<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onActivated,
  onBeforeUnmount,
  watch,
  toRaw,
  useAttrs,
  getCurrentInstance,
  defineComponent,
  h,
  render,
  type HTMLAttributes,
  type StyleValue,
  type VNode,
  type Ref,
} from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '@/assets/css/tabulator-theme.css'
import Datepicker from '@/components/custom/datepicker/DatePicker.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import '@/components/custom/datepicker/DatePicker.css'
import { Checkbox } from '@/components/custom/checkbox'
import { Pagination } from '@/components/custom/pagination'
import { Button } from '@/components/custom/button'
import { Switch } from '@/components/custom/switch'
import { BP_MOBILE } from '@/composable/responsive/useResponsive'
import { Badge } from '@/components/custom/badge'
import SelectField from '@/components/custom/select/SelectField.vue'
import Input from '@/components/custom/input/Input.vue'
// cellClearable 셀만 이걸 쓴다 — 지우기(X) 버튼은 InputField2 에만 있다
import InputField2 from '@/components/custom/input/InputField2.vue'
import type {
  PageSizeOption,
  TabulatorGridColumn,
  TabulatorGridLayout,
  TabulatorGridResponsiveLayout,
  TabulatorValidationError,
} from '.'

/**
 * Tabulator 기반 공용 데이터 그리드.
 *
 * ── 설계 원칙 ──────────────────────────────────────────────────────────
 * 이 컴포넌트는 Tabulator 를 "다시 만드는" 래퍼가 아니라 얇은 어댑터다.
 *  - 프롭으로 여는 것   : 우리 디자인시스템 규약(셀 컴포넌트, KRDS 페이지네이션,
 *                        행 높이, 변경 표시, 일괄 선택 등 화면마다 같아야 하는 것)
 *  - 원본으로 넘기는 것 : 그리드 로직(정렬/필터/그룹핑/트리/클립보드 등 화면마다 다른 것)
 *                        → `tableOptions` 로 Tabulator 옵션을 그대로 주거나,
 *                          `@table-built` / `getTable()` 로 인스턴스를 직접 다룬다.
 *
 * ── 내장 처리 ──────────────────────────────────────────────────────────
 * - 일괄 선택 체크박스(custom/checkbox 를 셀·헤더에 실제 마운트, 부분선택 상태 포함)
 * - 날짜/입력/셀렉트/스위치/체크박스/뱃지/버튼 셀 (컬럼의 cellType 으로 지정)
 * - 편집된 셀 dirty 표시, 유효성 실패 표시, 조건부 행 하이라이트
 * - custom/pagination 을 이용한 페이지 이동(Tabulator 내장 로컬 페이징 제어)
 * - 세로 스크롤 발생 시에만 하단 경계선 표시
 * - 셀에 마운트한 Vue 트리의 정리(unmount)
 */

/* 부모가 준 id/data-* 는 래퍼가 아니라 Tabulator 가 생성되는 host 엘리먼트로 내려보낸다.
 * Tabulator 의 그리드 간 연결(movableRowsConnectedTables)은 셀렉터가 "Tabulator 를 만든
 * 바로 그 엘리먼트"에 걸려야 매칭되기 때문(TableRegistry.matchElement).
 * class/style 은 기존처럼 바깥 래퍼에 적용되도록 분리한다. */
defineOptions({ inheritAttrs: false })

interface Props {
  /** 컬럼 정의. cellType 으로 date/input/select/switch/checkbox/badge/button 셀을 쉽게 구성 */
  columns: TabulatorGridColumn[]
  /** 표시할 데이터. 배열을 새로 넘기면 그리드가 갱신.
   *  주의: 내부에서 JSON 직렬화로 복제하므로 JSON-safe 한 값이어야 한다(Date 객체는 문자열이 됨) */
  data: any[]
  /** 그리드 높이 */
  height?: string
  /**
   * 그리드 전체(표 + 페이지네이션)의 최소 높이. CSS 길이 문자열.
   *
   * height="100%" 로 부모를 채우는 화면에서, 좁은 폭이라 위쪽 툴바·탭이 여러 줄로
   * 접히면 남는 높이가 거의 0 이 되어 표가 한 줄만 보이게 찌그러진다.
   * 이 값을 주면 그 아래로는 줄어들지 않고, 넘치는 만큼은 바깥 스크롤이 받는다.
   *
   * 넘기지 않으면 0 이다. flex 아이템으로 쓸 때 min-height 의 CSS 기본값(auto)은
   * 내용보다 작게 줄어들지 못하게 막아 부모 밖으로 넘치게 만들기 때문에, 0 이 안전한 기본이다.
   */
  minHeight?: string
  /** 행 높이(px) */
  rowHeight?: number
  layout?: TabulatorGridLayout
  responsiveLayout?: TabulatorGridResponsiveLayout
  /** true 면 맨 앞에 일괄 선택 체크박스 컬럼을 자동으로 추가 (= selectMode: 'checkbox' 와 같음) */
  selectable?: boolean
  /**
   * 행 선택 방식.
   *  - 'none'     : 선택 없음(기본)
   *  - 'single'   : 행을 클릭하면 그 행 하나만 선택 (체크박스 컬럼 없음)
   *  - 'multi'    : 행을 클릭해 여러 행을 선택 (체크박스 컬럼 없음)
   *  - 'checkbox' : 맨 앞에 체크박스 컬럼을 넣고 다중 선택
   *
   * 조회 팝업(112차량 조회 · 부서 조회 · 관할행정동 검색 등)은 시안상 체크박스 없이
   * 행을 클릭해 고르는 형태라 'single' 을 쓴다.
   */
  selectMode?: 'none' | 'single' | 'multi' | 'checkbox'
  /**
   * 일괄 선택 체크박스 컬럼(맨 앞)의 헤더에 넣을 문구(예: '추가여부').
   * 넘기지 않으면 기존처럼 전체선택 체크박스만 보인다.
   * 넘기면 전체선택 체크박스 대신 그 문구를 일반 컬럼 헤더처럼 표시한다
   * (행별 체크박스는 그대로 동작 — 전체선택만 빠진다). 좁은 컬럼 폭도 글자에 맞게 넓힌다.
   */
  selectColumnTitle?: string
  /** 데이터 0건일 때 표시할 문구 */
  placeholder?: string
  resizableColumns?: boolean
  resizableRows?: boolean
  /**
   * width / minWidth 를 아무것도 주지 않은 컬럼에 깔아줄 최소 폭(px).
   *
   * layout="fitColumns" 는 남는 폭을 컬럼끼리 나눠 갖는데, 폭을 안 준 컬럼은
   * Tabulator 기본 minWidth(40px)까지 찌그러진 뒤에야 가로 스크롤이 생긴다.
   * 좁은 화면에서 글자가 뭉개지는 대신 가로 스크롤이 생기도록 바닥을 올려 둔다.
   * 컬럼에 width 나 minWidth 를 직접 주면 그 값이 그대로 우선한다.
   */
  columnMinWidth?: number
  movableColumns?: boolean
  /** 컬럼 헤더 클릭 정렬 허용 여부 (컬럼별로 headerSort 를 따로 줄 수도 있음) */
  headerSort?: boolean
  /** 편집이 커밋된 셀에 cell-dirty 클래스를 붙일지 여부(표시 여부만 제어, 변경 추적은 항상 동작) */
  markDirty?: boolean
  /** 행에 추가할 클래스를 반환하는 콜백. 조건부 행 하이라이트에 사용 */
  rowClass?: (rowData: any) => string | undefined | null
  /** cellType: 'date' 셀의 표시 형식 (date-fns 포맷) */
  dateFormat?: string
  /** cellType: 'date' 셀의 placeholder */
  datePlaceholder?: string
  /** 하단에 custom/pagination 을 표시할지 여부 */
  showPagination?: boolean
  itemsPerPage?: number
  itemsPerPageOptions?: PageSizeOption[]
  /** 현재 페이지 번호 (외부 제어/서버 사이드 페이징 시 지정, v-model:currentPage 지원) */
  currentPage?: number
  /** 전체 데이터 건수 (외부 제어/서버 사이드 페이징 시 지정) */
  totalElements?: number
  /** 전체 페이지 수 (외부 제어/서버 사이드 페이징 시 지정) */
  totalPages?: number

  /* ── 행 드래그(정렬 / 그리드 간 이동·복사) ───────────────────────────── */
  /** 행 드래그 활성화. 컬럼에 { rowHandle: true, formatter: 'handle' } 핸들 컬럼을 함께 넣어준다 */
  movableRows?: boolean
  /** 행을 끌어다 놓을 대상 그리드의 CSS 셀렉터.
   *  대상 그리드에는 `<TabulatorGrid id="..." >` 처럼 id 를 주면 셀렉터가 host 엘리먼트에 걸린다.
   *  셀렉터는 드래그를 시작하는 시점에 해석되므로 두 그리드의 마운트 순서는 상관없다. */
  connectedTo?: string | string[]
  /** 연결된 그리드에서 행을 받을 때의 처리 방식 (기본 add = 뒤에 추가) */
  receiveMode?: 'add' | 'insert' | 'update' | 'replace'
  /** true(기본) 면 행을 보낸 뒤에도 원본 그리드에 행이 남는다(= 이동이 아니라 복사) */
  keepSource?: boolean

  /** 위 props 로 덮지 못하는 Tabulator 옵션을 직접 넘기고 싶을 때 */
  tableOptions?: Record<string, any>

  /**
   * 좁은 폭(pcSize 미만)에서 표 대신 카드 목록을 그릴 때, 그 <ul> 에 붙일 클래스.
   * 카드 목록은 #card 슬롯을 넘긴 화면에서만 동작한다.
   */
  cardListClass?: string

  /**
   * 카드에만 붙일 클래스를 반환하는 콜백(rowClass 의 카드판).
   * rowClass 는 PC 표의 행에도 걸리므로, 카드에서만 다르게 보여야 하는 것은 이쪽에 준다.
   */
  cardClass?: (rowData: any) => string | undefined | null

  /**
   * 좁은 폭에서 표 대신 카드 목록을 쓸지 여부(기본 true).
   * 카드 모양은 columns 의 title/field 로 자동으로 만들어지므로 화면에서 따로 할 일이 없다.
   * 생김새를 직접 정하고 싶으면 #card 슬롯으로 덮어쓴다.
   * 좁아져도 표 그대로여야 하는 화면만 false 를 준다.
   */
  cardOnMobile?: boolean

  /**
   * 이 폭(px) 이상이면 PC 로 보고 표를, 미만이면 카드 목록을 그린다.
   * 기본값은 페이지 경계와 같다(useResponsive.ts 의 BP_MOBILE) — 페이지는 모바일인데
   * 표만 PC 로 남는 구간이 생기지 않게 한다.
   */
  pcSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: '220px',
  minHeight: '0',
  rowHeight: 48,
  // 시안의 표는 모두 컨테이너 폭을 컬럼 비율로 나눠 갖는다(= fitColumns).
  // 컬럼 이동·폭 조절은 시안 어디에도 없으므로 기본은 꺼둔다.
  layout: 'fitColumns',
  responsiveLayout: undefined,
  selectable: false,
  selectMode: 'none',
  placeholder: '데이터가 없습니다',
  resizableColumns: false,
  resizableRows: false,
  movableColumns: false,
  columnMinWidth: 90,
  headerSort: false,
  markDirty: true,
  rowClass: undefined,
  dateFormat: 'yyyy-MM-dd',
  datePlaceholder: 'YYYY-MM-DD',
  showPagination: false,
  itemsPerPage: 10,
  itemsPerPageOptions: undefined,
  currentPage: undefined,
  totalElements: undefined,
  totalPages: undefined,
  movableRows: false,
  connectedTo: undefined,
  receiveMode: 'add',
  keepSource: true,
  tableOptions: undefined,
  cardListClass: undefined,
  cardClass: undefined,
  cardOnMobile: true,
  pcSize: BP_MOBILE
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'page-change', page: number): void
  (e: 'update:itemsPerPage', size: number): void
  /** 그리드 안에서 데이터가 바뀌었을 때(셀 편집 · 행 추가/삭제 · 다른 그리드에서 받기).
   *  `v-model:data` 로 받으면 부모 배열이 항상 그리드 내용과 같은 상태로 유지된다. */
  (e: 'update:data', rows: any[]): void
  (e: 'cell-edited', cell: any): void
  (e: 'row-selection-changed', rows: any[]): void
  (e: 'row-click', event: Event, row: any): void
  /** 행 더블클릭. 시안의 "검색결과를 더블 클릭 시 하단 표에 추가" 흐름에 쓴다 */
  (e: 'row-dbl-click', event: Event, row: any): void
  (e: 'table-built', table: any): void
  /** 연결된 다른 그리드에서 행을 받았을 때. 부모 상태와 동기화할 때 사용 */
  (e: 'rows-received', fromRow: any, toRow: any, fromTable: any): void
  /** 드래그로 행 순서가 바뀌었을 때 */
  (e: 'row-moved', row: any): void
  /**
   * 좁은 폭에서 카드를 탭했을 때. 넘어오는 건 행 데이터 객체다.
   * (표의 row-click 은 Tabulator RowComponent 라 형태가 달라서 이벤트를 나눴다)
   */
  (e: 'card-click', row: any): void
  /** 단일 셀 유효성 검사 실패 시 발생 */
  (e: 'validation-failed', error: TabulatorValidationError): void
  /** 전체 유효성 검사(validate()) 실행 시 실패 목록 반환 */
  (e: 'validation-errors', errors: { row: any; field: string; message: string }[]): void
}>()

const attrs = useAttrs()
/** class/style 은 기존 동작대로 바깥 래퍼에 */
const rootAttrs = computed(() => ({
  class: attrs.class as HTMLAttributes['class'],
  style: [
    attrs.style as StyleValue,
    { '--grid-min-h': props.minHeight },
  ] as StyleValue,
}))
/** 그 외(id, data-* 등)는 Tabulator 가 생성되는 host 엘리먼트에 */
const hostAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const rowHeightPx = computed(() => `${props.rowHeight}px`)

/* ------------------------------------------------------------------ *
 * 인스턴스 / DOM
 * ------------------------------------------------------------------ */
const hostEl = ref<HTMLElement | null>(null)
let table: any = null
/** Tabulator 의 build 가 끝났는지 — 끝나기 전에 redraw 를 걸면 내부 요소가 없어 오류가 난다 */
let tableBuilt = false

/** 그리드가 원본 배열을 직접 건드리지 않도록 복제해서 넘긴다 */
const clone = (rows: any[]) => JSON.parse(JSON.stringify(rows))

/* ------------------------------------------------------------------ *
 * 셀 안 Vue 트리 마운트
 *
 * createApp() 을 셀마다 만들면 (1) 앱 인스턴스가 셀 수만큼 생기고
 * (2) 부모 앱 컨텍스트(pinia/router/전역 컴포넌트/디렉티브)를 상속받지 못한다.
 * 그래서 render(vnode, container) + appContext 상속 방식을 쓴다.
 * ------------------------------------------------------------------ */
const appContext = getCurrentInstance()?.appContext ?? null

/** 셀 안에 렌더할 Vue 트리를 담는 얇은 래퍼(= 반응형 렌더 이펙트를 갖는 지점) */
const CellHost = defineComponent({
  name: 'TabulatorCellHost',
  inheritAttrs: false,
  props: { draw: { type: Function, required: true } },
  setup: (hostProps) => () => (hostProps.draw as () => VNode)(),
})

/** 마운트한 셀: 행 데이터 객체 -> (컬럼 키 -> 컨테이너 엘리먼트) */
const cellHosts = new Map<any, Map<string, HTMLElement>>()

const CELL_KEY_SELECT = '__select__'

function mountVNode(container: HTMLElement, draw: () => VNode) {
  const vnode = h(CellHost, { draw })
  if (appContext) vnode.appContext = appContext
  render(vnode, container)
}

/**
 * 셀 컨테이너를 만들어 Vue 트리를 붙이고, 같은 (행, 컬럼) 자리에 이미 붙여둔 트리가 있으면 정리한다.
 *
 * Tabulator 는 셀을 다시 그릴 때 td 안의 DOM 만 비우고 Vue 트리는 그대로 둔다
 * (Cell._generateContents). 그리고 cell.setValue() 는 값이 바뀌지 않아도 항상 포맷터를
 * 다시 실행하므로(Cell.setValueActual -> layoutElement), 여기서 이전 트리를 unmount 하지
 * 않으면 셀을 편집할 때마다 컴포넌트 인스턴스가 하나씩 새어나간다.
 */
function mountCell(cell: any, columnKey: string, className: string, draw: () => VNode): HTMLElement {
  const container = document.createElement('div')
  if (className) container.classList.add(className)
  // 행 선택/드래그 등 그리드 기본 동작으로 이벤트가 새는 것을 방지
  container.addEventListener('click', (e) => e.stopPropagation())

  mountVNode(container, draw)

  const rowData = cell.getRow().getData()
  let byColumn = cellHosts.get(rowData)
  if (!byColumn) {
    byColumn = new Map()
    cellHosts.set(rowData, byColumn)
  }
  const prev = byColumn.get(columnKey)
  if (prev && prev !== container) render(null, prev)
  byColumn.set(columnKey, container)

  return container
}

function unmountAllRowCells() {
  cellHosts.forEach((byColumn) => byColumn.forEach((container) => render(null, container)))
  cellHosts.clear()
  rowSelectState.clear()
  cellInvalidRefs.clear()
}

/** 테이블에서 사라진 행에 붙어 있던 트리를 정리.
 *  (rowDeleted 시점에 삭제된 행 객체를 만지지 않으려고 "살아있는 행" 기준으로 훑는다) */
function unmountOrphanRowCells() {
  if (!table) return
  const alive = new Set(table.getRows().map((row: any) => row.getData()))
  cellHosts.forEach((byColumn, rowData) => {
    if (alive.has(rowData)) return
    byColumn.forEach((container) => render(null, container))
    cellHosts.delete(rowData)
    rowSelectState.delete(rowData)
    dirtyFields.delete(rowData)
    invalidFields.delete(rowData)
    cellInvalidRefs.delete(rowData)
  })
}

/* ------------------------------------------------------------------ *
 * 변경(dirty) / 유효성 실패 상태
 *
 * 상태를 DOM 클래스에 담아두면 redraw(true) · setColumns · 컬럼 표시토글처럼
 * 셀이 재생성되는 순간 전부 날아간다. 그래서 JS 쪽 맵이 원본이고,
 * 클래스는 그 상태를 화면에 옮겨 그린 결과일 뿐이다.
 * ------------------------------------------------------------------ */
/** 행 데이터 객체 -> 변경된 필드 집합 */
const dirtyFields = new Map<any, Set<string>>()
/** 행 데이터 객체 -> 유효성 실패 필드 집합 */
const invalidFields = new Map<any, Set<string>>()
/** 행 데이터 객체 -> (필드명 -> 셀 내부 컴포넌트 invalid 반응형 ref) */
const cellInvalidRefs = new Map<any, Map<string, Ref<boolean>>>()

function addField(store: Map<any, Set<string>>, rowData: any, field: string) {
  if (!rowData || !field) return
  const set = store.get(rowData) ?? new Set<string>()
  set.add(field)
  store.set(rowData, set)
}

function removeField(store: Map<any, Set<string>>, rowData: any, field: string) {
  const set = store.get(rowData)
  if (!set) return
  set.delete(field)
  if (!set.size) store.delete(rowData)
}

/** 컬럼의 validator 규칙을 해석하여 값의 유효성을 검사 (실패 시 에러 메시지 반환, 성공 시 null) */
function checkCellValidity(col: TabulatorGridColumn, value: any, cell?: any): string | null {
  const validators = col.validator
  if (!validators) return null

  const list = Array.isArray(validators) ? validators : [validators]
  const colTitle = col.title || col.field || '항목'

  for (const item of list) {
    if (!item) continue

    // 1. 함수형 validator
    if (typeof item === 'function') {
      const valid = item(cell ?? null, value)
      if (!valid) return `${colTitle} 항목의 입력값이 유효하지 않습니다.`
      continue
    }

    // 2. 문자열 또는 객체형 validator
    let type = typeof item === 'string' ? item : item.type
    let params: any = typeof item === 'object' ? item.parameters : undefined

    if (typeof type === 'string' && type.includes(':')) {
      const parts = type.split(':')
      type = parts[0]
      params = parts[1]
    }

    if (type === 'required') {
      const isMissing =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      if (isMissing) {
        return `${colTitle} 항목은 필수 입력입니다.`
      }
    } else if (type === 'maxLength' || type === 'maxlength') {
      const max = Number(params)
      if (!isNaN(max) && value != null && String(value).length > max) {
        return `${colTitle} 항목은 최대 ${max}자까지 입력할 수 있습니다.`
      }
    } else if (type === 'minLength' || type === 'minlength') {
      const min = Number(params)
      if (!isNaN(min) && value != null && String(value).length < min) {
        return `${colTitle} 항목은 최소 ${min}자 이상 입력해야 합니다.`
      }
    } else if (type === 'min') {
      const min = Number(params)
      if (!isNaN(min) && value != null && value !== '' && Number(value) < min) {
        return `${colTitle} 항목의 값은 ${min} 이상이어야 합니다.`
      }
    } else if (type === 'max') {
      const max = Number(params)
      if (!isNaN(max) && value != null && value !== '' && Number(value) > max) {
        return `${colTitle} 항목의 값은 ${max} 이하이어야 합니다.`
      }
    } else if (type === 'numeric' || type === 'integer') {
      if (value != null && value !== '') {
        const num = Number(value)
        if (isNaN(num)) return `${colTitle} 항목은 숫자만 입력 가능합니다.`
        if (type === 'integer' && !Number.isInteger(num)) return `${colTitle} 항목은 정수만 입력 가능합니다.`
      }
    }
  }

  return null
}

/** 한 셀의 표시 상태를 맵 기준으로 다시 칠한다 */
function paintCell(cell: any) {
  const el = cell.getElement?.()
  const field = cell.getField?.()
  const rowData = cell.getRow?.()?.getData?.()
  if (!el || !field || !rowData) return
  const isDirty = props.markDirty && !!dirtyFields.get(rowData)?.has(field)
  const isInvalid = !!invalidFields.get(rowData)?.has(field)
  el.classList.toggle('cell-dirty', isDirty)
  el.classList.toggle('tabulator-validation-fail', isInvalid)

  // 셀 내부에 InputField2 가 마운트되어 있는 경우, 에러 테두리를 즉시 갱신
  const cellInvalidRef = cellInvalidRefs.get(rowData)?.get(field)
  if (cellInvalidRef) {
    cellInvalidRef.value = isInvalid
  }
}

/** 한 행의 모든 셀을 다시 칠한다. rowFormatter(=셀이 재생성되는 지점)에서 호출 */
function paintRow(row: any) {
  const cells = row.getCells?.() ?? []
  cells.forEach((cell: any) => paintCell(cell))
}

function repaintAll() {
  table?.getRows().forEach((row: any) => paintRow(row))
}

/* ------------------------------------------------------------------ *
 * 페이지네이션 상태
 *  - 외부 제어(서버 사이드) 모드: totalElements, totalPages, currentPage 가
 *    전달되면 Tabulator 내장 페이징 대신 외부 상태로 직접 Pagination 을 제어한다.
 *  - 로컬 모드: 기존처럼 Tabulator 내장 로컬 페이징 + 내부 상태로 동작 (하위 호환).
 * ------------------------------------------------------------------ */
const isManualPagination = computed(
  () =>
    props.totalElements !== undefined ||
    props.totalPages !== undefined ||
    props.currentPage !== undefined,
)

const internalCurrentPage = ref(1)
const pageSize = ref(props.itemsPerPage)
const internalTotalElements = ref(props.data.length)

const currentPage = computed({
  get: () => (props.currentPage !== undefined ? props.currentPage : internalCurrentPage.value),
  set: (val: number) => {
    internalCurrentPage.value = val
    emit('update:currentPage', val)
    emit('page-change', val)
  },
})

const totalElements = computed(() => {
  if (props.totalElements !== undefined) return props.totalElements
  if (props.totalPages !== undefined) return props.totalPages * pageSize.value
  return internalTotalElements.value
})

const totalPages = computed(() => {
  if (props.totalPages !== undefined) return props.totalPages
  return Math.max(1, Math.ceil(totalElements.value / pageSize.value))
})

function goToPage(page: number) {
  if (isManualPagination.value) {
    if (props.currentPage === undefined) {
      internalCurrentPage.value = page
    }
    emit('update:currentPage', page)
    emit('page-change', page)
  } else {
    table?.setPage(page)
  }
}

function changePageSize(size: number) {
  pageSize.value = size
  if (!isManualPagination.value) {
    table?.setPageSize(size)
  }
  emit('update:itemsPerPage', size)
}

/* ------------------------------------------------------------------ *
 * 세로 스크롤 여부에 따른 하단 경계선(.tabulator.has-vscroll) 토글
 * ------------------------------------------------------------------ */
let scrollBorderObserver: ResizeObserver | null = null

function watchVScrollBorder() {
  const root = hostEl.value
  if (!root) return
  const holder = root.querySelector('.tabulator-tableholder') as HTMLElement | null
  const content = root.querySelector('.tabulator-table') as HTMLElement | null
  if (!holder || !content) return

  const check = () => {
    root.classList.toggle('has-vscroll', holder.scrollHeight > holder.clientHeight + 1)
  }
  check()

  scrollBorderObserver = new ResizeObserver(check)
  scrollBorderObserver.observe(holder)
  scrollBorderObserver.observe(content)
}

/* ------------------------------------------------------------------ *
 * 컨테이너 폭이 바뀌면 컬럼 폭을 다시 계산
 * ------------------------------------------------------------------ */
/*
 * Tabulator 의 autoResize 는 renderVertical 이 'virtual' 일 때만 ResizeObserver 를 달고,
 * 그 밖에는 window resize 만 듣는다. 이 그리드는 행 겹침 때문에 'basic' 을 쓰므로(마운트
 * 옵션 참고) LayoutSplit 스플리터 드래그처럼 "창 크기는 그대로인데 컨테이너만 넓어지는"
 * 경우 fitColumns 가 옛 폭 그대로 남아 오른쪽에 빈칸이 생긴다. 직접 관찰해서 다시 그린다.
 */
let widthObserver: ResizeObserver | null = null
let widthRedrawFrame = 0

/*
 * 페이지 폭 — 이 컴포넌트 안에서만 쓴다(밖으로 내보내지 않는다).
 * 창 크기가 바뀌면 window resize 로, 창은 그대로인데 LNB 접기·스플리터 드래그로
 * 컨테이너만 바뀌면 아래 ResizeObserver 로 갱신된다.
 */
/**
 * 페이지(뷰포트) 폭 px. 리사이즈마다 갱신.
 * setup 시점에 바로 실제 폭을 넣는다 — 0 으로 시작하면 isPcSize 가 false 라
 * v-if 안의 그리드가 첫 렌더에 안 그려지고, 그러면 tableBuilt 도 오지 않아
 * 폭을 다시 잴 기회가 없다(닭-달걀).
 */
const pageWidth = ref(Math.round(window.innerWidth))

/** 지금 이 순간의 페이지 폭을 읽어 갱신하고 돌려준다 */
function measurePageWidth() {
  pageWidth.value = Math.round(window.innerWidth)
  return pageWidth.value
}

/** 페이지 폭이 pcSize(기본 768) 이상인가. 템플릿에서 분기용으로 쓴다 */
const isPcSize = computed(() => pageWidth.value >= props.pcSize)

/* ------------------------------------------------------------------ *
 * 카드 뷰 (좁은 폭)
 * ------------------------------------------------------------------ */
/*
 * 표는 가로 폭을 전제로 한 UI 라 좁은 화면에서는 카드 목록으로 바꾼다.
 * 화면이 따로 해줄 일은 없다 — 카드 내용은 columns 의 title/field 에서 만든다.
 * 생김새를 직접 정하려면 #card 슬롯으로 덮어쓴다.
 */
const cardView = computed(() => !isPcSize.value && props.cardOnMobile)

/*
 * 카드에 넣을 컬럼. 컬럼 정의의 card* 옵션으로 화면마다 손볼 수 있다.
 *  - cardHidden    : 카드에서 뺀다(표에는 그대로)
 *  - cardOrder     : 카드에서의 순서(작을수록 위). 안 주면 columns 순서
 *  - cardHideTitle : 라벨(컬럼명) 없이 값만
 *  - cardHeading   : 이 컬럼을 카드 제목으로(안 주면 첫 컬럼)
 */
const cardColumns = computed(() =>
  (props.columns ?? [])
    .filter((col: any) => col.field && !col.cardHidden)
    // cardOrder 를 준 컬럼이 먼저, 안 준 컬럼은 원래 순서를 유지한다
    .map((col: any, index: number) => ({ col, order: col.cardOrder ?? Number.MAX_SAFE_INTEGER, index }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map((entry) => entry.col),
)
/** 카드 제목 컬럼 — cardHeading 을 준 컬럼, 없으면 첫 컬럼 */
const cardTitleColumn = computed(
  () => cardColumns.value.find((col: any) => col.cardHeading) ?? cardColumns.value[0],
)
/** 제목을 뺀 나머지 — 카드 본문의 라벨-값 줄 */
const cardFields = computed(() => cardColumns.value.filter((col: any) => col !== cardTitleColumn.value))

/*
 * 카드 뷰에는 Tabulator 가 없으므로 선택 상태를 여기서 들고 있는다.
 * getSelectedData() 가 표/카드 어느 쪽이든 같은 결과를 주도록 하기 위한 것이다.
 */
const cardSelected = ref<any[]>([])
/** 카드에서 체크박스를 보일지 — 표의 select-mode 를 그대로 따른다 */
const cardSelectable = computed(() => props.selectMode === 'checkbox' || props.selectable)

function isCardSelected(row: any) {
  return cardSelected.value.includes(row)
}
function toggleCardSelect(row: any) {
  cardSelected.value = isCardSelected(row)
    ? cardSelected.value.filter((r) => r !== row)
    : [...cardSelected.value, row]
  emit('row-selection-changed', cardSelected.value)
}
/* 데이터가 갈리면 선택도 무효다(삭제된 행이 선택에 남지 않게) */
watch(
  () => props.data,
  (next) => {
    if (!cardView.value) return
    cardSelected.value = cardSelected.value.filter((row) => (next ?? []).includes(row))
  },
)

/** 창 크기 변경. 드래그 중 연속 호출을 프레임당 한 번으로 묶는다 */
let pageWidthFrame = 0
function onWindowResize() {
  cancelAnimationFrame(pageWidthFrame)
  pageWidthFrame = requestAnimationFrame(() => measurePageWidth())
}

function watchContainerWidth() {
  const root = hostEl.value
  if (!root) return

  let lastWidth = Math.round(root.clientWidth)

  widthObserver = new ResizeObserver((entries) => {
    const width = Math.round(entries[0].contentRect.width)
    // 폭이 그대로면(세로 스크롤바 토글 등) 다시 그릴 이유가 없다. 0 은 숨겨진 상태다.
    if (!width || width === lastWidth) return
    lastWidth = width
    measurePageWidth()
    // 드래그 중에는 매 프레임 들어오므로 한 프레임에 한 번만 그린다
    cancelAnimationFrame(widthRedrawFrame)
    widthRedrawFrame = requestAnimationFrame(() => table?.redraw(true))
  })
  widthObserver.observe(root)
}

/* ------------------------------------------------------------------ *
 * 일괄 선택 체크박스: custom/checkbox 를 셀/헤더에 실제 마운트해
 * Tabulator 의 행 선택 상태와 양방향으로 동기화
 * ------------------------------------------------------------------ */
/** 행 데이터 객체 -> 그 행 체크박스의 표시 상태 */
const rowSelectState = new Map<any, Ref<boolean>>()
let headerCheckbox: { el: HTMLElement; state: Ref<'checked' | 'unchecked' | 'indeterminate'> } | null =
  null

function rowCheckboxFormatter(cell: any) {
  const row = cell.getRow()
  const state = ref(row.isSelected())
  rowSelectState.set(row.getData(), state)

  return mountCell(cell, CELL_KEY_SELECT, 'grid-checkbox-cell', () =>
    h(Checkbox, {
      modelValue: state.value,
      'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
        const next = val === true
        state.value = next
        next ? row.select() : row.deselect()
      },
    }),
  )
}

function headerCheckboxFormatter() {
  // 헤더가 다시 그려질 때도 이전 트리를 먼저 정리
  if (headerCheckbox) render(null, headerCheckbox.el)

  const container = document.createElement('div')
  container.classList.add('grid-checkbox-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const state = ref<'checked' | 'unchecked' | 'indeterminate'>('unchecked')

  mountVNode(container, () =>
    h(Checkbox, {
      variant: state.value === 'indeterminate' ? 'minus' : 'default',
      modelValue: state.value !== 'unchecked',
      'onUpdate:modelValue': () => {
        state.value === 'unchecked' ? table?.selectRow() : table?.deselectRow()
      },
    }),
  )
  headerCheckbox = { el: container, state }

  return container
}

function unmountHeaderCheckbox() {
  if (!headerCheckbox) return
  render(null, headerCheckbox.el)
  headerCheckbox = null
}

/** 행 선택 여부가 바뀔 때마다 모든 체크박스 상태를 동기화 */
function syncSelectionCheckboxes() {
  if (!table) return

  table.getRows().forEach((row: any) => {
    const state = rowSelectState.get(row.getData())
    if (state) state.value = row.isSelected()
  })

  if (headerCheckbox) {
    const totalCount = table.getRows().length
    const selectedCount = table.getSelectedRows().length
    headerCheckbox.state.value =
      selectedCount === 0 ? 'unchecked' : selectedCount === totalCount ? 'checked' : 'indeterminate'
  }
}

/* ------------------------------------------------------------------ *
 * 날짜 셀: custom/datepicker 를 셀에 마운트해 항상 달력이 보이도록
 * DatePicker 가 valueType='string' 으로 dateFormat 문자열을 그대로 돌려주므로
 * 셀 값(문자열)과 타입이 어긋나지 않음
 * ------------------------------------------------------------------ */
function dateCellFormatter(columnKey: string) {
  return (cell: any) => {
    const dateValue = ref<string>(cell.getValue() ?? '')

    return mountCell(cell, columnKey, 'grid-date-cell', () =>
      h(Datepicker, {
        modelValue: dateValue.value,
        'onUpdate:modelValue': (val: Date | string | null) => {
          const next = typeof val === 'string' ? val : ''
          dateValue.value = next
          cell.setValue(next) // 값 반영 + cellEdited 이벤트 발생
        },
        teleport: true,
        size: 'sm',
        format: props.dateFormat,
        valueFormat: props.dateFormat,
        placeholder: props.datePlaceholder,
        clearable: false,
      }),
    )
  }
}

/* ------------------------------------------------------------------ *
 * 상시 노출 입력 셀: 편집 모드 진입 없이 셀 안에 항상 텍스트 input 표시
 * ------------------------------------------------------------------ */
function inputCellFormatter(col: TabulatorGridColumn, columnKey: string) {
  return (cell: any) => {
    const rowData = cell.getRow().getData()

    // cellVisible 이 false 인 행은 입력칸 없이 값만 보여준다(buttonVisible 과 같은 개념)
    if (col.cellVisible?.(rowData) === false) {
      const span = document.createElement('span')
      span.textContent = cell.getValue() ?? ''
      return span
    }

    const field = col.field || cell.getField?.() || ''
    const value = ref<string>(cell.getValue() ?? '')
    const isInvalid = ref(!!invalidFields.get(rowData)?.has(field))

    // 행-필드별 invalid 상태 ref 등록
    let byField = cellInvalidRefs.get(rowData)
    if (!byField) {
      byField = new Map()
      cellInvalidRefs.set(rowData, byField)
    }
    byField.set(field, isInvalid)

    // cellMaxLength(대문자 L)는 기존 화면(PC-COM-2206 등)이 쓰던 이름이라 함께 받는다
  const rawMaxlength = col.cellMaxlength ?? col.maxlength
    const parsedMaxlength =
      rawMaxlength != null && rawMaxlength !== '' ? Number(rawMaxlength) : undefined

    /*
     * 타이핑 도중이 아니라 편집이 끝났을 때(blur/Enter) 한 번만 커밋한다.
     * 매 키 입력마다 setValue 를 부르면 cellEdited 가 글자 수만큼 발생해
     * dirty 표시가 요동치기 때문. (기존 raw input 의 change 동작과 동일)
     */
    const commit = () => {
      // validator 검증
      if (col.validator && field) {
        const errorMsg = checkCellValidity(col, value.value, cell)
        if (errorMsg) {
          addField(invalidFields, rowData, field)
          isInvalid.value = true
          paintCell(cell)
          emit('validation-failed', {
            row: rowData,
            field,
            value: value.value,
            message: errorMsg,
            cell,
          })
        } else {
          removeField(invalidFields, rowData, field)
          isInvalid.value = false
          paintCell(cell)
        }
      }
      cell.setValue(value.value)
    }

    // 지우기(X), 조회 아이콘, maxLength 또는 cellShowCount 가 필요한 셀은 InputField2 로
    const rich = Boolean(
      col.cellClearable || col.cellIcon || parsedMaxlength != null || col.cellShowCount,
    )

    /**
     * cellNumeric: 숫자 아닌 글자를 걷어낸다(타이핑·붙여넣기·IME 조합 끝 모두 이 경로를 지난다).
     * Input 이 useVModel(passive) 라 '' → 'a' → '' 처럼 부모 값이 안 바뀌면 안쪽 글자가 그대로 남는다 —
     * 걷어낸 결과가 원문과 다르면 native input 의 value 를 직접 되돌린다.
     */
    const sanitize = (raw: string) => {
      if (!col.cellNumeric) return raw
      const next = raw.replace(/\D/g, '')
      if (next !== raw) {
        const el = cell.getElement().querySelector('input') as HTMLInputElement | null
        if (el && el.value !== next) el.value = next
      }
      return next
    }
    // 숫자 셀: 모바일 숫자 키패드(inputmode) + 숫자 아닌 글자는 들어오기 전에 막는다(beforeinput).
    // 붙여넣기처럼 숫자·글자가 섞여 오면 숫자만 골라 넣는다. IME 조합은 막지 않고 sanitize 가 뒷받침
    const numericAttrs = col.cellNumeric
      ? {
          inputmode: 'numeric',
          onBeforeinput: (e: InputEvent) => {
            if (!e.data || !/\D/.test(e.data) || e.inputType.startsWith('insertComposition')) return
            e.preventDefault()
            const el = e.target as HTMLInputElement
            const start = el.selectionStart ?? el.value.length
            const end = el.selectionEnd ?? start
            let cleaned = e.data.replace(/\D/g, '')
            if (parsedMaxlength != null && !isNaN(parsedMaxlength)) {
              cleaned = cleaned.slice(0, Math.max(0, parsedMaxlength - (el.value.length - (end - start))))
            }
            if (!cleaned) return
            el.setRangeText(cleaned, start, end, 'end')
            el.dispatchEvent(new Event('input', { bubbles: true }))
          },
        }
      : {}

    return mountCell(cell, columnKey, 'grid-input-cell', () =>
      rich
        ? h(InputField2, {
            modelValue: value.value,
            size: 'sm',
            clearable: Boolean(col.cellClearable),
            placeholder: col.cellPlaceholder,
            maxlength: parsedMaxlength,
            showCount: Boolean(col.cellShowCount),
            borderStyle: isInvalid.value ? 'error' : undefined,
            ...(col.cellIcon
              ? {
                  icon: col.cellIcon,
                  iconClass: 'size-5',
                  iconLabel: col.cellIconLabel ?? '조회',
                  search: true,
                  onIconClick: () => col.onCellIconClick?.(cell.getRow().getData(), cell),
                }
              : {}),
            // 셀 안이라 라벨은 안 보이지만, 스크린리더에는 어느 칸인지 알려준다
            label: col.title,
            labelClass: 'sr-only',
            class: '!space-y-0',
            inputClass: 'w-full',
            ...numericAttrs,
            'onUpdate:modelValue': (val: string | number) => {
              let next = sanitize(String(val ?? ''))
              if (parsedMaxlength != null && !isNaN(parsedMaxlength) && next.length > parsedMaxlength) {
                next = next.slice(0, parsedMaxlength)
              }
              // 지우기(X)는 native change 를 안 쏘므로 그 자리에서 바로 커밋한다
              const cleared = next === '' && value.value !== ''
              value.value = next
              if (cleared) commit()
            },
            onChange: commit,
          })
        : h(Input, {
            modelValue: value.value,
            size: 'sm',
            // 값이 비어 있을 때 안내 문구(시안에서 '부서조회'처럼 회색으로 깔리는 글자)
            placeholder: col.cellPlaceholder,
            maxlength: parsedMaxlength,
            ...numericAttrs,
            'onUpdate:modelValue': (val: string | number) => {
              let next = sanitize(String(val ?? ''))
              if (parsedMaxlength != null && !isNaN(parsedMaxlength) && next.length > parsedMaxlength) {
                next = next.slice(0, parsedMaxlength)
              }
              value.value = next
            },
            onChange: commit,
          }),
    )
  }
}

/* ------------------------------------------------------------------ *
 * 버튼 셀: custom/button 의 Button 컴포넌트를 셀에 실제 마운트
 * (클래스만 복사하지 않고 컴포넌트를 그대로 쓰므로 Button 스펙이 바뀌면 함께 반영됨)
 * ------------------------------------------------------------------ */
function buttonCellFormatter(col: TabulatorGridColumn, columnKey: string) {
  return (cell: any) => {
      const rowData = cell.getRow().getData()
      // 라벨은 고정 문자열뿐 아니라 행 데이터로 만들어 쓸 수도 있다(셀 값을 버튼 텍스트로 쓰는 경우 등)
      const label = typeof col.buttonLabel === 'function' ? col.buttonLabel(rowData, cell) : col.buttonLabel

    // buttonVisible 이 false 인 행은 버튼 모양(테두리/배경) 없이 라벨 텍스트만 보여준다.
    // 클릭 핸들러는 그대로 살려서, "값이 없으면 버튼으로 고르고 값이 생기면 그 값 자체를
    // 눌러서 다시 바꾸는" 패턴을 Vue 컴포넌트를 새로 mount 하지 않고도 구현할 수 있게 한다.
    if (col.buttonVisible?.(rowData) === false) {
      const span = document.createElement('span')
      span.textContent = label ?? ''
      span.style.cursor = 'pointer'
      span.addEventListener('click', (e) => {
        e.stopPropagation()
        col.onButtonClick?.(rowData, cell)
      })
      return span
    }

    return mountCell(cell, columnKey, 'grid-button-cell', () =>
      h(
        Button,
        {
          variant: col.buttonVariant ?? 'tertiary',
          size: col.buttonSize ?? 'sm',
          class: col.buttonClass,
          disabled: col.buttonDisabled?.(rowData) ?? false,
          onClick: (e: Event) => {
            e.stopPropagation()
            col.onButtonClick?.(rowData, cell)
          },
        },
        () => label ?? '버튼',
      ),
      )
  }
}

/* ------------------------------------------------------------------ *
 * 셀렉트 셀: custom/select 의 SelectField 를 셀에 마운트
 * ------------------------------------------------------------------ */
function selectCellFormatter(col: TabulatorGridColumn, columnKey: string) {
  return (cell: any) => {
    // cellVisible 이 false 인 행은 셀렉트 없이 값만 보여준다(buttonVisible 과 같은 개념)
    if (col.cellVisible?.(cell.getRow().getData()) === false) {
      const span = document.createElement('span')
      span.textContent = cell.getValue() ?? ''
      return span
    }

    const value = ref(cell.getValue())

    return mountCell(cell, columnKey, 'grid-select-cell', () =>
      h(SelectField, {
        modelValue: value.value,
        options: col.selectOptions ?? [],
        placeholder: col.selectPlaceholder,
        size: 'sm',
        'onUpdate:modelValue': (val: string | number) => {
          value.value = val
          cell.setValue(val) // 값 반영 + cellEdited 이벤트 발생
        },
      }),
    )
  }
}

/* ------------------------------------------------------------------ *
 * 스위치 / 체크박스 셀: boolean 값 토글 (custom/switch, custom/checkbox)
 * ------------------------------------------------------------------ */
function switchCellFormatter(columnKey: string) {
  return (cell: any) => {
    const value = ref(!!cell.getValue())

    return mountCell(cell, columnKey, 'grid-switch-cell', () =>
      h(Switch, {
        modelValue: value.value,
        'onUpdate:modelValue': (val: boolean) => {
          value.value = val
          cell.setValue(val)
        },
      }),
    )
  }
}

function checkboxCellFormatter(columnKey: string) {
  return (cell: any) => {
    // 값이 null/undefined 인 행은 체크박스를 그리지 않고 빈 칸으로 둔다(badgeCellFormatter 와 같은 규칙).
    // 명시적으로 true/false 를 준 행만 체크박스가 보인다.
    const raw = cell.getValue()
    if (raw === null || raw === undefined) return document.createElement('div')

    const value = ref(!!raw)

    return mountCell(cell, columnKey, 'grid-checkbox-cell', () =>
      h(Checkbox, {
        modelValue: value.value,
        'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
          const next = val === true
          value.value = next
          cell.setValue(next)
        },
      }),
    )
  }
}

/* ------------------------------------------------------------------ *
 * 뱃지 셀: custom/badge 로 상태 값을 표시(읽기 전용)
 * ------------------------------------------------------------------ */
function badgeCellFormatter(col: TabulatorGridColumn, columnKey: string) {
  return (cell: any) => {
    const raw = cell.getValue()
    if (raw === null || raw === undefined || raw === '') return document.createElement('div')

    return mountCell(cell, columnKey, '', () =>
      h(
        Badge,
        {
          color: col.badgeColorMap?.[String(raw)] ?? col.badgeFallbackColor ?? 'grayLighter',
          size: 'md',
        },
        () => String(raw),
      ),
    )
  }
}

/* ------------------------------------------------------------------ *
 * 컬럼 빌드: cellType 을 실제 Tabulator formatter 로 변환
 * ------------------------------------------------------------------ */
/**
 * 컬럼 하나를 Tabulator 컬럼 정의로 변환.
 *
 * `columnKey` 는 셀에 마운트한 Vue 트리를 (행, 컬럼) 단위로 추적하기 위한 키다.
 * field 가 없는 컬럼(버튼 등)도 있어서 위치 기반으로 만든다.
 */
/*
 * 공용 테마(tabulator-theme.css) 셀이 display:inline-flex + justify-content:center로 고정되어 있어서,
 * Tabulator 자체의 hozAlign(text-align만 넣어줌)으로는 left/right가 적용이 안된다.
 * hozAlign:'left'/'right' 인 컬럼엔 justify-content 를 되돌리는 클래스를 자동으로 붙여서,
 * 화면마다 이 클래스를 직접 만들 필요 없이 hozAlign 만으로 의도한 정렬이 나오게 한다.
 */
function withAlignClass(built: Record<string, any>): Record<string, any> {
  const align = built.hozAlign
  if (align !== 'left' && align !== 'right') return built
  const alignClass = align === 'left' ? 'align-left' : 'align-right'
  return { ...built, cssClass: built.cssClass ? `${built.cssClass} ${alignClass}` : alignClass }
}

function buildColumn(col: TabulatorGridColumn, columnKey: string): Record<string, any> {
  return withAlignClass(buildColumnInner(col, columnKey))
}

function buildColumnInner(col: TabulatorGridColumn, columnKey: string): Record<string, any> {
  const {
    cellType,
    buttonLabel,
    buttonVariant,
    buttonSize,
    buttonClass,
    buttonDisabled,
    onButtonClick,
    selectOptions,
    badgeColorMap,
    badgeFallbackColor,
    ...rest
  } = col

  // 헤더 그룹(컬럼 중첩). Tabulator 6.x 는 데이터 셀 병합이 없어서 헤더 그룹핑이
  // 사실상 유일한 "병합" 수단인데, 자식 컬럼도 같은 규칙으로 변환해줘야
  // 그룹 안에서도 cellType(date/select/badge/button ...)을 쓸 수 있다.
  if (Array.isArray(rest.columns)) {
    return {
      ...rest,
      columns: rest.columns.map((child: TabulatorGridColumn, i: number) =>
        buildColumn(child, `${columnKey}-${i}`),
      ),
    }
  }

  // 폭을 아무것도 안 준 컬럼은 fitColumns 에서 40px 까지 찌그러진다.
  // 좁은 화면에서 컬럼이 뭉개지는 대신 가로 스크롤이 생기도록 바닥을 깔아준다.
  if (rest.width == null && rest.minWidth == null) rest.minWidth = props.columnMinWidth

  // formatter 를 직접 넘긴 경우에는 그것을 우선한다
  if (rest.formatter || !cellType) return rest

  if (cellType === 'date') return { ...rest, formatter: dateCellFormatter(columnKey) }
  if (cellType === 'input') return { ...rest, formatter: inputCellFormatter(col, columnKey) }
  if (cellType === 'select') return { ...rest, formatter: selectCellFormatter(col, columnKey) }
  if (cellType === 'switch')
    return { ...rest, hozAlign: rest.hozAlign ?? 'center', formatter: switchCellFormatter(columnKey) }
  if (cellType === 'checkbox')
    return { ...rest, hozAlign: rest.hozAlign ?? 'center', formatter: checkboxCellFormatter(columnKey) }
  if (cellType === 'badge')
    return {
      ...rest,
      hozAlign: rest.hozAlign ?? 'center',
      editor: false,
      formatter: badgeCellFormatter(col, columnKey),
    }
  if (cellType === 'button') {
    return { ...rest, headerSort: false, editor: false, formatter: buttonCellFormatter(col, columnKey) }
  }
  return rest
}

/* ------------------------------------------------------------------ *
 * 행 선택 방식
 * ------------------------------------------------------------------ */
/** 구 프롭 selectable 은 체크박스 다중 선택과 같은 의미로 취급한다 */
const resolvedSelectMode = computed(() => (props.selectable ? 'checkbox' : props.selectMode))
/** 맨 앞 체크박스 컬럼을 넣을지 */
const hasSelectColumn = computed(() => resolvedSelectMode.value === 'checkbox')
/** Tabulator 의 selectableRows 값 (false = 선택 없음, 1 = 한 행만, true = 여러 행) */
const selectableRows = computed(() => {
  if (resolvedSelectMode.value === 'none') return false
  if (resolvedSelectMode.value === 'single') return 1
  return true
})

function buildColumns() {
  const cols = props.columns.map((col, index) => buildColumn(col, `col-${index}`))

  if (!hasSelectColumn.value) return cols

  return [
    {
      formatter: rowCheckboxFormatter,
      // selectColumnTitle 을 주면 헤더에 전체선택 체크박스 대신 그 문구만 보통 컬럼처럼 표시한다
      // (행별 체크박스는 그대로 동작 — 전체선택만 빠진다).
      ...(props.selectColumnTitle
        ? { title: props.selectColumnTitle }
        : { titleFormatter: headerCheckboxFormatter }),
      hozAlign: 'center',
      headerSort: false,
      width: props.selectColumnTitle ? 80 : 44,
      frozen: true,
      responsive: 0,
    },
    ...cols,
  ]
}

/* ------------------------------------------------------------------ *
 * 행 드래그(정렬 / 그리드 간 이동·복사) 옵션
 * ------------------------------------------------------------------ */
function movableRowsOptions() {
  if (!props.movableRows) return {}
  return {
    movableRows: true,
    ...(props.connectedTo
      ? {
          movableRowsConnectedTables: props.connectedTo,
          movableRowsReceiver: props.receiveMode,
          // Tabulator 기본값 false = "보낸 뒤 원본을 그대로 둔다"(= 복사)
          movableRowsSender: props.keepSource ? false : 'delete',
        }
      : {}),
  }
}

/* ------------------------------------------------------------------ *
 * 마운트
 * ------------------------------------------------------------------ */
/** Tabulator 생성. 카드 뷰일 때는 host 엘리먼트 자체가 없으므로 호출되지 않는다 */
function buildTable() {
  if (table || !hostEl.value) return
  table = new Tabulator(hostEl.value, {
    data: clone(props.data),
    reactiveData: false,
    layout: props.layout,
    responsiveLayout: props.responsiveLayout,
    resizableColumns: props.resizableColumns,
    resizableRows: props.resizableRows,
    movableColumns: props.movableColumns,
    selectableRows: selectableRows.value,
    columnDefaults: { headerSort: props.headerSort },
    tooltip: true,
    height: props.height,
    placeholder: props.placeholder,
    // CSS 로 행 높이를 조절하므로 가상 렌더링 대신 기본 렌더링 사용(행 겹침 방지)
    renderVertical: 'basic',
    columns: buildColumns(),
    ...movableRowsOptions(),
    ...(props.showPagination && !isManualPagination.value
      ? {
          pagination: true,
          paginationMode: 'local',
          paginationSize: pageSize.value,
          paginationSizeSelector: false,
        }
      : {}),
    rowFormatter: (row: any) => {
      // 셀이 재생성되는 지점이므로 변경/유효성 표시를 여기서 다시 칠한다
      paintRow(row)

      if (!props.rowClass) return
      const el = row.getElement()
      // 행 엘리먼트가 재사용될 수 있으므로 이전에 붙인 클래스를 먼저 제거한다
      const prev = el.dataset.gridRowClass 
      if (prev) {
        el.classList.remove(prev)
        delete el.dataset.gridRowClass
      }
      const cls = props.rowClass(row.getData())
      if (cls) {
        el.classList.add(cls)
        el.dataset.gridRowClass = cls
      }
    },
    ...(props.tableOptions ?? {}),
  })

  table.on('tableBuilt', () => {
    tableBuilt = true
    watchVScrollBorder()
    watchContainerWidth()
    emit('table-built', table)
  })

  table.on('cellEdited', (cell: any) => {
    const field = cell.getField()
    const rowData = cell.getRow().getData()
    addField(dirtyFields, rowData, field)

    // 해당 컬럼 정의 찾기 및 validator 재검증
    const colDef = props.columns.find((c) => c.field === field)
    let hasValidationError = false
    if (colDef?.validator) {
      const errorMsg = checkCellValidity(colDef, cell.getValue(), cell)
      if (errorMsg) {
        hasValidationError = true
        addField(invalidFields, rowData, field)
        emit('validation-failed', {
          row: rowData,
          field,
          value: cell.getValue(),
          message: errorMsg,
          cell,
        })
      }
    }

    if (!hasValidationError) {
      removeField(invalidFields, rowData, field)
    }

    paintCell(cell)
    emitData()
    emit('cell-edited', cell)
  })

  table.on('validationFailed', (cell: any) => {
    const field = cell.getField()
    const rowData = cell.getRow().getData()
    addField(invalidFields, rowData, field)
    const colDef = props.columns.find((c) => c.field === field)
    const colTitle = colDef?.title || field
    emit('validation-failed', {
      row: rowData,
      field,
      value: cell.getValue(),
      message: `${colTitle} 항목의 입력값이 유효하지 않습니다.`,
      cell,
    })
  })

  table.on('rowClick', (e: Event, row: any) => emit('row-click', e, row))
  table.on('rowDblClick', (e: Event, row: any) => emit('row-dbl-click', e, row))

  // 페이지네이션 동기화 (로컬 모드일 때만 Tabulator 이벤트로 갱신)
  table.on('pageLoaded', (pageno: number) => {
    if (!isManualPagination.value) {
      internalCurrentPage.value = pageno
    }
  })
  table.on('dataProcessed', () => {
    if (!isManualPagination.value) {
      internalTotalElements.value = table.getDataCount()
    }
  })

  // 선택 상태 동기화
  table.on('rowSelectionChanged', (_data: any, rows: any[]) => {
    syncSelectionCheckboxes()
    emit('row-selection-changed', rows)
  })
  table.on('rowAdded', () => {
    syncSelectionCheckboxes()
    if (!isManualPagination.value) {
      internalTotalElements.value = table.getDataCount()
    }
    emitData()
  })
  table.on('rowDeleted', () => {
    unmountOrphanRowCells()
    syncSelectionCheckboxes()
    if (!isManualPagination.value) {
      internalTotalElements.value = table.getDataCount()
    }
    emitData()
  })

  // 행 드래그
  table.on('movableRowsReceived', (fromRow: any, toRow: any, fromTable: any) => {
    if (!isManualPagination.value) {
      internalTotalElements.value = table.getDataCount()
    }
    emitData()
    emit('rows-received', fromRow, toRow, fromTable)
  })
  table.on('rowMoved', (row: any) => emit('row-moved', row))
}

/** Tabulator 와 거기 딸린 관측자만 정리한다(컴포넌트는 살아 있음) */
function destroyTable() {
  // Tabulator 를 먼저 destroy 하면 td 가 사라져 정리 대상을 못 찾으므로 Vue 트리부터 정리
  unmountAllRowCells()
  unmountHeaderCheckbox()
  dirtyFields.clear()
  invalidFields.clear()

  table?.destroy()
  table = null
  tableBuilt = false
  scrollBorderObserver?.disconnect()
  scrollBorderObserver = null
  widthObserver?.disconnect()
  widthObserver = null
  cancelAnimationFrame(widthRedrawFrame)
}

onMounted(() => {
  // 폭 관측은 표와 무관하게 항상 돈다(카드 뷰라 표가 없을 때도 폭 변화를 알아야 한다)
  measurePageWidth()
  window.addEventListener('resize', onWindowResize)
  if (!cardView.value) buildTable()
})

/* 표 <-> 카드 전환. v-if 로 host 엘리먼트가 사라지므로 Tabulator 를 남겨둘 수 없다 */
watch(cardView, async (isCard) => {
  if (isCard) {
    destroyTable()
  } else {
    await nextTick()   // host 엘리먼트가 실제로 생긴 뒤에 만든다
    buildTable()
  }
})

/**
 * KeepAlive 로 캐시된 화면(하단 탭)이 숨겨졌다가 다시 활성화될 때, 숨겨져 있던 동안
 * :data 가 바뀌었어도(예: 다른 화면에서 저장하고 목록으로 돌아옴) Tabulator 가 컨테이너
 * 크기를 0으로 측정한 채라 행을 그리지 못하고 있을 수 있다. 다시 보이게 된 시점에
 * redraw(true) 로 강제로 다시 그린다.
 *
 * 단, 화면에서 떨어진 표(닫히는 팝업 안의 표 등)에는 걸지 않는다 — Tabulator 의 redraw 는
 * 요소 크기를 재느라 elVisible() 에서 offsetWidth 를 읽는데, DOM 에서 빠진 뒤라면
 * "Cannot read properties of null (reading 'offsetWidth')" 가 발생한다. 그 예외가 활성화
 * 처리 도중에 나면 그 뒤 상태 반영이 멈춰 팝업이 안 닫히는 것처럼 보인다.
 */
onActivated(() => {
  if (!tableBuilt || !hostEl.value?.isConnected) return
  table?.redraw(true)
})

onBeforeUnmount(() => {
  destroyTable()
  window.removeEventListener('resize', onWindowResize)
  cancelAnimationFrame(pageWidthFrame)
})

/* ------------------------------------------------------------------ *
 * 데이터 / 컬럼 교체
 * ------------------------------------------------------------------ */
function applyData(rows: any[]) {
  if (!table) return
  // 새 데이터면 이전 행에 붙어 있던 트리와 변경/유효성 상태는 의미가 없다
  unmountAllRowCells()
  dirtyFields.clear()
  invalidFields.clear()
  table.setData(clone(rows))
}

/* ------------------------------------------------------------------ *
 * 부모 상태와의 동기화
 *
 * 이 컴포넌트는 data 를 복제해서 쓰기 때문에, 셀 편집·행 추가/삭제로 바뀐 내용은
 * 부모 배열에 저절로 반영되지 않는다. 그래서 바뀔 때마다 update:data 로 알려준다.
 *   <TabulatorGrid v-model:data="rows" ... />
 * 이렇게 받으면 rows 가 항상 그리드와 같은 내용이라, 저장할 때 getData() 를 따로
 * 부를 필요가 없고 부모가 배열을 갈아끼워도 편집 내용이 사라지지 않는다.
 *
 * v-model 로 되돌아온 배열까지 다시 setData 하면 편집 중에 리렌더가 일어나 포커스가
 * 날아가므로, 방금 우리가 내보낸 배열이면 무시한다.
 * ------------------------------------------------------------------ */
let lastEmittedData: any[] | null = null

function emitData() {
  if (!table) return
  const rows = table.getData()
  lastEmittedData = rows
  emit('update:data', rows)
}

/*
 * 부모가 data / columns 를 바꾸면 그리드를 갱신.
 *
 * 두 prop 을 별개의 watcher 로 다루면(예: 탭 전환처럼 둘이 같은 tick 에 함께 바뀔 때)
 * 등록 순서에 따라 "이전 컬럼 구조 + 새 데이터" 같은 어긋난 조합이 한 순간 Tabulator 에
 * 들어가서, 그 이후로 다시 그려도(redraw) 복구되지 않는 레이아웃 깨짐이 남을 수 있다.
 * 하나의 watcher 에서 컬럼을 먼저 반영한 뒤 데이터를 반영해 항상 같은 순서를 보장한다.
 * (연결된 그리드에서 드래그로 받은 행도 함께 사라지므로, @rows-received 로 부모 상태를 맞춰둘 것)
 */
watch(
  [() => props.columns, () => props.data],
  ([nextColumns, nextData], prev) => {
    if (!table) return
    const [prevColumns, prevData] = prev ?? []
    const columnsChanged = nextColumns !== prevColumns
    // v-model 로 돌려받은 배열은 reactive 프록시로 감싸여 오므로 toRaw 로 비교한다
    const isOwnEmit = nextData === lastEmittedData || toRaw(nextData) === lastEmittedData
    const dataChanged = nextData !== prevData && !isOwnEmit
    if (isOwnEmit) lastEmittedData = null

    if (columnsChanged) {
      unmountAllRowCells()
      unmountHeaderCheckbox()
      table.setColumns(buildColumns())
      repaintAll()
    }

    if (dataChanged) {
      if (!isManualPagination.value) {
        internalTotalElements.value = nextData?.length ?? 0
      }
      applyData(nextData)
    }

    if (columnsChanged) {
      table.redraw(true)
      // setColumns 직후엔 세로 스크롤바가 생기기/사라지기 전 폭 기준으로 fitColumns 가
      // 계산돼 헤더·본문 폭이 어긋날 수 있다. 스크롤바 반영 후 한 번 더 그린다.
      requestAnimationFrame(() => table?.redraw(true))
    }
  },
)

/* 부모가 itemsPerPage 를 바꾸면 반영 */
watch(
  () => props.itemsPerPage,
  (next) => {
    if (next === pageSize.value) return
    pageSize.value = next
    if (!isManualPagination.value) {
      table?.setPageSize(next)
    }
  },
)

/* ------------------------------------------------------------------ *
 * 외부(부모)에서 쓸 수 있는 조작 API
 * ------------------------------------------------------------------ */
defineExpose({
  /** Tabulator 인스턴스를 직접 다뤄야 할 때 */
  getTable: () => table,

  /* 데이터 조회 / 변경 */
  getData: () => table?.getData() ?? [],
  /** 표/카드 어느 쪽이든 선택된 행 데이터를 돌려준다 */
  getSelectedData: () => (cardView.value ? [...cardSelected.value] : (table?.getSelectedData() ?? [])),
  getSelectedRows: () => table?.getSelectedRows() ?? [],
  setData: (rows: any[]) => applyData(rows),
  addRow: (rowData: any, top = true) => table?.addRow(rowData, top),
  /**
   * 페이지 이동 (1-based). 'last' 면 마지막 페이지.
   * 행을 맨 뒤에 추가하면 페이지네이션이 있을 때 다음 페이지로 밀려 안 보이므로,
   * addRow 뒤에 setPage('last') 로 따라가는 데 쓴다.
   */
  setPage: (page: number | 'last') => goToPage(page === 'last' ? totalPages.value : page),
  updateRow: (index: any, rowData: any) => table?.updateRow(index, rowData),
  deleteRow: (index: any) => table?.deleteRow(index),
  deleteSelected: () => table?.getSelectedRows().forEach((r: any) => r.delete()),

  /* 선택 */
  selectAll: () => table?.selectRow(),
  deselectAll: () => table?.deselectRow(),
  selectRow: (index: any) => table?.selectRow(index),
  /**
   * 조건에 맞는 행만 선택 상태로 만든다(기존 선택은 해제).
   * 다른 목록에서 고른 값에 맞춰 체크 상태를 맞출 때 쓴다.
   */
  selectWhere: (match: (rowData: any) => boolean) => {
    table?.deselectRow()
    table?.getRows().forEach((row: any) => {
      if (match(row.getData())) row.select()
    })
  },

  /* 컬럼 */
  showColumn: (field: string) => table?.showColumn(field),
  hideColumn: (field: string) => table?.hideColumn(field),
  toggleColumn: (field: string, visible: boolean) =>
    visible ? table?.showColumn(field) : table?.hideColumn(field),
  setLayout: (mode: TabulatorGridLayout) => {
    if (!table) return
    table.options.layout = mode
    table.redraw(true)
  },

  /* 변경(dirty) 셀 — 저장 대상만 추려 보낼 때 사용 */
  /** 변경된 셀들의 {row, field, value} 목록 */
  getDirtyCells: () => {
    if (!table) return []
    const result: { row: any; field: string; value: any }[] = []
    table.getRows().forEach((row: any) => {
      const rowData = row.getData()
      const fields = dirtyFields.get(rowData)
      if (!fields) return
      fields.forEach((field) => {
        result.push({ row: rowData, field, value: rowData[field] })
      })
    })
    return result
  },
  /** 변경된 행(중복 제거) 데이터 목록 */
  getDirtyRows: () => {
    if (!table) return []
    return table.getRows().reduce((acc: any[], row: any) => {
      const rowData = row.getData()
      if (dirtyFields.has(rowData)) acc.push(rowData)
      return acc
    }, [])
  },
  /** 저장 완료 후 변경 표시만 걷어낼 때 */
  clearDirty: () => {
    dirtyFields.clear()
    repaintAll()
  },

  /* 유효성 */
  /**
   * 유효성 검사를 통과하지 못한 셀 목록 (없으면 빈 배열).
   *
   * Tabulator 의 table.validate() 와 함께, 페이징/가상화로 인해
   * 렌더링되지 않은 전체 행 데이터(table.getData())에 대한 컬럼 validator 검증을
   * 통합 수행하여 누락 없이 실패 목록을 반환합니다.
   */
  validate: () => {
    const result: { row: any; field: string; message: string }[] = []

    // 1. Tabulator 내장 validate() 호출 결과 수집
    const apiResult = table?.validate()
    if (Array.isArray(apiResult)) {
      apiResult.forEach((cell: any) => {
        const rowData = cell.getRow?.().getData?.()
        const field = cell.getField?.()
        if (!field) return
        addField(invalidFields, rowData, field)
        const colDef = props.columns.find((c) => c.field === field)
        const colTitle = colDef?.title || field
        result.push({
          row: rowData,
          field,
          message: `${colTitle} 항목의 입력값이 유효하지 않습니다.`,
        })
      })
    }

    // 2. 전체 데이터 행에 대해 validator 가 있는 모든 컬럼 전수 검증 (페이징 누락 방지)
    const allRows = table?.getData() ?? []
    const validatedColumns = props.columns.filter((col) => col.field && col.validator)

    allRows.forEach((row: any) => {
      validatedColumns.forEach((col) => {
        const field = col.field!
        const value = row[field]
        const errorMsg = checkCellValidity(col, value)
        if (errorMsg) {
          addField(invalidFields, row, field)
          if (!result.some((r) => r.field === field && r.row === row)) {
            result.push({ row, field, message: errorMsg })
          }
        }
      })
    })

    // 3. invalidFields 에 등록된 이전 실패 내역 중 누락된 건 추가
    invalidFields.forEach((fields, rowData) => {
      fields.forEach((field) => {
        if (result.some((r) => r.field === field && r.row === rowData)) return
        const colDef = props.columns.find((c) => c.field === field)
        const colTitle = colDef?.title || field
        result.push({ row: rowData, field, message: `${colTitle} 항목의 입력값이 유효하지 않습니다.` })
      })
    })

    repaintAll()

    // 부모 컴포넌트 에러 핸들링을 위한 emit 발생
    if (result.length) {
      emit('validation-errors', result)
    }

    return result
  },
  /** 유효성 실패 표시를 걷어낼 때 */
  clearValidation: () => {
    invalidFields.clear()
    cellInvalidRefs.forEach((byField) => {
      byField.forEach((r) => {
        r.value = false
      })
    })
    repaintAll()
  },

  /* 기타 */
  setFilter: (...args: any[]) => (table as any)?.setFilter(...args),
  clearFilter: () => table?.clearFilter(true),
  download: (type: 'csv' | 'json' | 'xlsx' = 'csv', fileName = 'data.csv') =>
    table?.download(type, fileName),
  redraw: (force = true) => table?.redraw(force),
})
</script>

<!--
  루트를 세로 flex 로 둬서 두 가지 사용법을 모두 지원한다.
  - height="320px" 처럼 고정 높이: 루트 높이가 auto 라 지금까지와 동일하게 쌓인다.
  - height="100%" + class="h-full" 로 부모를 채우는 경우: 그리드가 남는 공간을 차지하고
    페이지네이션은 아래에 붙는다. (flex-auto + min-h-0 이라 페이지네이션 높이만큼 줄어든다)
-->
<template>
  <div v-bind="rootAttrs" class="tabulator-root flex flex-col">
    <!-- PC 폭(또는 #card 슬롯이 없을 때): 기존 Tabulator 표 -->
    <div
      v-if="!cardView"
      ref="hostEl"
      v-bind="hostAttrs"
      class="tabulator-host flex-auto min-h-0"
      :style="{ '--row-h': rowHeightPx }"
    />

    <!--
      좁은 폭: 표 대신 카드 목록. columns 의 title/field 로 자동 구성한다.
      화면이 #card 슬롯을 주면 그 마크업이 대신 쓰인다(<li> 째로 넘긴다).
    -->
    <ul v-else class="tabulator-card-list" :class="cardListClass">
      <template v-for="(row, index) in data" :key="(row as any)?.id ?? index">
        <slot
          name="card"
          :row="row"
          :index="index"
          :selected="isCardSelected(row)"
          :toggle="() => toggleCardSelect(row)"
        >
          <li
            class="tabulator-card"
            :class="[rowClass?.(row), cardClass?.(row), isCardSelected(row) && 'is-selected']"
            @click="$emit('card-click', row)"
          >
            <div class="tabulator-card-head">
              <Checkbox
                v-if="cardSelectable"
                :model-value="isCardSelected(row)"
                @update:model-value="() => toggleCardSelect(row)"
                @click.stop
              />
              <span v-if="cardTitleColumn" class="tabulator-card-title">
                {{ row[cardTitleColumn.field as string] }}
              </span>
            </div>
            <dl class="tabulator-card-body">
              <div
                v-for="col in cardFields"
                :key="col.field"
                class="tabulator-card-row"
                :class="{ 'is-no-label': col.cardHideTitle || !col.title }"
              >
                <dt v-if="!col.cardHideTitle && col.title">{{ col.title }}</dt>
                <dd>{{ row[col.field as string] ?? '-' }}</dd>
              </div>
            </dl>
          </li>
        </slot>
      </template>
      <slot v-if="!data.length" name="card-empty">
        <li class="tabulator-card-empty">{{ placeholder }}</li>
      </slot>
    </ul>

    <!-- 시안(메모 검색결과없음)에서는 0건일 때 페이지네이션 바가 통째로 사라진다 -->
    <Pagination
      v-if="showPagination && totalElements > 0 && !cardView"
      class="mt-[20px] shrink-0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="pageSize"
      :items-per-page-options="itemsPerPageOptions"
      :total-elements="totalElements"
      @update:page="goToPage"
      @update:items-per-page="changePageSize"
    />
  </div>
</template>

<style scoped>
/*
 * 최소 높이는 min-height prop 이 --grid-min-h 로 넘겨준다. 값이 없으면 0.
 * (템플릿에 인라인 style 을 두지 않으려고 변수만 넘기고 규칙은 여기에 둔다)
 */
.tabulator-root {
  min-height: var(--grid-min-h, 0);
}


/* ── 좁은 폭 카드 목록 ── */
.tabulator-card-list {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  overflow-y: auto;
}
.tabulator-card {
  display: flex;
  flex-direction: column;
  /* 간격 12px — Figma card(12738:50267) */
  gap: 1.2rem;
  padding: 1.6rem;
  border: 1px solid var(--Border_gray02);
  border-radius: var(--Radius-medium3);
  background: var(--Base-white, #fff);
}
.tabulator-card.is-selected {
  border: 2px solid var(--Base-primary);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 4px rgba(0, 0, 0, 0.08);
}
.tabulator-card-head {
  display: flex;
  align-items: center;
  gap: 2.4rem;
}
.tabulator-card-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--Text-body_0);
}
.tabulator-card-body {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 0;
}
/* 한 줄 = Figma card li: 라벨 13px 좌 / 값 15px 우, 사이 24px, 세로 가운데 */
.tabulator-card-row {
  display: flex;
  align-items: center;
  gap: 2.4rem;
  font-size: 1.5rem;
  line-height: 1.5;
}
.tabulator-card-row dt {
  flex-shrink: 0;
  font-size: 1.3rem;
  line-height: 1.3;
  color: var(--Text-body_1);
}
.tabulator-card-row dd {
  flex: 1;
  margin: 0;
  text-align: right;
  color: var(--Text-body_0);
  word-break: break-all;
  white-space: pre-line;   /* 여러 줄 값을 그대로 보여준다 */
}
/* 라벨을 숨긴 줄은 값이 한 줄을 다 쓰므로 왼쪽 정렬이 자연스럽다 */
.tabulator-card-row.is-no-label dd {
  text-align: left;
  white-space: pre-line;
}
.tabulator-card-empty {
  padding: 4rem 0;
  text-align: center;
  color: var(--Text-body_1);
}
</style>
