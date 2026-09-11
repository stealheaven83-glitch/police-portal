<template>
  <GenericDialog2 v-model:open="cancelOpen" title="승인취소관리" :size="560">
    <InfoTable :columns="1" popup>
      <InfoField label="지구대/파출소&#10;(팀장/계장)">
        <span class="group-gap3">
          <SelectField v-model="cancelTeamLeader" :options="teamLeaderOptions" placeholder="선택" size="sm" class="w-57" />
          <Badge color="primary" variant="solid-pastel" size="lg" shape="sm" class="lp-badge-xl">승인완료</Badge>
        </span>
      </InfoField>
      <InfoField label="경찰서(과장)">
        <span class="group-gap3">
          <InputField2 v-model="cancelChief" size="sm" inputClass="w-57" aria-label="경찰서(과장)" />
          <Badge color="danger" variant="solid-pastel" size="lg" shape="sm" class="lp-badge-xl">미승인</Badge>
        </span>
      </InfoField>
      <InfoField label="승인취소사유">
        <TextareaField v-model="cancelReason" aria-label="승인취소사유" :height="88" class="w-full" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="cancelOpen = false">닫기</Button>
      <Button type="button" variant="secondary" size="md" @click="onCancelApprove">승인취소</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/custom/badge'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { DispatchSummaryDialogKey, teamLeaderOptions } from '../composable/dialogs'

/** 승인취소관리 팝업(PC-LPO-0508) */
const store = inject(DispatchSummaryDialogKey)!
const { cancelOpen, cancelTeamLeader, cancelChief, cancelReason } = store

const dialog = useDialog()

/** 승인취소는 되돌릴 수 없어 컨펌창을 띄운다(CLAUDE.md §7 의 예외 사유에 해당) */
async function onCancelApprove() {
  if (!cancelReason.value.trim()) {
    await dialog.alert({ title: '승인취소사유를 입력해 주세요.', btnCancel: '확인' })
    return
  }
  const { confirmed } = await dialog.confirm({
    title: '승인을 취소하시겠습니까?',
    description: '취소하면 이미 승인된 출동수당이 되돌려집니다.',
    btnOk: '승인취소',
  })
  if (!confirmed) return
  await dialog.alert({ title: '승인이 취소되었습니다.', btnCancel: '확인' })
  cancelOpen.value = false
}
</script>
