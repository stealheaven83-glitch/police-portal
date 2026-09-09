<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Tabulator Grid</h1>
          <p class="text-muted-foreground text-sm mt-1">
            공용 데이터 그리드 컴포넌트입니다. columns · data 만 넘기면 일괄선택 · 인라인 편집 ·
            날짜/입력/버튼 셀 · 페이지네이션이 함께 동작합니다.
          </p>
        </div>
      </div>

      <section class="space-y-4">
        <ButtonGroup :items="toolbarButtons" />

        <div class="flex flex-wrap gap-3 items-center text-sm">
          <span class="text-gray-600">컬럼 표시:</span>
          <label v-for="col in toggleableColumns" :key="col.field" class="inline-flex items-center gap-1">
            <input v-model="columnVisible[col.field]" type="checkbox" @change="toggleColumn(col.field)">
            {{ col.title }}
          </label>
          <span class="ml-auto text-gray-400">선택된 행: {{ selectedCount }}건</span>
        </div>

        <p v-if="savedMessage" data-testid="save-message" class="text-sm text-[var(--Base-primary)]">{{ savedMessage }}
        </p>

        <TabulatorGrid ref="gridRef" :columns="columns" :data="gridData" :row-class="rowClass" selectable
          show-pagination :items-per-page="5" height="320px"
          @row-selection-changed="(rows) => (selectedCount = rows.length)" @validation-failed="onValidationFailed"
          @validation-errors="onValidationErrors" />

        <p class="text-xs text-gray-400">
          · 셀을 클릭하면 셀 안에서 바로 편집됩니다. · 평가점수 60 미만 행은 붉게 하이라이트됩니다.<br>
          · 비고 컬럼은 InputField2 로 최대 10자(cellMaxlength) 및 필수입력(validator: 'required')이 적용되어 있습니다.<br>
          · 편집된 셀은 노란색, 유효성 실패 셀은 붉은 테두리로 표시되며 부모 컴포넌트로 @validation-failed 이벤트가 전달됩니다.
        </p>
      </section>

      <!-- ============ 그리드 간 드래그 복사 ============ -->
      <section class="space-y-4 pt-12">
        <h2 class="text-xl font-semibold">그리드 간 드래그 복사 (행 단위)</h2>
        <p class="text-gray-500 text-sm">
          왼쪽 행의 <b>핸들(⣿)</b>을 잡아 오른쪽 그리드로 끌어다 놓으면 복사됩니다(원본 유지).
          공통 컴포넌트에서는 <code>movable-rows</code> + <code>connected-to</code> 로 연결하고,
          받은 행은 <code>@rows-received</code> 로 부모 상태에 동기화합니다.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium mb-1">원본 그리드</div>
            <TabulatorGrid :columns="dragColumns" :data="sourceData" layout="fitColumns" height="300px" movable-rows
              connected-to="#drop-target-grid" />
          </div>
          <div>
            <div class="text-sm font-medium mb-1">
              대상 그리드 (여기로 드롭) — {{ droppedData.length }}건
            </div>
            <TabulatorGrid id="drop-target-grid" :columns="dragColumns" :data="droppedData" layout="fitColumns"
              height="300px" movable-rows placeholder="왼쪽 그리드에서 행을 드래그해 놓으세요" @rows-received="onRowsReceived" />
          </div>
        </div>
      </section>

      <!-- ============ 행 더블클릭으로 다른 표에 추가 ============ -->
      <section class="space-y-4 pt-12">
        <h2 class="text-xl font-semibold">행 더블클릭으로 다른 표에 추가</h2>
        <p class="text-gray-500 text-sm">
          시안(관할행정동 검색)의 <b>"검색결과를 더블 클릭 시 하단 표에 추가"</b> 흐름입니다.
          위 그리드는 <code>select-mode="single"</code> 이라 <b>체크박스 컬럼 없이</b> 행을 클릭해
          한 줄만 선택되고, <code>@row-dbl-click</code> 으로 아래 표에 넘깁니다.
          두 그리드 모두 <code>layout</code> 을 주지 않았는데, 기본값이 <code>fitColumns</code> 라
          컨테이너 폭을 컬럼 비율대로 나눠 갖습니다.
        </p>
        <div>
          <div class="text-sm font-medium mb-1">검색 결과 — 행을 더블클릭하세요</div>
          <TabulatorGrid :columns="pickColumns" :data="pickSource" height="240px" select-mode="single"
            @row-dbl-click="onPickRow" />
        </div>
        <ButtonGroup :items="[
          {
            key: 'clear-picked',
            label: '비우기',
            variant: 'secondary',
            size: 'sm',
            onClick: clearPicked,
          },
        ]" />
        <div>
          <div class="text-sm font-medium mb-1">선택된 항목 — {{ pickedData.length }}건</div>
          <TabulatorGrid :columns="pickColumns" :data="pickedData" height="200px" placeholder="위 표에서 행을 더블클릭하세요" />
        </div>
      </section>

      <!-- ============ 헤더 그룹핑 (셀 병합 대체) ============ -->
      <section class="space-y-4 pt-12">
        <h2 class="text-xl font-semibold">
          헤더 그룹핑 <span class="text-sm font-normal text-red-500">(데이터 셀 병합은 미지원)</span>
        </h2>
        <p class="text-gray-500 text-sm">
          Tabulator 6.5 는 <b>데이터 셀의 rowspan/colspan 을 지원하지 않습니다</b>. 상단 헤더를 묶는
          것만 가능하며, 컬럼 정의에 <code>columns</code> 를 중첩하면 됩니다. 그룹 안쪽 자식 컬럼에서도
          <code>cellType</code>(아래 부서=select, 상태=badge)이 그대로 동작합니다.
        </p>
        <TabulatorGrid :columns="groupColumns" :data="groupData" layout="fitColumns" height="300px" />
      </section>

      <!-- ============ 빈 데이터 상태 ============ -->
      <section class="space-y-4 pt-12 pb-6">
        <h2 class="text-xl font-semibold">빈 데이터 상태</h2>
        <p class="text-gray-500 text-sm">
          데이터가 0건이면 <code>placeholder</code> 프롭의 문구가 표시됩니다(기본
          "데이터가 없습니다"). 시안과 맞추어 <b>0건일 때는 페이지네이션 바가 통째로 사라집니다.</b>
          아래 버튼으로 0건 ↔ 데이터 있음을 오가며 확인합니다.
        </p>
        <ButtonGroup :items="[
          {
            key: 'toggle-empty',
            label: emptyData.length ? '데이터 비우기' : '데이터 채우기',
            variant: 'secondary',
            size: 'sm',
            onClick: toggleEmptyData,
          },
        ]" />
        <TabulatorGrid :columns="dragColumns.slice(1)" :data="emptyData" layout="fitColumns" height="220px"
          placeholder="조회된 데이터가 없습니다" show-pagination :items-per-page="5" />
      </section>

      <!-- ============ 서버 사이드 / 외부 제어 페이지네이션 ============ -->
      <section class="space-y-4 pt-12 pb-6">
        <h2 class="text-xl font-semibold">서버 사이드 / 외부 제어 페이지네이션 (Server-side Pagination)</h2>
        <p class="text-gray-500 text-sm">
          API 로부터 현재 페이지의 목록만 조회해 <code>:data</code> 에 전달하고,
          <code>total-elements</code>, <code>v-model:current-page</code>, <code>:items-per-page</code> 를 넘겨
          <b>그리드 하단 Pagination 을 직접 핸들링</b>하는 예제입니다.<br>
          페이지 번호를 클릭하거나 페이지당 건수(10건/20건/30건)를 바꾸면 외부 API(가상 서버)에서 현재 페이지 데이터만 조회해 그리드를 갱신합니다.
        </p>
        <div class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <span>전체 가상 서버 데이터: <b>{{ serverTotalElements }}</b>건</span>
          <span>현재 페이지: <b>{{ serverCurrentPage }}</b> / 표시 중인 건수: <b>{{ serverDisplayData.length }}</b>건</span>
        </div>
        <TabulatorGrid :columns="columns.slice(0, 6)" :data="serverDisplayData" layout="fitColumns" height="320px"
          show-pagination v-model:current-page="serverCurrentPage" :total-elements="serverTotalElements"
          :items-per-page="serverItemsPerPage" @update:current-page="fetchServerData"
          @update:items-per-page="onServerPageSizeChange" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { ButtonGroup, type ButtonCaseItem } from '@/components/custom/button'

