<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, createApp, h, type App, type Ref } from 'vue'
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
 * 컬럼/데이터만 넘기면 되고, 아래 기능들은 컴포넌트가 내장으로 처리.
 * - 일괄 선택 체크박스(custom/checkbox 를 셀·헤더에 실제 마운트, 부분선택 상태 포함)
 * - 날짜 셀(VueDatePicker) · 상시 노출 입력 셀 · 버튼 셀 (컬럼의 cellType 으로 지정)
 * - 편집된 셀 dirty 표시, 조건부 행 하이라이트
 * - custom/pagination 을 이용한 페이지 이동(Tabulator 내장 로컬 페이징 제어)
 * - 세로 스크롤 발생 시에만 하단 경계선 표시
 * - 마운트된 Vue 앱(체크박스/달력)의 정리(unmount)
 */
interface Props {
  /** 컬럼 정의. cellType 으로 date/input/button 셀을 쉽게 구성 */
  columns: TabulatorGridColumn[]
  /** 표시할 데이터. 배열을 새로 넘기면 그리드가 갱신 */
  data: any[]
  /** 그리드 높이 */
  height?: string
  /** 행 높이(px) */
  rowHeight?: number
  layout?: TabulatorGridLayout
  /** true 면 맨 앞에 일괄 선택 체크박스 컬럼을 자동으로 추가 */
  selectable?: boolean
  /** 데이터 0건일 때 표시할 문구 */
  placeholder?: string
  resizableColumns?: boolean
  resizableRows?: boolean
  movableColumns?: boolean
  /** 컬럼 헤더 클릭 정렬 허용 여부 (컬럼별로 headerSort 를 따로 줄 수도 있음) */
  headerSort?: boolean
  /** 편집이 커밋된 셀에 cell-dirty 클래스를 붙일지 여부 */
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
  /** 위 props 로 덮지 못하는 Tabulator 옵션을 직접 넘기고 싶을 때 */
  tableOptions?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  height: '220px',
  rowHeight: 48,
  layout: 'fitDataStretch',
  selectable: false,
  placeholder: '데이터가 없습니다',
  resizableColumns: true,
  resizableRows: true,
  movableColumns: true,
  headerSort: false,
  markDirty: true,
  rowClass: undefined,
  dateFormat: 'yyyy-MM-dd',
  datePlaceholder: 'YYYY-MM-DD',
  showPagination: false,
  itemsPerPage: 10,
  itemsPerPageOptions: undefined,
  tableOptions: undefined,
})

const emit = defineEmits<{
  (e: 'update:itemsPerPage', size: number): void
  (e: 'cell-edited', cell: any): void
  (e: 'row-selection-changed', rows: any[]): void
  (e: 'row-click', event: Event, row: any): void
  (e: 'table-built', table: any): void
}>()

const rowHeightPx = computed(() => `${props.rowHeight}px`)

/* ------------------------------------------------------------------ *
 * 인스턴스 / DOM
 * ------------------------------------------------------------------ */
const hostEl = ref<HTMLElement | null>(null)
let table: any = null

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
 * 셀/헤더가 파괴될 때 unmount 가 필요하므로 행(row) 기준으로 추적
 * ------------------------------------------------------------------ */
const rowCheckboxRegistry = new Map<any, { app: App; state: Ref<boolean> }>()
let headerCheckboxApp: { app: App; state: Ref<'checked' | 'unchecked' | 'indeterminate'> } | null = null

function rowCheckboxFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-checkbox-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const state = ref(row.isSelected())

  const app = createApp({
    render: () =>
      h(Checkbox, {
        modelValue: state.value,
        'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
          const next = val === true
          state.value = next
          next ? row.select() : row.deselect()
        },
      }),
  })
  app.mount(container)
  rowCheckboxRegistry.set(row, { app, state })

  return container
}

