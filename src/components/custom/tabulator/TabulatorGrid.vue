<script setup lang="ts">
import {
  ref,
  computed,
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
import { Badge } from '@/components/custom/badge'
import SelectField from '@/components/custom/select/SelectField.vue'
import Input from '@/components/custom/input/Input.vue'
import type { PageSizeOption, TabulatorGridColumn, TabulatorGridLayout } from '.'

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
}

const props = withDefaults(defineProps<Props>(), {
  height: '220px',
  minHeight: '0',
  rowHeight: 48,
  // 시안의 표는 모두 컨테이너 폭을 컬럼 비율로 나눠 갖는다(= fitColumns).
  // 컬럼 이동·폭 조절은 시안 어디에도 없으므로 기본은 꺼둔다.
  layout: 'fitColumns',
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
  movableRows: false,
  connectedTo: undefined,
  receiveMode: 'add',
  keepSource: true,
  tableOptions: undefined,
})

const emit = defineEmits<{
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

/** 한 셀의 표시 상태를 맵 기준으로 다시 칠한다 */
function paintCell(cell: any) {
  const el = cell.getElement?.()
  const field = cell.getField?.()
  const rowData = cell.getRow?.()?.getData?.()
  if (!el || !field || !rowData) return
  el.classList.toggle('cell-dirty', props.markDirty && !!dirtyFields.get(rowData)?.has(field))
  el.classList.toggle('tabulator-validation-fail', !!invalidFields.get(rowData)?.has(field))
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
 * 페이지네이션 상태 (Tabulator 내장 로컬 페이징 + custom/pagination UI)
 * ------------------------------------------------------------------ */
const currentPage = ref(1)
const pageSize = ref(props.itemsPerPage)
const totalElements = ref(props.data.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / pageSize.value)))

function goToPage(page: number) {
  table?.setPage(page)
}

function changePageSize(size: number) {
  pageSize.value = size
  table?.setPageSize(size)
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
function inputCellFormatter(columnKey: string) {
  return (cell: any) => {
    const value = ref<string>(cell.getValue() ?? '')

    return mountCell(cell, columnKey, 'grid-input-cell', () =>
      h(Input, {
        modelValue: value.value,
        size: 'sm',
        'onUpdate:modelValue': (val: string | number) => {
          value.value = String(val)
        },
        // 타이핑 도중이 아니라 편집이 끝났을 때(blur/Enter) 한 번만 커밋한다.
        // 매 키 입력마다 setValue 를 부르면 cellEdited 가 글자 수만큼 발생해
        // dirty 표시가 요동치기 때문. (기존 raw input 의 change 동작과 동일)
        onChange: () => cell.setValue(value.value),
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
    const value = ref(!!cell.getValue())

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
function buildColumn(col: TabulatorGridColumn, columnKey: string): Record<string, any> {
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
  if (cellType === 'input') return { ...rest, formatter: inputCellFormatter(columnKey) }
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
      titleFormatter: headerCheckboxFormatter,
      hozAlign: 'center',
      headerSort: false,
      width: 44,
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
onMounted(() => {
  table = new Tabulator(hostEl.value, {
    data: clone(props.data),
    reactiveData: false,
    layout: props.layout,
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
    ...(props.showPagination
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
    watchVScrollBorder()
    emit('table-built', table)
  })

  table.on('cellEdited', (cell: any) => {
    const field = cell.getField()
    const rowData = cell.getRow().getData()
    addField(dirtyFields, rowData, field)
    // 편집이 커밋됐다는 건 유효성을 통과했다는 뜻
    removeField(invalidFields, rowData, field)
    paintCell(cell)
    emitData()
    emit('cell-edited', cell)
  })

  table.on('validationFailed', (cell: any) => {
    addField(invalidFields, cell.getRow().getData(), cell.getField())
  })

  table.on('rowClick', (e: Event, row: any) => emit('row-click', e, row))
  table.on('rowDblClick', (e: Event, row: any) => emit('row-dbl-click', e, row))

  // 페이지네이션 동기화
  table.on('pageLoaded', (pageno: number) => {
    currentPage.value = pageno
  })
  table.on('dataProcessed', () => {
    totalElements.value = table.getDataCount()
  })

  // 선택 상태 동기화
  table.on('rowSelectionChanged', (_data: any, rows: any[]) => {
    syncSelectionCheckboxes()
    emit('row-selection-changed', rows)
  })
  table.on('rowAdded', () => {
    syncSelectionCheckboxes()
    totalElements.value = table.getDataCount()
    emitData()
  })
  table.on('rowDeleted', () => {
    unmountOrphanRowCells()
    syncSelectionCheckboxes()
    totalElements.value = table.getDataCount()
    emitData()
  })

  // 행 드래그
  table.on('movableRowsReceived', (fromRow: any, toRow: any, fromTable: any) => {
    totalElements.value = table.getDataCount()
    emitData()
    emit('rows-received', fromRow, toRow, fromTable)
  })
  table.on('rowMoved', (row: any) => emit('row-moved', row))
})

/**
 * KeepAlive 로 캐시된 화면(하단 탭)이 숨겨졌다가 다시 활성화될 때, 숨겨져 있던 동안
 * :data 가 바뀌었어도(예: 다른 화면에서 저장하고 목록으로 돌아옴) Tabulator 가 컨테이너
 * 크기를 0으로 측정한 채라 행을 그리지 못하고 있을 수 있다. 다시 보이게 된 시점에
 * redraw(true) 로 강제로 다시 그린다.
 */
onActivated(() => {
  table?.redraw(true)
})

onBeforeUnmount(() => {
  // Tabulator 를 먼저 destroy 하면 td 가 사라져 정리 대상을 못 찾으므로 Vue 트리부터 정리
  unmountAllRowCells()
  unmountHeaderCheckbox()
  dirtyFields.clear()
  invalidFields.clear()

  table?.destroy()
  table = null
  scrollBorderObserver?.disconnect()
  scrollBorderObserver = null
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

    if (dataChanged) applyData(nextData)

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
    table?.setPageSize(next)
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
  getSelectedData: () => table?.getSelectedData() ?? [],
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
   * Tabulator 의 table.validate() 는 "현재 셀 값" 기준이라, 편집 중 잘못된 값을 입력해
   * 되돌려진(revert) 셀은 잡아내지 못한다. 그래서 validationFailed 이벤트로 쌓아둔
   * 실패 이력(invalidFields)도 함께 모아서 돌려준다.
   */
  validate: () => {
    const result: { row: any; field: string; message?: string }[] = []

    const apiResult = table?.validate()
    if (Array.isArray(apiResult)) {
      apiResult.forEach((cell: any) => {
        const rowData = cell.getRow?.().getData?.()
        const field = cell.getField?.()
        if (!field) return
        addField(invalidFields, rowData, field)
        result.push({ row: rowData, field })
      })
    }

    invalidFields.forEach((fields, rowData) => {
      fields.forEach((field) => {
        if (result.some((r) => r.field === field && r.row === rowData)) return
        result.push({ row: rowData, field, message: '입력값이 유효하지 않습니다.' })
      })
    })

    repaintAll()
    return result
  },
  /** 유효성 실패 표시를 걷어낼 때 */
  clearValidation: () => {
    invalidFields.clear()
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
    <div
      ref="hostEl"
      v-bind="hostAttrs"
      class="tabulator-host flex-auto min-h-0"
      :style="{ '--row-h': rowHeightPx }"
    />

    <!-- 시안(메모 검색결과없음)에서는 0건일 때 페이지네이션 바가 통째로 사라진다 -->
    <Pagination
      v-if="showPagination && totalElements > 0"
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
</style>