type Employee = {
  id: number
  name: string
  dept: string
  position: string
  salary: number
  score: number
  joinDate: string
  active: boolean
  status: string
  agree: boolean
  memo: string
}

const initialData: Employee[] = [
  { id: 1, name: '김철수', dept: '개발', position: '팀장', salary: 8200, score: 92, joinDate: '2016-03-02', active: true, status: '활성화', agree: true, memo: '' },
  { id: 2, name: '이영희', dept: '디자인', position: '선임', salary: 6100, score: 78, joinDate: '2019-07-15', active: true, status: '대기중', agree: false, memo: '' },
  { id: 3, name: '박민준', dept: '개발', position: '주임', salary: 4800, score: 55, joinDate: '2022-01-10', active: true, status: '활성화', agree: true, memo: '' },
  { id: 4, name: '최지우', dept: '기획', position: '책임', salary: 7000, score: 84, joinDate: '2018-11-20', active: false, status: '비활성화', agree: false, memo: '' },
  { id: 5, name: '정해인', dept: '개발', position: '사원', salary: 4200, score: 48, joinDate: '2023-05-02', active: true, status: '대기중', agree: true, memo: '' },
  { id: 6, name: '한소희', dept: '마케팅', position: '선임', salary: 5900, score: 88, joinDate: '2020-09-01', active: true, status: '활성화', agree: true, memo: '' },
  { id: 7, name: '오세훈', dept: '영업', position: '사원', salary: 3900, score: 62, joinDate: '2024-02-19', active: true, status: '활성화', agree: false, memo: '' },
  { id: 8, name: '문지훈', dept: '개발', position: '선임', salary: 6400, score: 71, joinDate: '2021-06-11', active: true, status: '비활성화', agree: true, memo: '' },
]