function headerCheckboxFormatter() {
  const container = document.createElement('div')
  container.classList.add('grid-checkbox-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const state = ref<'checked' | 'unchecked' | 'indeterminate'>('unchecked')

  const app = createApp({
    render: () =>
      h(Checkbox, {
        variant: state.value === 'indeterminate' ? 'minus' : 'default',
        modelValue: state.value !== 'unchecked',
        'onUpdate:modelValue': () => {
          state.value === 'unchecked' ? table?.selectRow() : table?.deselectRow()
        },
      }),
  })
  app.mount(container)
  headerCheckboxApp = { app, state }

  return container
}

/** 행 선택 여부가 바뀔 때마다 모든 체크박스 상태를 동기화 */
function syncSelectionCheckboxes() {
  if (!table) return

  rowCheckboxRegistry.forEach((entry, row) => {
    entry.state.value = row.isSelected()
  })

  if (headerCheckboxApp) {
    const totalCount = table.getRows().length
    const selectedCount = table.getSelectedRows().length
    headerCheckboxApp.state.value =
      selectedCount === 0 ? 'unchecked' : selectedCount === totalCount ? 'checked' : 'indeterminate'
  }
}

function unmountRowCheckbox(row: any) {
  const entry = rowCheckboxRegistry.get(row)
  if (entry) {
    entry.app.unmount()
    rowCheckboxRegistry.delete(row)
  }
}

/* ------------------------------------------------------------------ *
 * 날짜 셀: custom/datepicker 를 셀에 마운트해 항상 달력이 보이도록
 * DatePicker 가 valueType='string' 으로 dateFormat 문자열을 그대로 돌려주므로
 * 셀 값(문자열)과 타입이 어긋나지 않음
 * ------------------------------------------------------------------ */
const dateCellRegistry = new Map<any, App>()

function dateCellFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-date-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const dateValue = ref<string>(cell.getValue() ?? '')

  const app = createApp({
    render: () =>
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
  })
  app.mount(container)
  dateCellRegistry.set(row, app)

  return container
}

function unmountDateCell(row: any) {
  const app = dateCellRegistry.get(row)
  if (app) {
    app.unmount()
    dateCellRegistry.delete(row)
  }
}

/* ------------------------------------------------------------------ *
 * 상시 노출 입력 셀: 편집 모드 진입 없이 셀 안에 항상 텍스트 input 표시
 * ------------------------------------------------------------------ */
function inputCellFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-input-cell')
  // 행 선택/드래그 등 그리드 기본 동작으로 이벤트가 새는 것을 방지
  container.addEventListener('click', (e) => e.stopPropagation())

  const value = ref<string>(cell.getValue() ?? '')

  const app = createApp({
    render: () =>
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
  })
  app.mount(container)
  trackCellApp(row, app)

  return container
}

/* ------------------------------------------------------------------ *
 * 버튼 셀: custom/button 의 Button 컴포넌트를 셀에 실제 마운트
 * (클래스만 복사하지 않고 컴포넌트를 그대로 쓰므로 Button 스펙이 바뀌면 함께 반영됨)
 * 행이 삭제/재구성될 때 unmount 해야 하므로 행 기준으로 추적
 * ------------------------------------------------------------------ */
const buttonCellRegistry = new Map<any, App[]>()

function buttonCellFormatter(col: TabulatorGridColumn) {
  return (cell: any) => {
    const row = cell.getRow()
    const container = document.createElement('div')
    container.classList.add('grid-button-cell')
    container.addEventListener('click', (e) => e.stopPropagation())

    const app = createApp({
      render: () =>
        h(
          Button,
          {
            variant: col.buttonVariant ?? 'tertiary',
            size: col.buttonSize ?? 'sm',
            disabled: col.buttonDisabled?.(cell.getRow().getData()) ?? false,
            onClick: (e: Event) => {
              e.stopPropagation()
              col.onButtonClick?.(cell.getRow().getData(), cell)
            },
          },
          () => col.buttonLabel ?? '버튼',
        ),
    })
    app.mount(container)

    const apps = buttonCellRegistry.get(row) ?? []
    apps.push(app)
    buttonCellRegistry.set(row, apps)

    return container
  }
}

function unmountButtonCells(row: any) {
  const apps = buttonCellRegistry.get(row)
  if (apps) {
    apps.forEach((app) => app.unmount())
    buttonCellRegistry.delete(row)
  }
}

/* ------------------------------------------------------------------ *
 * 셀렉트 셀: custom/select 의 SelectField 를 셀에 마운트
 * ------------------------------------------------------------------ */
const cellAppRegistry = new Map<any, App[]>()

function trackCellApp(row: any, app: App) {
  const apps = cellAppRegistry.get(row) ?? []
  apps.push(app)
  cellAppRegistry.set(row, apps)
}

function unmountCellApps(row: any) {
  const apps = cellAppRegistry.get(row)
  if (apps) {
    apps.forEach((app) => app.unmount())
    cellAppRegistry.delete(row)
  }
}

function selectCellFormatter(col: TabulatorGridColumn) {
  return (cell: any) => {
    const row = cell.getRow()
    const container = document.createElement('div')
    container.classList.add('grid-select-cell')
    container.addEventListener('click', (e) => e.stopPropagation())

    const value = ref(cell.getValue())

    const app = createApp({
      render: () =>
        h(SelectField, {
          modelValue: value.value,
          options: col.selectOptions ?? [],
          size: 'sm',
          'onUpdate:modelValue': (val: string | number) => {
            value.value = val
            cell.setValue(val) // 값 반영 + cellEdited 이벤트 발생
          },
        }),
    })
    app.mount(container)
    trackCellApp(row, app)

    return container
  }
}

