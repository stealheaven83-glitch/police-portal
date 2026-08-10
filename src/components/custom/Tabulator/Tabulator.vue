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
        />

        <p class="text-xs text-gray-400">
          · 셀을 클릭하면 셀 안에서 바로 편집됩니다(별도 폼 없음). · 평가점수가 60 미만인 행은 붉게 하이라이트됩니다.
          · 편집된 셀은 노란색으로 표시되고, 유효성 실패 셀은 붉은 테두리로 표시됩니다. · 화면 폭을 줄이면 우선순위가
          낮은 컬럼이 접힙니다(반응형).
        </p>
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
import { Button as CustomBtn, buttonVariants } from '@/components/custom/button'
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
const layoutMode = ref<'fitColumns' | 'fitData' | 'fitDataStretch'>('fitColumns')
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

/* ------------------------------------------------------------------ *
 * Tabulator 인스턴스 및 DOM refs
 * ------------------------------------------------------------------ */
const mainTableEl = ref<HTMLElement | null>(null)
const leftTableEl = ref<HTMLElement | null>(null)
const rightTableEl = ref<HTMLElement | null>(null)
const groupTableEl = ref<HTMLElement | null>(null)
const emptyTableEl = ref<HTMLElement | null>(null)

let mainTable: any = null
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
      minWidth: 160,
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
      minWidth: 140,
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

function toggleColumn(field: string) {
  if (!mainTable) return
  columnVisible[field] ? mainTable.showColumn(field) : mainTable.hideColumn(field)
}

/* ------------------------------------------------------------------ *
 * 마운트: 그리드 4개 생성
 * ------------------------------------------------------------------ */
onMounted(() => {
  /* 1) 종합 그리드 */
  mainTable = new Tabulator(mainTableEl.value, {
    data: JSON.parse(JSON.stringify(initialData)),
    reactiveData: false,
    layout: 'fitColumns',
    responsiveLayout: 'collapse', // 모바일 대응: 폭이 좁으면 컬럼 접기
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

  /* 2) & 3) 그리드 간 드래그 복사 (원본 → 대상) */
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

  /* 4) 헤더 그룹핑(셀 병합 대체) 그리드 */
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

  /* 5) 빈 데이터(No Data) 상태 그리드 */
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

/* 그리드 배경색 (종합 그리드 한정) */
:deep(.tabulator){
  background:#fff;
  border:0;
}
:deep(.main-grid.tabulator) {
  background-color: #fff;
  border:0;
}
/* 내장 페이지네이션 nav UI는 숨기고 custom/pagination 컴포넌트로 대체 */
:deep(.main-grid .tabulator-footer) {
  display: none;
}
/* tabulator-tableholder 에 세로 스크롤이 생길 때만 하단 경계선 표시 */
:deep(.tabulator) {
  border-bottom: 1px solid transparent;
}
:deep(.tabulator.has-vscroll) {
  border-bottom-color: var(--Border_gray03);
}
:deep(.tabulator .tabulator-header){
  background:none;
  border-top:1px solid

}
:deep(.tabulator .tabulator-header .tabulator-col) {

  min-height:39px;
  box-sizing: border-box;
  font-size: 15px;
  text-align: center;
  color:var(--Text-body_1); 
  border-right:0;
  border-top:none;
  background-color: #fff;
}
:deep(.tabulator .tabulator-header .tabulator-col .tabulator-col-content){
  min-height:39px;
  padding:0;
}
:deep(.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title){
  font-size: 15px;
  min-height: 39px;
  align-content: center;
}

:deep(.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title .grid-checkbox-cell label){
  justify-content: center;
}
:deep(.tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left){
  border-left:0;
  border-right:1px solid var(--Border-grid-body);
}
:deep(.tabulator-row .tabulator-cell){
  border-right:1px solid var(--Border-grid-body);
  border-bottom:1px solid  var(--Border-grid-body);
  font-size: 14px;
  color: var(--Text-body_0);
  text-align: center;
  padding:0.4rem 1.2rem;
  height: 4.8rem;
  align-content: center;
}
:deep(.tabulator-row){
  background-color: #fff;
}
:deep(.tabulator-row:hover){
  background-color: var(--Surface-primary);
}
:deep(.tabulator-row:hover .tabulator-cell){
  color: var(--Base-primary);
  font-weight: bold;
}
:deep(.tabulator-row.tabulator-selected){
  background-color: #fff;
  box-shadow: inset 3px 0 0 var(--Base-primary);
}
:deep(.tabulator-row.tabulator-selected .tabulator-cell){
  color: var(--Base-primary);
  font-weight: 600;
}

:deep(.tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left input[type="checkbox"]),
:deep(.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title input[type="checkbox"]){
  border: 1px solid #58616A;
  border-radius: 0.4rem;
  width: 2rem;
  height: 2rem;
}
:deep(.tabulator-row .tabulator-cell.tabulator-editing){
  border:1px solid var(--Base-primary);
}
:deep(.tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left input[type="checkbox"]:checked){

}

/*
 * 행 높이 슬라이더 반영 (종합 그리드 한정)
 * - 셀은 inline-flex 로 세로 중앙 정렬(가로 배치는 유지)
 * - block 레벨 flex 를 쓰면 셀이 세로로 쌓여 그리드가 깨지므로 inline-flex 사용
 */
:deep(.main-grid .tabulator-row) {
  min-height: var(--row-h);
}
:deep(.main-grid .tabulator-row .tabulator-cell) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height:4.8rem;
}
:deep(.tabulator-row.tabulator-selected .tabulator-cell){
  color:var(--Text-body_0);
  font-weight: 400;
}
.tabulator .tabulator-header{
  background:#fff;
}
:deep(.main-grid .tabulator-cell .input-grid){
  border:1px solid var(--Border_input01);
  border-radius:0.6rem;
  }
:deep(.grid-checkbox-cell){
  text-align: center;
}

/* 입사일 셀에 마운트된 VueDatePicker: 셀 안에 딱 맞는 컴팩트한 입력 박스 */
:deep(.grid-date-cell) {
  width: 100%;
}
:deep(.grid-date-cell .dp--main) {
  width: 100%;
}
:deep(.grid-date-cell .dp--input) {
  height: 3.6rem;
  border: 1px solid var(--Border_input01);
  border-radius: 0.6rem;
  font-size: 14px;
  text-align: center;
  padding-inline-start: 1.2rem;
  font-family: "Pretendard GOV", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  font-size: 1.5rem;
}
:deep(.tabulator .tabulator-tableholder .tabulator-placeholder){
  display: flex;
  align-items: center;
}
:deep(.tabulator .tabulator-tableholder .tabulator-placeholder .tabulator-placeholder-contents){
  position: relative;

  text-align: center;
  padding-top:4.8rem;
  font-size: 1.5rem;
  font-weight: 400;
  color:var(--Text-body_disable);
}
:deep(.tabulator-placeholder-contents:after){
  position: absolute;
  top:0;
  left:calc(50% - 1.5rem);
  content:"";
  display: inline-block;
  width: 3.3rem;
  height: 3.3rem;
  background: url(/portal/asset/images/icon/ico_nodata.svg) no-repeat center / 3.3rem auto;
}
</style>
