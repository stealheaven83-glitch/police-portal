<template>
  <GenericDialog2 v-model:open="approveOpen" title="승인관리" :size="440">
    <InfoTable :columns="1" popup :size="130">
      <InfoField label="지구대/파출소&#10;(팀장/계장)">
        <SelectField v-model="approveTeamLeader" :options="teamLeaderOptions" placeholder="선택" size="sm" />
      </InfoField>
      <InfoField label="경찰서(과장)">
        <span class="group-gap2">
          <InputField2 v-model="approveChief" size="sm" inputClass="w-40" aria-label="경찰서(과장)" />
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
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DispatchSummaryDialogKey, teamLeaderOptions } from '../composable/dialogs'
import UserFindDialog from './UserFindDialog.vue'

/** 승인관리 팝업(PC-LPO-0506) — 경찰서(과장)는 사용자 찾기(PC-LPO-0507)로 고른다 */
const store = inject(DispatchSummaryDialogKey)!
const { approveOpen, approveTeamLeader, approveChief, userFindOpen } = store

function onSave() {
  if (!approveTeamLeader.value) {
    toast.warning('지구대/파출소 승인자를 선택해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
  approveOpen.value = false
}
</script>