/* ------------------------------------------------------------------ *
 * 스위치 / 체크박스 셀: boolean 값 토글 (custom/switch, custom/checkbox)
 * ------------------------------------------------------------------ */
function switchCellFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-switch-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const value = ref(!!cell.getValue())

  const app = createApp({
    render: () =>
      h(Switch, {
        modelValue: value.value,
        'onUpdate:modelValue': (val: boolean) => {
          value.value = val
          cell.setValue(val)
        },
      }),
  })
  app.mount(container)
  trackCellApp(row, app)

  return container
}

function checkboxCellFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-checkbox-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const value = ref(!!cell.getValue())

  const app = createApp({
    render: () =>
      h(Checkbox, {
        modelValue: value.value,
        'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
          const next = val === true
          value.value = next
          cell.setValue(next)
        },
      }),
  })
  app.mount(container)
  trackCellApp(row, app)

  return container
}

/* ------------------------------------------------------------------ *
 * 뱃지 셀: custom/badge 로 상태 값을 표시(읽기 전용)
 * ------------------------------------------------------------------ */
function badgeCellFormatter(col: TabulatorGridColumn) {
  return (cell: any) => {
    const row = cell.getRow()
    const container = document.createElement('div')
    const raw = cell.getValue()
    if (raw === null || raw === undefined || raw === '') return container

    const app = createApp({
      render: () =>
        h(
          Badge,
          {
            color: col.badgeColorMap?.[String(raw)] ?? col.badgeFallbackColor ?? 'grayLighter',
            size: 'md',
          },
          () => String(raw),
        ),
    })
    app.mount(container)
    trackCellApp(row, app)

    return container
  }
}

/* ------------------------------------------------------------------ *
 * 컬럼 빌드: cellType 을 실제 Tabulator formatter 로 변환
 * ------------------------------------------------------------------ */
function buildColumns() {
  const cols = props.columns.map((col) => {
    const { cellType, buttonLabel, buttonVariant, buttonSize, onButtonClick, ...rest } = col

    // formatter 를 직접 넘긴 경우에는 그것을 우선한다
    if (rest.formatter || !cellType) return rest

    if (cellType === 'date') return { ...rest, formatter: dateCellFormatter }
    if (cellType === 'input') return { ...rest, formatter: inputCellFormatter }
    if (cellType === 'select') return { ...rest, formatter: selectCellFormatter(col) }
    if (cellType === 'switch') return { ...rest, hozAlign: rest.hozAlign ?? 'center', formatter: switchCellFormatter }
    if (cellType === 'checkbox') return { ...rest, hozAlign: rest.hozAlign ?? 'center', formatter: checkboxCellFormatter }
    if (cellType === 'badge') return { ...rest, hozAlign: rest.hozAlign ?? 'center', editor: false, formatter: badgeCellFormatter(col) }
    if (cellType === 'button') {
      return { ...rest, headerSort: false, editor: false, formatter: buttonCellFormatter(col) }
    }
    return rest
  })

  if (!props.selectable) return cols

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
 * 마운트
 * ------------------------------------------------------------------ */
onMounted(() => {
  table = new Tabulator(hostEl.value, {
    data: JSON.parse(JSON.stringify(props.data)),
    reactiveData: false,
    layout: props.layout,
    resizableColumns: props.resizableColumns,
    resizableRows: props.resizableRows,
    movableColumns: props.movableColumns,
    selectableRows: props.selectable,
    columnDefaults: { headerSort: props.headerSort },
    tooltip: true,
    height: props.height,
    placeholder: props.placeholder,
    // CSS 로 행 높이를 조절하므로 가상 렌더링 대신 기본 렌더링 사용(행 겹침 방지)
    renderVertical: 'basic',
    columns: buildColumns(),
    ...(props.showPagination
      ? {
          pagination: true,
          paginationMode: 'local',
          paginationSize: pageSize.value,
          paginationSizeSelector: false,
        }
      : {}),
    rowFormatter: (row: any) => {
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
    if (props.markDirty) cell.getElement().classList.add('cell-dirty')
    emit('cell-edited', cell)
  })

  table.on('rowClick', (e: Event, row: any) => emit('row-click', e, row))

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
  })
  table.on('rowDeleted', (row: any) => {
    unmountRowCheckbox(row)
    unmountDateCell(row)
    unmountButtonCells(row)
    unmountCellApps(row)
    syncSelectionCheckboxes()
    totalElements.value = table.getDataCount()
  })
})

