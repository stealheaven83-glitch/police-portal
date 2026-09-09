<template>
  <GenericDialog2
    v-model:open="workerAddDialogOpen"
    title="근무자 추가"
    :size="560"
    :show-close-button="true"
  >
    <p class="lp-dialog-subtitle lp-note-text">* 추가 근무자를 선택 후 저장하세요.</p>

    <!--
      공용 custom/tabulator 의 TabulatorGrid 사용.
      PC-LPO-0701 등 다른 화면과 같은 tabulator-theme.css 를 그대로 물려받아
      테두리·hover·선택행 색상·체크박스 등 표 스타일이 동일해진다.
    -->
    <TabulatorGrid
      ref="gridRef"
      :columns="columns"
      :data="workerCandidates"
      height="260px"
      selectable
      select-column-title="추가여부"
      placeholder="조회된 근무자가 없습니다"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="workerAddDialogOpen = false">
        닫기
      </Button>
      <Button type="button" variant="primary" size="md" @click="handleConfirm">
        저장
      </Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { WorkScheduleKey, type WorkerCandidate } from '../composable/useWorkSchedule'

const store = inject(WorkScheduleKey)!
const { workerAddDialogOpen, workerCandidates, confirmWorkerAdd } = store
const dialog = useDialog()

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/**
 * 이 팝업(GenericDialog2)은 열릴 때 scale/fade 로 열리는 CSS 트랜지션(duration-200)이 있다.
 * Tabulator 의 fitColumns 는 컬럼 폭을 getBoundingClientRect() 로 재는데, 이 값은 CSS transform
 * 의 영향을 그대로 받는다 — 트랜지션이 끝나기 전(scale < 1)에 재면 실제보다 좁게 측정되고,
 * 그 폭 기준으로 컬럼이 배분돼서 트랜지션이 끝난 뒤에도 오른쪽에 빈 칸이 남는다.
 * 트랜지션이 끝나는 시점(transitionend)에 다시 그려서 맞춘다. 트랜지션이 없는 환경
 * (예: prefers-reduced-motion) 대비로 타임아웃도 같이 걸어둔다.
 */
function onTableBuilt() {
  const redraw = () => gridRef.value?.redraw(true)
  const dialogEl = (gridRef.value?.$el as HTMLElement | undefined)?.closest('[role="dialog"]')
  dialogEl?.addEventListener('transitionend', redraw, { once: true })
  setTimeout(redraw, 250)
}

// minWidth 만 있고 width 가 없는 컬럼끼리는 fitColumns 가 남는 폭을 다 못 나눠주고
// 오른쪽에 빈 칸을 남기는 경우가 있다(폭이 좁은 이 팝업에서 특히 두드러짐).
// widthGrow 로 "남는 폭을 이 비율대로 나눠 가져라"를 명시해 끝까지 채운다.
const columns: TabulatorGridColumn[] = [
  { title: '계급', field: 'rank', minWidth: 100, widthGrow: 1 },
  { title: '성명', field: 'name', minWidth: 120, widthGrow: 1 },
  { title: '관서장', field: 'dept', cellType: 'checkbox', hozAlign: 'center', minWidth: 120, widthGrow: 1 },
]

/**
 * 저장 버튼 흐름(화면정의서 기준):
 *  - [A13] 근무자를 하나도 선택하지 않고 누르면 알림만 띄우고 팝업은 그대로 둔다.
 *  - [A01] 선택한 상태면 "저장 하시겠습니까?" 컨펌창 → 취소하면 아무 일도 없음.
 *  - 확인하면 실제로 목록에 반영(+ 이 팝업 닫힘)하고 [A02] "저장 되었습니다." 알림 →
 *    확인하면 페이지를 새로고침한다.
 */
async function handleConfirm() {
  const selected = (gridRef.value?.getSelectedData() ?? []) as WorkerCandidate[]

  if (selected.length === 0) {
    await dialog.alert({ title: '추가 근무자를 선택해주세요.', btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({
    title: '저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  confirmWorkerAdd(selected)

  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
  window.location.reload()
}
</script>
