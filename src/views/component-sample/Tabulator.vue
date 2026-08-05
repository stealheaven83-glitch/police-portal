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
                <th class="border px-3 py-2 w-10">#</th>
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

        <!-- 툴바 -->
        <div class="flex flex-wrap gap-2 items-center">
          <button class="btn" @click="addRow">행 추가</button>
          <button class="btn" @click="deleteSelected">선택 행 삭제</button>
          <button class="btn" @click="selectAll">전체 선택</button>
          <button class="btn" @click="deselectAll">전체 해제</button>
          <button class="btn" @click="resetChanges">변경 초기화</button>

          <span class="mx-1 h-5 w-px bg-gray-300" />

          <label class="text-sm text-gray-600">자동 맞춤:</label>
          <select class="border rounded px-2 py-1 text-sm" v-model="layoutMode" @change="applyLayout">
            <option value="fitColumns">표 전체(fitColumns)</option>
            <option value="fitData">내용 맞춤(fitData)</option>
            <option value="fitDataStretch">내용+확장(fitDataStretch)</option>
          </select>

          <span class="mx-1 h-5 w-px bg-gray-300" />

          <label class="text-sm text-gray-600">행 높이:</label>
          <input type="range" min="32" max="72" step="4" v-model.number="rowHeight" />
          <span class="text-sm text-gray-500 w-10">{{ rowHeight }}px</span>
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
        <div ref="mainTableEl" class="tabulator-host main-grid" />

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

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
  { feature: '컬럼 정렬', level: 'ok', badge: '지원', how: '헤더 클릭 sorter(다중 정렬)' },
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
}

const initialData: Employee[] = [
  { id: 1, name: '김철수', dept: '개발', position: '팀장', salary: 8200, score: 92, joinDate: '2016-03-02', active: true },
  { id: 2, name: '이영희', dept: '디자인', position: '선임', salary: 6100, score: 78, joinDate: '2019-07-15', active: true },
  { id: 3, name: '박민준', dept: '개발', position: '주임', salary: 4800, score: 55, joinDate: '2022-01-10', active: true },
  { id: 4, name: '최지우', dept: '기획', position: '책임', salary: 7000, score: 84, joinDate: '2018-11-20', active: false },
  { id: 5, name: '정해인', dept: '개발', position: '사원', salary: 4200, score: 48, joinDate: '2023-05-02', active: true },
  { id: 6, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true },
]

const deptValues = ['개발', '디자인', '기획', '마케팅', '영업']

/* ------------------------------------------------------------------ *
 * 반응형 상태
 * ------------------------------------------------------------------ */
const layoutMode = ref<'fitColumns' | 'fitData' | 'fitDataStretch'>('fitColumns')
const rowHeight = ref(40)
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
 * Tabulator 인스턴스 및 DOM refs
 * ------------------------------------------------------------------ */
const mainTableEl = ref<HTMLElement | null>(null)
const leftTableEl = ref<HTMLElement | null>(null)
const rightTableEl = ref<HTMLElement | null>(null)
const groupTableEl = ref<HTMLElement | null>(null)

let mainTable: any = null
let leftTable: any = null
let rightTable: any = null
let groupTable: any = null

/* 다음 추가될 행의 id */
let nextId = initialData.length + 1

/* ------------------------------------------------------------------ *
 * 메인 그리드 컬럼 정의
 * ------------------------------------------------------------------ */
function buildMainColumns() {
  return [
    // 일괄 선택 체크박스 (헤더 체크박스로 전체 선택/해제)
    {
      formatter: 'rowSelection',
      titleFormatter: 'rowSelection',
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
      minWidth: 110,
      hozAlign: 'center',
      editor: 'input',
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
  ]
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
    layout: layoutMode.value,
    responsiveLayout: 'collapse', // 모바일 대응: 폭이 좁으면 컬럼 접기
    resizableColumns: true, // 컬럼 너비 드래그 조절
    resizableRows: true, // 행 높이 드래그 조절
    movableColumns: true, // 컬럼 순서 이동
    selectableRows: true, // 행 선택(일괄 선택)
    columnDefaults: { headerSort: false }, // 컬럼 정렬 기능 비활성화
    tooltip: true, // 기본 셀 툴팁
    height: '420px',
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
    columns: connectColumns,
  })

  rightTable = new Tabulator(rightTableEl.value, {
    data: [],
    layout: 'fitColumns',
    height: '300px',
    movableRows: true,
    placeholder: '왼쪽 그리드에서 행을 드래그해 놓으세요',
    columns: connectColumns,
  })

  /* 4) 헤더 그룹핑(셀 병합 대체) 그리드 */
  groupTable = new Tabulator(groupTableEl.value, {
    data: JSON.parse(JSON.stringify(initialData)),
    layout: 'fitColumns',
    height: '260px',
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
})

onBeforeUnmount(() => {
  mainTable?.destroy()
  leftTable?.destroy()
  rightTable?.destroy()
  groupTable?.destroy()
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
:deep(.main-grid.tabulator) {
  background-color: #f8fafc;
  border:0;
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
:deep(.tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left){
  border-left:0
}
:deep(.tabulator-row .tabulator-cell){
  border-right:1px solid var(--Border-grid-body);
  border-bottom:1px solid  var(--Border-grid-body);
  font-size: 14px;
  color: var(--Text-body_1);
  text-align: center;
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
}
.tabulator .tabulator-header{
  background:#fff;
}
</style>