onBeforeUnmount(() => {
  table?.destroy()
  table = null
  scrollBorderObserver?.disconnect()
  scrollBorderObserver = null

  rowCheckboxRegistry.forEach((entry) => entry.app.unmount())
  rowCheckboxRegistry.clear()
  headerCheckboxApp?.app.unmount()
  headerCheckboxApp = null

  dateCellRegistry.forEach((app) => app.unmount())
  dateCellRegistry.clear()

  buttonCellRegistry.forEach((apps) => apps.forEach((app) => app.unmount()))
  buttonCellRegistry.clear()

  cellAppRegistry.forEach((apps) => apps.forEach((app) => app.unmount()))
  cellAppRegistry.clear()
})

/* 부모가 data 배열을 새로 넘기면 그리드를 갱신 */
watch(
  () => props.data,
  (next) => {
    table?.setData(JSON.parse(JSON.stringify(next)))
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
  setData: (rows: any[]) => table?.setData(JSON.parse(JSON.stringify(rows))),
  addRow: (rowData: any, top = true) => table?.addRow(rowData, top),
  updateRow: (index: any, rowData: any) => table?.updateRow(index, rowData),
  deleteRow: (index: any) => table?.deleteRow(index),
  deleteSelected: () => table?.getSelectedRows().forEach((r: any) => r.delete()),

  /* 선택 */
  selectAll: () => table?.selectRow(),
  deselectAll: () => table?.deselectRow(),
  selectRow: (index: any) => table?.selectRow(index),

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
  /** cell-dirty 표시가 붙은 셀들의 {row, field, value} 목록 */
  getDirtyCells: () => {
    if (!table) return []
    const result: { row: any; field: string; value: any }[] = []
    table.getRows().forEach((row: any) => {
      row.getCells().forEach((cell: any) => {
        if (cell.getElement()?.classList.contains('cell-dirty')) {
          result.push({ row: row.getData(), field: cell.getField(), value: cell.getValue() })
        }
      })
    })
    return result
  },
  /** 변경된 행(중복 제거) 데이터 목록 */
  getDirtyRows: () => {
    if (!table) return []
    return table
      .getRows()
      .filter((row: any) =>
        row.getCells().some((cell: any) => cell.getElement()?.classList.contains('cell-dirty')),
      )
      .map((row: any) => row.getData())
  },
  /** 저장 완료 후 dirty 표시만 걷어낼 때 */
  clearDirty: () => {
    if (!table) return
    table.getRows().forEach((row: any) => {
      row.getCells().forEach((cell: any) => cell.getElement()?.classList.remove('cell-dirty'))
    })
  },

  /* 유효성 */
  /**
   * 유효성 검사를 통과하지 못한 셀 목록 (없으면 빈 배열).
   *
   * Tabulator 의 table.validate() 는 "현재 셀 값" 기준이라, 편집 중 잘못된 값을 입력해
   * 되돌려진(revert) 셀은 잡아내지 못한다. 반면 화면에는 tabulator-validation-fail 로
   * 실패 표시가 남아 있으므로, 사용자가 실제로 보고 있는 실패 셀도 함께 모아서 돌려준다.
   */
  validate: () => {
    const result: { row: any; field: string; message?: string }[] = []

    const apiResult = table?.validate()
    if (Array.isArray(apiResult)) {
      apiResult.forEach((cell: any) => {
        result.push({ row: cell.getRow?.().getData?.(), field: cell.getField?.() })
      })
    }

    // 화면상 실패 표시가 남아 있는 셀 (table.validate() 가 놓치는 케이스)
    table?.getRows().forEach((row: any) => {
      row.getCells().forEach((cell: any) => {
        if (!cell.getElement()?.classList.contains('tabulator-validation-fail')) return
        const field = cell.getField()
        if (result.some((r) => r.field === field && r.row === row.getData())) return
        result.push({ row: row.getData(), field, message: '입력값이 유효하지 않습니다.' })
      })
    })

    return result
  },
  /** 유효성 실패 표시를 걷어낼 때 */
  clearValidation: () => {
    table?.getRows().forEach((row: any) => {
      row.getCells().forEach((cell: any) =>
        cell.getElement()?.classList.remove('tabulator-validation-fail'),
      )
    })
  },

  /* 기타 */
  setFilter: (...args: any[]) => (table as any)?.setFilter(...args),
  clearFilter: () => table?.clearFilter(true),
  download: (type: 'csv' | 'json' | 'xlsx' = 'csv', fileName = 'data.csv') =>
    table?.download(type, fileName),
  redraw: (force = true) => table?.redraw(force),
})
</script>

<template>
  <div>
    <div ref="hostEl" class="tabulator-host" :style="{ '--row-h': rowHeightPx }" />

    <Pagination
      v-if="showPagination"
      class="mt-[20px]"
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
