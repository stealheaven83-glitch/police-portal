<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Tabulator Grid 샘플</h1>
      </div>

      <div class="text-gray-500 pb-8">
        <a
          href="https://www.tabulator.info/docs/6.x/"
          target="_blank"
          class="text-primary underline underline-offset-4"
        >
          tabulator-tables
        </a>
        (v6.5) 를 이용한 데이터 그리드 예시 페이지입니다. 요청된 기능들의 지원 여부를 아래 섹션별로 확인할 수 있습니다.
      </div>

      <!-- ============ 기능 지원 요약 ============ -->
      <section class="space-y-3 pb-10">
        <h2 class="text-2xl font-semibold">기능 지원 요약</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="border px-3 py-2 w-20">#</th>
                <th class="border px-3 py-2">기능</th>
                <th class="border px-3 py-2 w-24 text-center">지원</th>
                <th class="border px-3 py-2">구현 방식</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in supportMatrix" :key="i">
                <td class="border px-3 py-2 text-center">{{ i + 1 }}</td>
                <td class="border px-3 py-2">{{ row.feature }}</td>
                <td class="border px-3 py-2 text-center">
                  <span
                    :class="{
                      'text-green-600': row.level === 'ok',
                      'text-amber-500': row.level === 'partial',
                      'text-red-500': row.level === 'no',
                    }"
                    >{{ row.badge }}</span
                  >
                </td>
                <td class="border px-3 py-2 text-gray-600">{{ row.how }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 메인 그리드 (다수 기능 데모) ============ -->
      <section class="space-y-4 pt-4">
        <h2 class="text-2xl font-semibold">종합 그리드</h2>
        <div class="text-gray-500">
          반응형 · 컬럼 리사이즈/정렬/숨김 · 일괄 선택 · 셀 인라인 편집 · 유효성 검사 · 변경 셀 표시 ·
          조건부 색상 · 행 하이라이트 · 툴팁 · 행 추가/삭제 기능을 한 그리드에서 확인합니다.
        </div>

        <!-- 툴바: 공용 ButtonGroup에 이 페이지만의 버튼 케이스(variant 조합)를 넘겨 구성 -->
        <ButtonGroup :items="mainToolbarButtons" />

        <!-- 컬럼 숨김 토글 -->
        <div class="flex flex-wrap gap-3 items-center text-sm">
          <span class="text-gray-600">컬럼 표시:</span>
          <label
            v-for="col in toggleableColumns"
            :key="col.field"
            class="inline-flex items-center gap-1"
          >
            <input type="checkbox" v-model="columnVisible[col.field]" @change="toggleColumn(col.field)" />
            {{ col.title }}
          </label>
        </div>

        <!-- 그리드 마운트 지점 -->
        <div ref="mainTableEl" class="tabulator-host main-grid" style="height:500px"/>

        <!-- 페이지네이션: Tabulator 내장 로컬 페이징을 custom/pagination 컴포넌트로 제어 -->
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :itemsPerPage="itemsPerPage"
          :totalElements="totalElements"
          @update:page="goToPage"
          @update:itemsPerPage="changePageSize"
        />

        <p class="text-xs text-gray-400">
          · 셀을 클릭하면 셀 안에서 바로 편집됩니다(별도 폼 없음). · 평가점수가 60 미만인 행은 붉게 하이라이트됩니다.
          · 편집된 셀은 노란색으로 표시되고, 유효성 실패 셀은 붉은 테두리로 표시됩니다. · 전체 컬럼 너비가 화면보다
          넓어지면 컬럼을 숨기지 않고 가로 스크롤이 생깁니다.
        </p>
      </section>

      <!-- ============ 버튼 컴포넌트 케이스 그리드 ============ -->
      <section class="space-y-4 pt-12">
        <h2 class="text-2xl font-semibold">버튼 컴포넌트 케이스 그리드</h2>
        <div class="text-gray-500">
          공용 <code>Button</code> 컴포넌트의 variant × size 조합(각 케이스)을 그리드 셀에 실제 버튼으로
          렌더링해 한눈에 비교합니다.
        </div>
        <div ref="buttonCaseTableEl" class="tabulator-host" />
      </section>

      <!-- ============ 그리드 간 드래그 복사 ============ -->
      <section class="space-y-4 pt-12">
        <h2 class="text-2xl font-semibold">그리드 간 드래그 복사 (행 단위)</h2>
        <div class="text-gray-500">
          왼쪽 행의 <b>핸들(⣿)</b> 을 잡아 오른쪽 그리드로 끌어다 놓으면 항목이 복사됩니다
          (<code>movableRows</code> + <code>movableRowsConnectedTables</code>). 원본은 유지됩니다.
          <br />
          <span class="text-amber-600">
            ※ "셀 범위"를 드래그해 다른 그리드로 옮기는 것은 Tabulator 네이티브 기능이 아니며, 행 단위 이동 또는
            범위 선택 후 클립보드(복사/붙여넣기) 방식으로 대체합니다.
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium mb-1">원본 그리드</div>
            <div ref="leftTableEl" class="tabulator-host" />
          </div>
          <div>
            <div class="text-sm font-medium mb-1">대상 그리드 (여기로 드롭)</div>
            <div ref="rightTableEl" id="right-connected-table" class="tabulator-host" />
          </div>
        </div>
      </section>

      <!-- ============ 셀 병합 (제약) ============ -->
      <section class="space-y-4 pt-12 pb-6">
        <h2 class="text-2xl font-semibold">셀 병합 <span class="text-base text-red-500">(제약 있음)</span></h2>
        <div class="text-gray-500">
          Tabulator 6.x 는 <b>데이터 셀의 rowspan/colspan(셀 병합)을 네이티브로 지원하지 않습니다</b>
          (GitHub issue #3725, #1576). 대신 <b>헤더 그룹핑</b>(컬럼 중첩)은 지원하며, 시각적 병합은 formatter/CSS 로만
          제한적으로 흉내 낼 수 있습니다. 아래는 헤더 그룹핑 예시입니다.
        </div>
        <div ref="groupTableEl" class="tabulator-host" />
      </section>

      <!-- ============ 빈 데이터(No Data) 상태 ============ -->
      <section class="space-y-4 pt-12 pb-6">
        <h2 class="text-2xl font-semibold">빈 데이터 상태</h2>
        <div class="text-gray-500">
          데이터가 0건일 때 <code>placeholder</code> 옵션으로 표시되는 안내 문구입니다.
        </div>
        <div ref="emptyTableEl" class="tabulator-host" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, createApp, h, type App, type Ref } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '@/assets/css/tabulator-theme.css'
import { buttonVariants, ButtonGroup, type ButtonCaseItem, type ButtonVariants } from '@/components/custom/button'
import { Checkbox as CustomCheckbox } from '@/components/custom/checkbox'
import { Pagination } from '@/components/custom/pagination'
import { cn } from '@/lib/utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ko } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'
import '@/components/custom/date-picker/DatePicker.css'

/* ------------------------------------------------------------------ *
 * 기능 지원 요약 매트릭스
 * ------------------------------------------------------------------ */
const supportMatrix = [
  { feature: 'PC Web 및 모바일 지원', level: 'ok', badge: '지원', how: 'responsiveLayout(collapse/hide) + 터치 지원' },
  { feature: '셀 선택 → 드래그로 다른 grid 복사', level: 'partial', badge: '부분', how: '행 단위: movableRowsConnectedTables / 셀 범위: 클립보드 복사·붙여넣기' },
  { feature: '컬럼 너비 조절(고정/가변/전체)', level: 'ok', badge: '지원', how: 'resizableColumns, width/min/max/widthGrow, layout' },
  { feature: '컬럼 자동 맞춤', level: 'ok', badge: '지원', how: 'layout: fitColumns / fitData / fitDataStretch' },
  { feature: '행 높이 조정', level: 'ok', badge: '지원', how: 'rowHeight / CSS / resizableRows' },
  { feature: '항목 정렬(행 순서 이동)', level: 'ok', badge: '지원', how: 'movableRows(드래그 재정렬)' },
  { feature: '일괄 선택(해제)', level: 'ok', badge: '지원', how: 'selectableRows + 헤더 체크박스' },
  { feature: '컬럼 정렬', level: 'no', badge: '미지원', how: 'headerSort: false 로 비활성화(의도적으로 제외)' },
  { feature: '컬럼 숨김', level: 'ok', badge: '지원', how: 'toggleColumn / hideColumn / showColumn' },
  { feature: '셀 데이터 직접 수정(인라인)', level: 'ok', badge: '지원', how: 'editor(input/number/list...) 셀 내부 편집' },
  { feature: '행 추가 및 삭제', level: 'ok', badge: '지원', how: 'addRow / row.delete API' },
  { feature: '유효성 검사', level: 'ok', badge: '지원', how: 'validator(required/min/max/regex/custom)' },
  { feature: '변경 데이터 표시', level: 'ok', badge: '지원', how: 'cellEdited 이벤트 + dirty 셀 클래스' },
  { feature: '조건부 색상 처리', level: 'ok', badge: '지원', how: 'formatter / 셀 style 콜백' },
  { feature: '행 하이라이트', level: 'ok', badge: '지원', how: 'rowFormatter(행 클래스/스타일)' },
  { feature: '셀 병합', level: 'no', badge: '미지원', how: '데이터 셀 rowspan/colspan 네이티브 없음(헤더 그룹핑만 지원)' },
  { feature: '툴팁 기능', level: 'ok', badge: '지원', how: 'tooltip(컬럼/셀, 문자열 또는 콜백)' },
] as const

/* ------------------------------------------------------------------ *
 * 더미 데이터
 * ------------------------------------------------------------------ */
type Employee = {
  id: number
  name: string
  dept: string
  position: string
  salary: number
  score: number
  joinDate: string
  active: boolean
  memo: string
}

const initialData: Employee[] = [
  { id: 1, name: '김철수', dept: '개발', position: '팀장', salary: 8200, score: 92, joinDate: '2016-03-02', active: true, memo: '' },
  { id: 2, name: '이영희', dept: '디자인', position: '선임', salary: 6100, score: 78, joinDate: '2019-07-15', active: true, memo: '' },
  { id: 3, name: '박민준', dept: '개발', position: '주임', salary: 4800, score: 55, joinDate: '2022-01-10', active: true, memo: '' },
  { id: 4, name: '최지우', dept: '기획', position: '책임', salary: 7000, score: 84, joinDate: '2018-11-20', active: false, memo: '' },
  { id: 5, name: '정해인', dept: '개발', position: '사원', salary: 4200, score: 48, joinDate: '2023-05-02', active: true, memo: '' },
  { id: 6, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 7, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 8, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 9, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 10, name: '김철수', dept: '개발', position: '팀장', salary: 8200, score: 92, joinDate: '2016-03-02', active: true, memo: '' },
  { id: 12, name: '이영희', dept: '디자인', position: '선임', salary: 6100, score: 78, joinDate: '2019-07-15', active: true, memo: '' },
  { id: 13, name: '박민준', dept: '개발', position: '주임', salary: 4800, score: 55, joinDate: '2022-01-10', active: true, memo: '' },
  { id: 14, name: '최지우', dept: '기획', position: '책임', salary: 7000, score: 84, joinDate: '2018-11-20', active: false, memo: '' },
  { id: 15, name: '정해인', dept: '개발', position: '사원', salary: 4200, score: 48, joinDate: '2023-05-02', active: true, memo: '' },
  { id: 16, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 17, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 18, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
  { id: 19, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, memo: '' },
]

const deptValues = ['개발', '디자인', '기획', '마케팅', '영업']

/* ------------------------------------------------------------------ *
 * 반응형 상태
 * ------------------------------------------------------------------ */
const layoutMode = ref<'fitColumns' | 'fitData' | 'fitDataStretch'>('fitDataStretch')
const rowHeight = ref(48)
const rowHeightPx = computed(() => `${rowHeight.value}px`)

const toggleableColumns = [
  { field: 'dept', title: '부서' },
  { field: 'position', title: '직급' },
  { field: 'salary', title: '연봉' },
  { field: 'score', title: '평가' },
  { field: 'joinDate', title: '입사일' },
]
const columnVisible = reactive<Record<string, boolean>>({
  dept: true,
  position: true,
  salary: true,
  score: true,
  joinDate: true,
})

/* ------------------------------------------------------------------ *
 * 페이지네이션 (Tabulator 내장 로컬 페이징 + custom/pagination UI)
 * ------------------------------------------------------------------ */
const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalElements = ref(initialData.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / itemsPerPage.value)))

