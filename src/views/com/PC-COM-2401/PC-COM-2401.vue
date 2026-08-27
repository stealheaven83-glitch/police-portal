<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useBoardManage, countOptions } from './composable/PC-COM-2401'

defineOptions({ name: 'PcCom2401' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '홈페이지관리' },
  { label: '게시판관리' },
]

const { rows, createEmptyRow } = useBoardManage()

const dialog = useDialog()

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/**
 * 게시판 속성은 별도 상세 화면 없이 셀에서 바로 편집한다.
 * cellType 이 custom/ 공용 컴포넌트(Input · Checkbox · SelectField)를 셀에 그대로 마운트해준다.
 *
 * 폭: 번호·코드만 고정이고 나머지는 layout="fitColumns" 가 남는 폭을 나눠 갖는다.
 * 체크박스 열은 글자수가 적어 좁게, 게시판명은 입력이 들어가므로 widthGrow 로 넓게 잡는다.
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '코드', field: 'code', width: 70, hozAlign: 'center' },
  { title: '게시판명', field: 'name', cellType: 'input', widthGrow: 3 },
  { title: '사용여부', field: 'use', cellType: 'checkbox', hozAlign: 'center' },
  { title: '공지글', field: 'notice', cellType: 'checkbox', hozAlign: 'center' },
  { title: '리스트노출', field: 'listExpose', cellType: 'checkbox', hozAlign: 'center' },
  { title: '답글', field: 'reply', cellType: 'checkbox', hozAlign: 'center' },
  { title: '코멘트', field: 'comment', cellType: 'checkbox', hozAlign: 'center' },
  { title: '공감', field: 'like', cellType: 'checkbox', hozAlign: 'center' },
  { title: '파일<br/>업로드', field: 'fileUpload', cellType: 'checkbox', hozAlign: 'center', width: 70, },
  { title: '최대<br/>업로드수', field: 'maxUploadCount', cellType: 'input', hozAlign: 'center' },
  { title: '파일용량(MB)', field: 'maxFileSize', cellType: 'input', hozAlign: 'center' },
  {
    title: '목록수',
    field: 'listCount',
    cellType: 'select',
    selectOptions: countOptions,
    hozAlign: 'center',
    width: 100,
  },
  {
    title: '페이지수',
    field: 'pageCount',
    cellType: 'select',
    selectOptions: countOptions,
    hozAlign: 'center',
    width: 100,
  },
  { title: '수정일', field: 'updatedAt', hozAlign: 'center' },
]

async function onAdd() {
  // 새 행은 시안대로 맨 뒤에 붙는다. 그대로 두면 다음 페이지로 밀려 안 보이므로
  // 추가가 끝난 뒤 마지막 페이지로 따라간다.
  await gridRef.value?.addRow(createEmptyRow(), false)
  gridRef.value?.setPage('last')
}

function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 게시판을 선택해 주세요.')
    return
  }
  gridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

async function onSave() {
  // TODO: API 연동. 변경된 행만 보내려면 gridRef.getDirtyRows() 를 쓴다.
  await dialog.alert({
    title: '저장하시.',
    description: '게시판 설정이 저장되었습니다.',
    btnCancel: '확인',
  })
}

// 사이드메뉴(시스템 관리 LNB) 설정
useSideMenuSetup('systemAdmin')

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2401',
  label: '게시판 관리',
  path: '/views/com/PC-COM-2401',
  componentName: 'PcCom2401',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="게시판 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div class="list-actions">
    <!-- <div class="list-action-txt">
      <p>출동업무수당 지급대상 자동체크는 매일 오전 08시~12시에 반영됩니다. 12시 이후에 확인 후 작성하세요</p>
      <p>출동업무수당 자동체크 된 지급대상 사건과 임의등록 사건 만 표시됩니다.</p>
    </div> -->

      <Button type="button" variant="tertiary2" size="sm" class="w-25" @click="onDeleteSelected">
        선택삭제
      </Button>
      <Button type="button" variant="secondary" size="sm" class="w-25" @click="onAdd">추가</Button>
      <Button type="button" variant="primary" size="sm" class="w-25" @click="onSave">저장</Button>

  </div>  
  <TabulatorGrid
    ref="gridRef"
    v-model:data="rows"
    class="flex-1"
    :columns="columns"
    select-mode="checkbox"
    height="100%"
    placeholder="등록된 게시판이 없습니다"
    show-pagination
    :items-per-page="10"
    @row-selection-changed="selectedCount = $event.length"
  />
</template>