const deptOptions = [
  { label: '개발', value: '개발' },
  { label: '디자인', value: '디자인' },
  { label: '기획', value: '기획' },
  { label: '마케팅', value: '마케팅' },
  { label: '영업', value: '영업' },
]

const gridData = ref<Employee[]>(JSON.parse(JSON.stringify(initialData)))
const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

let nextId = initialData.length + 1

/* ------------------------------------------------------------------ *
 * 컬럼 정의 — cellType 으로 날짜/입력/버튼 셀을 간단히 지정
 * ------------------------------------------------------------------ */
const columns: TabulatorGridColumn[] = [
  { title: '사번', field: 'id', width: 70, hozAlign: 'center', editor: false },
  { title: '이름', field: 'name', minWidth: 100, editor: 'input', validator: ['required', 'string'], tooltip: true },
  { title: '부서', field: 'dept', width: 130, cellType: 'select', selectOptions: deptOptions },
  { title: '직급', field: 'position', minWidth: 90, editor: 'input' },
  {
    title: '연봉(만원)',
    field: 'salary',
    minWidth: 110,
    hozAlign: 'right',
    editor: 'number',
    validator: ['required', 'min:0', 'max:100000'],
    formatter: (cell: any) => {
      const v = Number(cell.getValue() ?? 0)
      cell.getElement().style.fontWeight = v >= 7000 ? '600' : ''
      return v.toLocaleString()
    },
  },
  {
    title: '평가',
    field: 'score',
    minWidth: 90,
    hozAlign: 'center',
    editor: 'number',
    validator: ['required', 'min:0', 'max:100'],
  },
  {
    title: '입사일',
    field: 'joinDate',
    width: 190,
    hozAlign: 'center',
    cellType: 'date',
    tooltip: (_e: any, cell: any) => `입사일: ${cell.getValue()}`,
  },
  { title: '재직', field: 'active', width: 90, cellType: 'switch' },
  { title: '동의', field: 'agree', width: 70, cellType: 'checkbox' },
  {
    title: '상태',
    field: 'status',
    width: 110,
    cellType: 'badge',
    badgeColorMap: { 활성화: 'success', 비활성화: 'danger', 대기중: 'warning' },
  },
  {
    title: '비고',
    field: 'memo',
    minWidth: 130,
    cellType: 'input',
    cellMaxlength: 10,
    cellClearable: true,
    validator: 'required',
    cellPlaceholder: '최대10자(필수)',
  },
  {
    title: '관리',
    width: 120,
    hozAlign: 'center',
    cellType: 'button',
    buttonLabel: '상세보기',
    buttonVariant: 'tertiary',
    // 퇴직자(active=false)는 상세보기 비활성
    buttonDisabled: (rowData) => !rowData.active,
    onButtonClick: (rowData) => {
      // eslint-disable-next-line no-console
      console.log('상세보기 클릭:', rowData)
    },
  },
]

/* 평가점수 60 미만 행을 하이라이트 */
function rowClass(data: Employee) {
  return Number(data.score) < 60 ? 'row-warn' : undefined
}

/* ------------------------------------------------------------------ *
 * 컬럼 표시/숨김
 * ------------------------------------------------------------------ */
const toggleableColumns = [
  { field: 'dept', title: '부서' },
  { field: 'position', title: '직급' },
  { field: 'salary', title: '연봉' },
  { field: 'score', title: '평가' },
  { field: 'joinDate', title: '입사일' },
]
const columnVisible = reactive<Record<string, boolean>>({
  dept: true, position: true, salary: true, score: true, joinDate: true,
})

