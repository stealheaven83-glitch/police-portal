<template>
  <GenericDialog2 v-model:open="approveOpen" title="승인관리" :size="560">
    <InfoTable :columns="1" popup>
      <InfoField label="지구대/파출소&#10;(팀장/계장)">
        <SelectField
          v-model="approveTeamLeader"
          :options="teamLeaderOptions"
          placeholder="선택"
          size="sm"
          class="w-full"
        />
      </InfoField>
      <InfoField label="경찰서(과장)">
        <span class="group-gap3">
          <InputField2 v-model="approveChief" size="sm" aria-label="경찰서(과장)" />
          <Button type="button" variant="secondary" size="sm" @click="userFindOpen = true">조회</Button>
        </span>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="approveOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>

  <UserFindDialog />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DispatchSummaryDialogKey, teamLeaderOptions } from '../composable/dialogs'
import UserFindDialog from './UserFindDialog.vue'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 승인관리 팝업(PC-LPO-0506) — 경찰서(과장)는 사용자 찾기(PC-LPO-0507)로 고른다 */
const store = inject(DispatchSummaryDialogKey)!
const { approveOpen, approveTeamLeader, approveChief, userFindOpen } = store

/** 저장하면 지정한 결재자를 화면에 알린다 — 화면이 승인자 줄(출동수당 승인 항목)을 이 사람들로 바꾼다 */
const emit = defineEmits<{
  (e: 'saved', payload: { teamLeader: string; chief: string }): void
}>()

async function onSave() {
  if (!approveTeamLeader.value) {
    await dialog.alert({ title: '지구대/파출소 승인자를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const teamLeader = teamLeaderOptions.find((o) => o.value === approveTeamLeader.value)?.label ?? ''
  emit('saved', { teamLeader, chief: approveChief.value })
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  approveOpen.value = false
}
</script>
