<template>
  <PageHeader>
    <template #left>
      <PageTitle title="물리력 사용 보고서" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="periodType"
          label="기간구분"
          :options="periodTypeOptions"
          size="sm"
          trigger-class="w-25"
        />
        <DateRangePicker
          v-model:from="periodFrom"
          v-model:to="periodTo"
          label="기간"
          from-label="기간 시작일"
          to-label="기간 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField
          v-model="userType"
          label="사용자구분"
          :options="userTypeOptions"
          size="sm"
          trigger-class="w-30"
        />
        <InputField2 v-model="searchName" label="성명" size="sm" input-class="w-40" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions space-between">
    <p class="form-note">
      * 물리력 사용 보고서의 상세 조회는 작성자 본인 및 작성자가 지정한 1, 2, 3차 결재자만 가능합니다.
    </p>
    <div class="btn-wrap-group">
      <!-- Figma button_link — 아이콘 + 붉은 링크 텍스트 -->
      <button type="button" class="lp-link-danger" @click="onOpenRequirement">
        <Icon name="systemInfo" :size="20" />
        [필수] 보고서 작성 요건 확인
      </button>
      <Button type="button" variant="tertiary" size="sm" @click="onPrint">인쇄</Button>
    </div>
  </div>

  <GridTitle title="물리력 사용 보고서 목록">
    <Button type="button" variant="tertiary" size="sm" @click="onDeleteSelected">선택삭제</Button>
  </GridTitle>

  <TabulatorGrid
    ref="gridRef"
    :columns="columns"
    :data="rows"
    class="flex-1"
    height="100%"
    select-mode="checkbox"
    placeholder="조회된 보고서가 없습니다"
    show-pagination
    :items-per-page="10"
    @row-selection-changed="onSelectionChanged"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import { Icon } from '@/components/custom/icon'
import GridTitle from '@/components/custom/grid-title/GridTitle.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useForceUseReport, periodTypeOptions, userTypeOptions } from './composable/PM-PUB-0701'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0701' })

/*
 * LNB: publicSafetyMenu items[5] = '보고서'.
 * ⚠ 프리셋 children 은 '보고서 목록' 하나뿐인데 시안 LNB 는 '물리력 사용 보고서 /
 *   기타 영상기기 사용 보고서' 두 개다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 5, activeChild: '물리력 사용 보고서' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보고서' },
  { label: '물리력사용보고서' },
]

const {
  department,
  advancedSearchOpen,
  periodType,
  periodFrom,
  periodTo,
  userType,
  searchName,
  rows,
} = useForceUseReport()

const dialog = useDialog()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 80, hozAlign: 'center' },
  { title: '결재', field: 'approval', width: 130, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '사용자', field: 'user', width: 120, hozAlign: 'center' },
  { title: '대상자', field: 'target', width: 120, hozAlign: 'center' },
  { title: '사용일시', field: 'usedAt', width: 170, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/** @row-selection-changed 는 데이터가 아니라 RowComponent 배열을 넘긴다(CLAUDE.md §6) */
function onSelectionChanged(selected: any[]) {
  selectedCount.value = selected.length
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: '삭제할 보고서를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  gridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/* 작성 요건 안내와 인쇄는 시안에 대상 화면이 없다 — 연동 대상이라 안내만 낸다 */
async function onOpenRequirement() {
  await dialog.alert({ title: '보고서 작성 요건 안내는 연동 후 제공됩니다.', btnCancel: '확인' })
}
async function onPrint() {
  await dialog.alert({ title: '인쇄는 연동 후 제공됩니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0701',
  label: '물리력사용보고서',
  path: '/views/pub/PM-PUB-0701',
  componentName: 'PmPub0701',
  closable: true,
})
</script>