function toggleColumn(field: string) {
  gridRef.value?.toggleColumn(field, columnVisible[field])
}

function resetColumns() {
  toggleableColumns.forEach((col) => {
    columnVisible[col.field] = true
    toggleColumn(col.field)
  })
}

/* ------------------------------------------------------------------ *
 * 툴바 액션 — 전부 컴포넌트가 노출(defineExpose)한 API 로 처리
 * ------------------------------------------------------------------ */
const toolbarButtons: ButtonCaseItem[] = [
  {
    key: 'add-row',
    label: '행 추가',
    variant: 'primary',
    size: 'sm',
    onClick: () =>
      gridRef.value?.addRow({
        id: nextId++, name: '신규사원', dept: '개발', position: '사원',
        salary: 4000, score: 70, joinDate: '2026-07-14',
        active: true, status: '대기중', agree: false, memo: '',
      }),
  },
  { key: 'select-all', label: '전체 선택', variant: 'secondary', size: 'sm', onClick: () => gridRef.value?.selectAll() },
  { key: 'deselect-all', label: '선택 해제', variant: 'tertiary2', size: 'sm', onClick: () => gridRef.value?.deselectAll() },
  { key: 'delete-selected', label: '선택 삭제', variant: 'destructive', size: 'sm', onClick: () => gridRef.value?.deleteSelected() },
  {
    key: 'reset',
    label: '변경사항 초기화',
    variant: 'text',
    size: 'sm',
    onClick: () => gridRef.value?.setData(JSON.parse(JSON.stringify(initialData))),
  },
  { key: 'reset-columns', label: '컬럼 초기화', variant: 'text', size: 'sm', onClick: resetColumns },
  { key: 'layout-fit-columns', label: '컬럼 맞춤', variant: 'outline', size: 'sm', onClick: () => gridRef.value?.setLayout('fitColumns') },
  { key: 'layout-fit-data', label: '데이터 맞춤', variant: 'outline', size: 'sm', onClick: () => gridRef.value?.setLayout('fitData') },
  {
    key: 'save',
    label: '변경분 저장',
    variant: 'primary',
    size: 'sm',
    onClick: () => {
      const invalid = gridRef.value?.validate() ?? []
      const dirty = gridRef.value?.getDirtyRows() ?? []
      if (invalid.length) {
        savedMessage.value = `유효성 오류 ${invalid.length}건이 있어 저장할 수 없습니다. (변경 ${dirty.length}건)`
        return
      }
      savedMessage.value = dirty.length
        ? `변경된 행 ${dirty.length}건을 저장했습니다. (${dirty.map((r: any) => r.name).join(', ')})`
        : `변경된 내용이 없습니다. (유효성 오류 ${invalid.length}건)`
      gridRef.value?.clearDirty()
    },
  },
]

const selectedCount = ref(0)
const savedMessage = ref('')

function onValidationFailed(error: any) {
  savedMessage.value = `[유효성 오류 감지] ${error.field}: ${error.message} (입력값: "${error.value ?? ''}")`
}

function onValidationErrors(errors: any[]) {
  savedMessage.value = `전체 검사: 유효성 오류 ${errors.length}건이 발견되었습니다.`
}

/* ------------------------------------------------------------------ *
 * 그리드 간 드래그 복사
 *
 * Tabulator 의 그리드 연결은 셀렉터가 "Tabulator 를 생성한 엘리먼트"에 걸려야 하므로
 * 대상 그리드에 id 를 준다(공통 컴포넌트가 id 를 host 엘리먼트로 내려보낸다).
 * 받은 행은 그리드 내부에만 남으므로 @rows-received 로 부모 상태에 동기화한다.
 * ------------------------------------------------------------------ */
