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
  { title: '비고', field: 'memo', minWidth: 80, hozAlign: 'center', cellType: 'input' },
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
</script>

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

        <p v-if="savedMessage" data-testid="save-message" class="text-sm text-[var(--Base-primary)]">{{ savedMessage }}</p>

        <TabulatorGrid
          ref="gridRef"
          :columns="columns"
          :data="gridData"
          :row-class="rowClass"
          selectable
          show-pagination
          :items-per-page="5"
          height="320px"
          @row-selection-changed="(rows) => (selectedCount = rows.length)"
        />

        <p class="text-xs text-gray-400">
          · 셀을 클릭하면 셀 안에서 바로 편집됩니다. · 평가점수 60 미만 행은 붉게 하이라이트됩니다.
          · 편집된 셀은 노란색, 유효성 실패 셀은 붉은 테두리로 표시됩니다.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
