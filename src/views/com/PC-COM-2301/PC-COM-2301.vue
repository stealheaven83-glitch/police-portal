
<template>
  <PageHeader>
    <template #left>
      <PageTitle title="시스템모니터링 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">선택삭제</Button>
    <Button type="button" variant="secondary" size="sm" @click="onAdd">추가</Button>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </div>
  <TabulatorGrid
    ref="gridRef"
    v-model:data="rows"
    class="flex-1"
    :columns="columns"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="등록된 항목이 없습니다"
    show-pagination
    :items-per-page="10"
    @row-selection-changed="selectedCount = $event.length"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PcCom2301',
})

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템모니터링관리' },
]

interface MonitoringRow {
  no: number
  title: string
  collectType: string
  url: string
}

const collectTypeOptions = [
  { label: '등록', value: 'create' },
  { label: '읽기', value: 'read' },
  { label: '인쇄', value: 'print' },
  { label: '삭제', value: 'delete' },
  { label: '엑셀다운', value: 'excel' },
]

// TODO: API 연동 전까지 사용하는 더미 데이터
const rows = ref<MonitoringRow[]>([
  { no: 5, title: '근무일지 등록 수집', collectType: 'create', url: '/pcm/pub/physicalUsageReport.do' },
  { no: 4, title: '아동학대 인쇄 수집', collectType: 'read', url: '' },
  { no: 3, title: '요청목록 삭제 수집', collectType: 'print', url: '' },
  { no: 2, title: '권한관리 엑셀다운 수집', collectType: 'delete', url: '/pcm/pub/physicalUsageReport.do' },
  { no: 1, title: '112신고조회 조회 내역 수집', collectType: 'excel', url: '' },
])

/**
 * 제목 · 수집항목 · URL 은 셀에서 바로 편집한다(별도 상세 화면 없음).
 * cellType 이 custom/ 공용 컴포넌트(Input, SelectField)를 셀에 그대로 마운트해준다.
 *
 * 폭: 번호만 고정이고 나머지는 layout="fitColumns" 가 남는 폭을 나눠 갖는다.
 * 시안 비율(제목:수집항목:URL ≒ 4:1.5:5)에 맞춰 widthGrow 로 배분한다.
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 90, hozAlign: 'center' },
  { title: '제목', field: 'title', cellType: 'input', widthGrow: 4 },
  {
    title: '수집항목',
    field: 'collectType',
    cellType: 'select',
    selectOptions: collectTypeOptions,
    selectPlaceholder: '선택',
    widthGrow: 1.5,
    width:300,
  },
  { title: 'URL', field: 'url', cellType: 'input', widthGrow: 5 },
]

const dialog = useDialog()

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/** 새 행은 맨 위에 붙고 번호는 현재 최대값 +1 (시안의 내림차순 유지) */
function onAdd() {
  const nextNo = rows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
  gridRef.value?.addRow({ no: nextNo, title: '', collectType: '', url: '' }, true)
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 항목을 선택해 주세요.', btnCancel: '확인' })
    return
  }

  // 되돌릴 수 없는 동작이라 지우기 전에 한 번 묻는다
  const result = await dialog.confirm({
    title: '삭제하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  gridRef.value?.deleteSelected()
  await dialog.alert({
    title: '삭제 되었습니다.',
    btnCancel: '확인',
  })
}

async function onSave() {
  // 설명 없이 제목만 있는 확인 다이얼로그
  const result = await dialog.confirm({
    title: '저장하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동
  await dialog.alert({
    title: '등록되었습니다.',
    btnCancel: '확인',
  })
}

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2301',                 // Unique Identifier (기본 컴포넌트 이름 매핑)
  label: '시스템모니터링 관리',            // 탭 표시 명칭
  path: '/views/com/PC-COM-2301',       // 클릭 시 이동할 라우트 경로
  componentName: 'PcCom2301',           // KeepAlive 캐싱 대상 컴포넌트 이름 (필수)
  closable: true                        // 닫기 가능 여부 (기본값 true)
})

</script>