function goToPage(page: number) {
  mainTable?.setPage(page)
}

function changePageSize(size: number) {
  itemsPerPage.value = size
  mainTable?.setPageSize(size)
}

/* ------------------------------------------------------------------ *
 * Tabulator 인스턴스 및 DOM refs
 * ------------------------------------------------------------------ */
const mainTableEl = ref<HTMLElement | null>(null)
const buttonCaseTableEl = ref<HTMLElement | null>(null)
const leftTableEl = ref<HTMLElement | null>(null)
const rightTableEl = ref<HTMLElement | null>(null)
const groupTableEl = ref<HTMLElement | null>(null)
const emptyTableEl = ref<HTMLElement | null>(null)

let mainTable: any = null
let buttonCaseTable: any = null
let leftTable: any = null
let rightTable: any = null
let groupTable: any = null
let emptyTable: any = null

/* ------------------------------------------------------------------ *
 * 세로 스크롤 여부에 따른 하단 경계선(.tabulator.has-vscroll) 토글
 * - tabulator-tableholder 의 scrollHeight 가 clientHeight 를 넘을 때만 표시
 * - 행 높이 슬라이더, 행 추가/삭제, 컬럼 숨김 등으로 콘텐츠 높이가 바뀌어도
 *   ResizeObserver 가 감지해 자동으로 갱신됨
 * ------------------------------------------------------------------ */