const dragColumns: TabulatorGridColumn[] = [
  { rowHandle: true, formatter: 'handle', headerSort: false, width: 40, frozen: true },
  { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
  { title: '이름', field: 'name', minWidth: 100 },
  { title: '부서', field: 'dept', minWidth: 100 },
  { title: '직급', field: 'position', minWidth: 90 },
]

const sourceData = ref<Employee[]>(JSON.parse(JSON.stringify(initialData)))
const droppedData = ref<Employee[]>([])

function onRowsReceived(fromRow: any) {
  const received = fromRow.getData()
  if (droppedData.value.some((row) => row.id === received.id)) return
  droppedData.value = [...droppedData.value, received]
}

/* ------------------------------------------------------------------ *
 * 헤더 그룹핑 (셀 병합 대체)
 *
 * Tabulator 6.x 는 데이터 셀 rowspan/colspan 이 없어서 상단 헤더를 묶는 것만 가능하다.
 * 그룹 안쪽 자식 컬럼에서도 cellType 이 그대로 동작하는지 함께 확인한다.
 * ------------------------------------------------------------------ */
const groupColumns: TabulatorGridColumn[] = [
  { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
  {
    title: '인적사항',
    columns: [
      { title: '이름', field: 'name', minWidth: 100 },
      { title: '부서', field: 'dept', width: 130, cellType: 'select', selectOptions: deptOptions },
      { title: '직급', field: 'position', minWidth: 90 },
    ],
  },
  {
    title: '평가정보',
    columns: [
      { title: '연봉(만원)', field: 'salary', hozAlign: 'right', minWidth: 110 },
      { title: '평가', field: 'score', hozAlign: 'center', minWidth: 80 },
      {
        title: '상태',
        field: 'status',
        width: 110,
        cellType: 'badge',
        badgeColorMap: { 활성화: 'success', 비활성화: 'danger', 대기중: 'warning' },
      },
    ],
  },
]

const groupData = ref<Employee[]>(JSON.parse(JSON.stringify(initialData)))

/* ------------------------------------------------------------------ *
 * 행 더블클릭으로 다른 표에 추가 (체크박스 없는 단일 선택)
 *
 * 시안(관할행정동 검색 팝업)의 "검색결과를 더블 클릭 시 하단 표에 추가" 흐름.
 * 위 표는 select-mode="single" 이라 체크박스 컬럼 없이 행 클릭만으로 선택된다.
 * ------------------------------------------------------------------ */
const pickColumns: TabulatorGridColumn[] = [
  { title: '사번', field: 'id', width: 70, hozAlign: 'center' },
  { title: '이름', field: 'name', minWidth: 100 },
  { title: '부서', field: 'dept', minWidth: 100 },
  { title: '직급', field: 'position', minWidth: 90 },
]

const pickSource = ref<Employee[]>(JSON.parse(JSON.stringify(initialData)))
const pickedData = ref<Employee[]>([])

function onPickRow(_event: Event, row: any) {
  const picked = row.getData() as Employee
  if (pickedData.value.some((r) => r.id === picked.id)) return
  pickedData.value = [...pickedData.value, { ...picked }]
}

function clearPicked() {
  pickedData.value = []
}

/* ------------------------------------------------------------------ *
 * 빈 데이터 상태
 * ------------------------------------------------------------------ */
const emptyData = ref<Employee[]>([])

function toggleEmptyData() {
  emptyData.value = emptyData.value.length ? [] : JSON.parse(JSON.stringify(initialData.slice(0, 3)))
}

/* ------------------------------------------------------------------ *
 * 서버 사이드 / 외부 제어 페이지네이션 예제
 *
 * 백엔드 페이징 API 와 연동할 때의 예시입니다.
 * 그리드에 넘기는 data 는 "현재 페이지의 데이터" 뿐이며,
 * totalElements, currentPage 를 외부에서 전달받아 Pagination 을 직접 제어합니다.
 * ------------------------------------------------------------------ */
const serverTotalItems: Employee[] = Array.from({ length: 45 }, (_, i) => {
  const depts = ['개발', '디자인', '기획', '마케팅', '영업']
  const positions = ['사원', '주임', '선임', '책임', '팀장']
  const dept = depts[i % depts.length]
  const position = positions[i % positions.length]
  return {
    id: i + 1,
    name: `직원_${String(i + 1).padStart(2, '0')}`,
    dept,
    position,
    salary: 3500 + ((i * 120) % 5000),
    score: 50 + ((i * 7) % 50),
    joinDate: `202${(i % 5) + 1}-0${(i % 9) + 1}-15`,
    active: i % 4 !== 0,
    status: i % 4 === 0 ? '비활성화' : i % 3 === 0 ? '대기중' : '활성화',
    agree: true,
    memo: `서버 데이터 #${i + 1}`,
  }
})

const serverCurrentPage = ref(1)
const serverItemsPerPage = ref(10)
const serverTotalElements = ref(serverTotalItems.length)
const serverDisplayData = ref<Employee[]>([])

function fetchServerData() {
  const start = (serverCurrentPage.value - 1) * serverItemsPerPage.value
  const end = start + serverItemsPerPage.value
  serverDisplayData.value = serverTotalItems.slice(start, end)
}

function onServerPageSizeChange(size: number) {
  serverItemsPerPage.value = size
  serverCurrentPage.value = 1
  fetchServerData()
}

// 초기 데이터 로드
fetchServerData()
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