const scrollBorderObservers: ResizeObserver[] = []

function watchVScrollBorder(hostEl: HTMLElement | null) {
  if (!hostEl) return
  // Tabulator 는 래퍼를 새로 만들지 않고 host 엘리먼트 자체에 'tabulator' 클래스를 붙인다
  const root = hostEl
  const holder = hostEl.querySelector('.tabulator-tableholder') as HTMLElement | null
  const content = hostEl.querySelector('.tabulator-table') as HTMLElement | null
  if (!holder || !content) return

  const check = () => {
    root.classList.toggle('has-vscroll', holder.scrollHeight > holder.clientHeight + 1)
  }
  check()

  const ro = new ResizeObserver(check)
  ro.observe(holder)
  ro.observe(content)
  scrollBorderObservers.push(ro)
}

/* 다음 추가될 행의 id */
let nextId = initialData.length + 1

/* ------------------------------------------------------------------ *
 * 일괄 선택 체크박스: custom/checkbox(Checkbox.vue)를 셀/헤더에 마운트
 * - Checkbox.vue 는 상태(선택/해제/부분선택)를 갖는 상호작용 컴포넌트라
 *   단순 클래스 복사가 아니라 createApp 으로 실제 마운트해 Tabulator 의
 *   행 선택 상태와 양방향으로 동기화한다.
 * - 셀/헤더가 파괴될 때 app.unmount() 가 필요하므로 행(row) 기준으로 추적한다.
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
      h(CustomCheckbox, {
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
      h(CustomCheckbox, {
        variant: state.value === 'indeterminate' ? 'minus' : 'default',
        modelValue: state.value !== 'unchecked',
        'onUpdate:modelValue': () => {
          state.value === 'unchecked' ? mainTable?.selectRow() : mainTable?.deselectRow()
        },
      }),
  })
  app.mount(container)
  headerCheckboxApp = { app, state }

  return container
}

/* 행 선택 여부가 바뀔 때마다(선택/해제/추가/삭제 등) 모든 체크박스 상태를 동기화 */
function syncSelectionCheckboxes() {
  if (!mainTable) return

  rowCheckboxRegistry.forEach((entry, row) => {
    entry.state.value = row.isSelected()
  })

  if (headerCheckboxApp) {
    const totalCount = mainTable.getRows().length
    const selectedCount = mainTable.getSelectedRows().length
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
 * 입사일 셀: custom/date-picker 와 동일한 VueDatePicker 를 셀에 직접 마운트
 * - '비고' 컬럼(memoInputFormatter)처럼 클릭해서 편집 모드로 들어가는 대신,
 *   셀에 항상 달력 아이콘 + 선택된 날짜 텍스트가 보이는 형태로 구성한다.
 * - 체크박스와 마찬가지로 상호작용 컴포넌트를 마운트하므로 행(row) 기준으로
 *   추적해 행이 삭제/재구성될 때 app.unmount() 로 정리한다.
 * ------------------------------------------------------------------ */
const dateCellRegistry = new Map<any, App>()

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

function toIsoDate(date: Date | null): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateCellFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-date-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const dateValue = ref<Date | null>(toDate(cell.getValue()))

  const app = createApp({
    render: () =>
      h(
        VueDatePicker,
        {
          modelValue: dateValue.value,
          'onUpdate:modelValue': (val: Date | null) => {
            dateValue.value = val
            cell.setValue(toIsoDate(val)) // 값 반영 + cellEdited 이벤트 발생
          },
          teleport: true,
          timeConfig: { enableTimePicker: false },
          formats: { input: (date: Date) => toIsoDate(date) },
          locale: ko,
          autoApply: true,
          clearable: false,
        },
        {
          'input-icon': () => h('img', { src: '../../../../public/portal/asset/images/icon/ico_calendar.svg', alt: '달력' }),
        },
      ),
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
 * 메인 그리드 컬럼 정의
 * ------------------------------------------------------------------ */
function buildMainColumns() {
  return [
    // 일괄 선택 체크박스 (헤더 체크박스로 전체 선택/해제) — custom/checkbox 컴포넌트 사용
    {
      formatter: rowCheckboxFormatter,
      titleFormatter: headerCheckboxFormatter,
      hozAlign: 'center',
      headerSort: false,
      width: 44,
      frozen: true,
      responsive: 0,
    },
    { title: '사번', field: 'id', width: 70, hozAlign: 'center', editor: false, responsive: 0 },
    {
      title: '이름',
      field: 'name',
      minWidth: 100,
      editor: 'input',
      validator: ['required', 'string'],
      tooltip: true,
      responsive: 0,
    },
    {
      title: '부서',
      field: 'dept',
      minWidth: 100,
      editor: 'list',
      editorParams: { values: deptValues },
      responsive: 2,
    },
    { title: '직급', field: 'position', minWidth: 90, editor: 'input', responsive: 3 },
    {
      title: '연봉(만원)',
      field: 'salary',
      minWidth: 110,
      hozAlign: 'right',
      editor: 'number',
      validator: ['required', 'min:0', 'max:100000'],
      // 조건부 색상: 7000 이상은 초록, 5000 미만은 회색
      formatter: (cell: any) => {
        const v = Number(cell.getValue() ?? 0)
        const el = cell.getElement()
        el.style.fontWeight = v >= 7000 ? '600' : ''
        return v.toLocaleString()
      },
      responsive: 4,
    },
    {
      title: '평가',
      field: 'score',
      minWidth: 90,
      hozAlign: 'center',
      editor: 'number',
      validator: ['required', 'min:0', 'max:100'],
      // 조건부 배경색: 점수 구간별 셀 배경
      formatter: (cell: any) => {
        const v = Number(cell.getValue() ?? 0)
        const el = cell.getElement()
        return String(v)
      },
      responsive: 5,
    },
    {
      title: '입사일',
      field: 'joinDate',
      width: 160, // 달력 아이콘 + 날짜 텍스트가 항상 딱 맞게 보이도록 고정 너비
      hozAlign: 'center',
      // 클릭 시 편집모드로 들어가는 대신, 셀에 항상 달력 컴포넌트를 표시
      formatter: dateCellFormatter,
      // 툴팁 콜백 예시
      tooltip: (_e: any, cell: any) => `입사일: ${cell.getValue()}`,
      responsive: 6,
    },
    {
      title: '재직',
      field: 'active',
      width: 70,
      hozAlign: 'center',
      formatter: 'tickCross',
      editor: 'tickCross',
      responsive: 1,
    },
    {
      title: '비고',
      field: 'memo',
      minWidth: 80,
      hozAlign: 'center',
      // editor 대신 formatter 에서 직접 <input> 을 그려서, 클릭 없이 항상 입력창이 보이도록 함
      formatter: memoInputFormatter,
      responsive: 7,
    },
    // 버튼 컬럼: Button.vue(tertiary)와 동일한 클래스를 적용한 실제 <button> 삽입
    {
      title: '관리',
      hozAlign: 'center',
      headerSort: false,
      editor: false,
      formatter: detailButtonFormatter,
      width: 120,
    },
  ]
}

/* '관리' 컬럼용: Button.vue 가 만드는 것과 동일한 클래스 조합(cva)을 그대로 사용해
 * 진짜 버튼 엘리먼트를 그려 넣는다. (컴포넌트를 마운트하지 않고 클래스만 재사용) */
function detailButtonFormatter(cell: any) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = cn(buttonVariants({ variant: 'tertiary' }))
  btn.textContent = '상세보기'

  // 버튼 클릭이 행 선택 등 그리드 기본 동작으로 전파되지 않도록 차단
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const data = cell.getRow().getData()
    console.log('상세보기 클릭:', data)
  })

  return btn
}

/* '비고' 컬럼용: 편집 모드 진입 없이 셀 안에 항상 텍스트 input 을 표시 */
function memoInputFormatter(cell: any) {
  const input = document.createElement('input')
  input.type = 'text'
  input.classList.add('input-grid')
  input.value = cell.getValue() ?? ''
  input.style.width = '100%'
  input.style.height = '100%'
  input.style.boxSizing = 'border-box'
  input.style.background = 'transparent'
  input.style.textAlign = 'center'

  // 그리드의 행 선택/드래그 등 다른 클릭 핸들러로 이벤트가 새는 것을 방지
  input.addEventListener('click', (e) => e.stopPropagation())
  input.addEventListener('change', () => {
    cell.setValue(input.value) // 값 반영 + cellEdited 이벤트 발생
  })

  return input
}

/* 편집된(변경된) 셀에 dirty 클래스를 부여 */
function markDirty(cell: any) {
  cell.getElement().classList.add('cell-dirty')
}

/* 저장된 dirty 표시 초기화 + 데이터 리셋 */
function resetChanges() {
  mainTable?.setData(JSON.parse(JSON.stringify(initialData)))
}

/* ------------------------------------------------------------------ *
 * 툴바 액션
 * ------------------------------------------------------------------ */
function addRow() {
  mainTable?.addRow(
    {
      id: nextId++,
      name: '신규사원',
      dept: '개발',
      position: '사원',
      salary: 4000,
      score: 70,
      joinDate: '2026-07-14',
      active: true,
      memo: '',
    },
    true, // 맨 위에 추가
  )
}

function deleteSelected() {
  mainTable?.getSelectedRows().forEach((r: any) => r.delete())
}

function selectAll() {
  mainTable?.selectRow()
}

function deselectAll() {
  mainTable?.deselectRow()
}

function applyLayout() {
  if (!mainTable) return
  mainTable.options.layout = layoutMode.value
  mainTable.redraw(true)
}

function setLayout(mode: typeof layoutMode.value) {
  layoutMode.value = mode
  applyLayout()
}

function toggleColumn(field: string) {
  if (!mainTable) return
  columnVisible[field] ? mainTable.showColumn(field) : mainTable.hideColumn(field)
}

function resetColumns() {
  toggleableColumns.forEach((col) => {
    columnVisible[col.field] = true
    toggleColumn(col.field)
  })
}

/* ------------------------------------------------------------------ *
 * 버튼 컴포넌트 케이스 그리드
 * - variant × size 조합(케이스) 마다 실제 <button>(buttonVariants 클래스)을
 *   셀에 그려 넣어, 케이스별 렌더링 결과를 그리드로 한눈에 비교한다.
 * ------------------------------------------------------------------ */
const buttonCaseVariants: NonNullable<ButtonVariants['variant']>[] = [
  'default',
  'primary',
  'secondary',
  'tertiary',
  'tertiary2',
  'destructive',
  'outline',
  'ghost',
  'link',
  'text',
]
const buttonCaseSizes: NonNullable<ButtonVariants['size']>[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'default']

function buttonCaseFormatter(size: NonNullable<ButtonVariants['size']>) {
  return (cell: any) => {
    const variant = cell.getRow().getData().variant as NonNullable<ButtonVariants['variant']>
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = cn(buttonVariants({ variant, size }))
    btn.textContent = '버튼'
    // 케이스 미리보기 용도이므로 클릭이 행 선택 등으로 전파되지 않도록 차단
    btn.addEventListener('click', (e) => e.stopPropagation())
    return btn
  }
}

function buildButtonCaseColumns() {
  return [
    { title: 'variant', field: 'variant', width: 110, hozAlign: 'center', headerSort: false, frozen: true },
    ...buttonCaseSizes.map((size) => ({
      title: `size: ${size}`,
      field: `size_${size}`,
      hozAlign: 'center',
      headerSort: false,
      formatter: buttonCaseFormatter(size),
    })),
  ]
}

/* ------------------------------------------------------------------ *
 * 종합 그리드 툴바에 쓸 버튼 케이스
 * - 공용 ButtonGroup에 이 배열만 넘기면 되고, 다른 페이지는 각자 다른
 *   조합(variant/size/액션)의 배열을 만들어 쓰면 된다.
 * ------------------------------------------------------------------ */
const mainToolbarButtons: ButtonCaseItem[] = [
  { key: 'add-row', label: '행 추가', variant: 'default', size: 'sm', onClick: addRow },
  { key: 'select-all', label: '전체 선택', variant: 'primary', size: 'sm', onClick: selectAll },
  { key: 'deselect-all', label: '선택 해제', variant: 'secondary', size: 'sm', onClick: deselectAll },
  { key: 'delete-selected', label: '선택 삭제', variant: 'destructive', size: 'sm', onClick: deleteSelected },
  { key: 'reset-changes', label: '변경사항 초기화', variant: 'tertiary2', size: 'sm', onClick: resetChanges },
  { key: 'reset-columns', label: '컬럼 초기화', variant: 'text', size: 'sm', onClick: resetColumns },
  { key: 'layout-fit-columns', label: '컬럼 맞춤', variant: 'outline', size: 'sm', onClick: () => setLayout('fitColumns') },
  { key: 'layout-fit-data', label: '데이터 맞춤', variant: 'ghost', size: 'sm', onClick: () => setLayout('fitData') },
  { key: 'layout-fit-data-stretch', label: '데이터 확장', variant: 'link', size: 'sm', onClick: () => setLayout('fitDataStretch') },
]

/* ------------------------------------------------------------------ *
 * 마운트: 그리드 6개 생성
 * ------------------------------------------------------------------ */
onMounted(() => {
  /* 1) 종합 그리드 */
  mainTable = new Tabulator(mainTableEl.value, {
    data: JSON.parse(JSON.stringify(initialData)),
    reactiveData: false,
    layout: layoutMode.value, // 'fitDataStretch': 컬럼 고유 너비 유지 + 빈 공간은 채워서 초기엔 100% 꽉 채우고, 넘치면 가로 스크롤
    // 컬럼을 숨기는 대신(반응형 접힘) 항상 모든 컬럼을 유지하고, 넘치는 너비는 가로 스크롤로 처리
    resizableColumns: true, // 컬럼 너비 드래그 조절
    resizableRows: true, // 행 높이 드래그 조절
    movableColumns: true, // 컬럼 순서 이동
    selectableRows: true, // 행 선택(일괄 선택)
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    tooltip: true, // 기본 셀 툴팁
    height: '220px',
    placeholder: '데이터가 없습니다', // 데이터 0건일 때 표시할 문구
    // 페이지네이션: 내장 nav UI는 숨기고(.tabulator-footer) custom/pagination 컴포넌트로 페이지 이동을 제어
    pagination: true,
    paginationMode: 'local',
    paginationSize: itemsPerPage.value,
    paginationSizeSelector: false,
    // CSS 로 행 높이를 조절하므로 가상 렌더링 대신 기본 렌더링 사용(행 겹침 방지)
    renderVertical: 'basic',
    columns: buildMainColumns(),
    // 행 하이라이트: 평가점수 60 미만 행에 클래스 부여
    rowFormatter: (row: any) => {
      const data = row.getData()
      const el = row.getElement()
      el.classList.toggle('row-warn', Number(data.score) < 60)
    },
  })

  // 변경 데이터 표시: 편집이 커밋되면 해당 셀을 dirty 로 마킹
  mainTable.on('cellEdited', (cell: any) => {
    markDirty(cell)
  })
  mainTable.on('tableBuilt', () => watchVScrollBorder(mainTableEl.value))

  // 페이지네이션 동기화: 페이지 이동/데이터 변경 시 custom/pagination 컴포넌트에 표시할 상태 갱신
  mainTable.on('pageLoaded', (pageno: number) => {
    currentPage.value = pageno
  })
  mainTable.on('dataProcessed', () => {
    totalElements.value = mainTable.getDataCount()
  })

  // 선택 상태 동기화: 행 체크박스 클릭/selectAll/deselectAll 등으로 선택이 바뀔 때마다
  // 모든 행 체크박스 + 헤더 체크박스(indeterminate 포함)를 다시 계산
  mainTable.on('rowSelectionChanged', () => {
    syncSelectionCheckboxes()
  })
  // 행 추가 시 헤더 체크박스의 전체 개수 기준이 바뀌므로 함께 재계산
  mainTable.on('rowAdded', () => {
    syncSelectionCheckboxes()
    totalElements.value = mainTable.getDataCount()
  })
  // 행 삭제 시 해당 행에 마운트된 체크박스/날짜 Vue 앱을 정리(unmount)
  mainTable.on('rowDeleted', (row: any) => {
    unmountRowCheckbox(row)
    unmountDateCell(row)
    syncSelectionCheckboxes()
    totalElements.value = mainTable.getDataCount()
  })

  /* 2) 버튼 컴포넌트 케이스 그리드 (variant × size) */
  buttonCaseTable = new Tabulator(buttonCaseTableEl.value, {
    data: buttonCaseVariants.map((variant) => ({ variant })),
    layout: 'fitDataFill',
    height: 'auto',
    columnDefaults: { headerSort: false },
    columns: buildButtonCaseColumns(),
  })
  buttonCaseTable.on('tableBuilt', () => watchVScrollBorder(buttonCaseTableEl.value))

  /* 3) & 4) 그리드 간 드래그 복사 (원본 → 대상) */
  const connectColumns = [
    { rowHandle: true, formatter: 'handle', headerSort: false, width: 40, frozen: true },
    { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
    { title: '이름', field: 'name', minWidth: 100 },
    { title: '부서', field: 'dept', minWidth: 100 },
    { title: '직급', field: 'position', minWidth: 90 },
  ]

  leftTable = new Tabulator(leftTableEl.value, {
    data: JSON.parse(JSON.stringify(initialData)),
    layout: 'fitColumns',
    height: '300px',
    movableRows: true,
    movableRowsConnectedTables: '#right-connected-table',
    movableRowsReceiver: 'add',
    movableRowsSender: false, // 원본 유지(복사)
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    columns: connectColumns,
  })
  leftTable.on('tableBuilt', () => watchVScrollBorder(leftTableEl.value))

  rightTable = new Tabulator(rightTableEl.value, {
    data: [],
    layout: 'fitColumns',
    height: '300px',
    movableRows: true,
    placeholder: '왼쪽 그리드에서 행을 드래그해 놓으세요',
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    columns: connectColumns,
  })
  rightTable.on('tableBuilt', () => watchVScrollBorder(rightTableEl.value))

  /* 5) 헤더 그룹핑(셀 병합 대체) 그리드 */
  groupTable = new Tabulator(groupTableEl.value, {
    data: JSON.parse(JSON.stringify(initialData)),
    layout: 'fitColumns',
    height: '260px',
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    columns: [
      { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
      {
        title: '인적사항', // 헤더 그룹(병합된 상위 헤더)
        columns: [
          { title: '이름', field: 'name', minWidth: 100 },
          { title: '부서', field: 'dept', minWidth: 100 },
          { title: '직급', field: 'position', minWidth: 90 },
        ],
      },
      {
        title: '평가정보',
        columns: [
          { title: '연봉(만원)', field: 'salary', hozAlign: 'right', minWidth: 110 },
          { title: '평가', field: 'score', hozAlign: 'center', minWidth: 80 },
        ],
      },
    ],
  })
  groupTable.on('tableBuilt', () => watchVScrollBorder(groupTableEl.value))

  /* 6) 빈 데이터(No Data) 상태 그리드 */
  emptyTable = new Tabulator(emptyTableEl.value, {
    data: [],
    layout: 'fitColumns',
    height: '200px',
    placeholder: '데이터가 없습니다',
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    columns: [
      { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
      { title: '이름', field: 'name', minWidth: 100 },
      { title: '부서', field: 'dept', minWidth: 100 },
      { title: '직급', field: 'position', minWidth: 90 },
    ],
  })
  emptyTable.on('tableBuilt', () => watchVScrollBorder(emptyTableEl.value))
})

onBeforeUnmount(() => {
  mainTable?.destroy()
  buttonCaseTable?.destroy()
  leftTable?.destroy()
  rightTable?.destroy()
  groupTable?.destroy()
  emptyTable?.destroy()
  scrollBorderObservers.forEach((ro) => ro.disconnect())

  rowCheckboxRegistry.forEach((entry) => entry.app.unmount())
  rowCheckboxRegistry.clear()
  headerCheckboxApp?.app.unmount()
  headerCheckboxApp = null

  dateCellRegistry.forEach((app) => app.unmount())
  dateCellRegistry.clear()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: background-color 0.15s ease;
}
.btn:hover {
  background-color: #f9fafb;
}

/* 행 높이를 CSS 변수로 제어 (슬라이더 반응) — 종합 그리드에만 적용 */
.main-grid {
  --row-h: v-bind(rowHeightPx);
}
</style>
