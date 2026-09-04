<template>
  <GenericDialog2
    v-model:open="formDialogOpen"
    :title="formMode === 'detail' ? '해바라기센터 상세' : '해바라기센터 등록'"
    :size="500"
    :show-close-button="true"
  >
    <InfoTable :columns="1" popup size="110">
      <InfoField for="center-form-name">
        <template #label>센터명<span :class="styles.requiredDot" /></template>
        <InputField2
          id="center-form-name"
          v-model="form.centerName"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <!-- AddressInput 은 두 입력이 각자 aria-label 을 갖는다 — InfoField 에 for 를 주지 않는다 -->
      <InfoField label="주소">
        <AddressInput
          v-model="form.address"
          v-model:detail="form.addressDetail"
          size="sm"
          class="flex-1"
          address-placeholder="주소검색"
          detail-placeholder="상세주소"
          @search="onAddressSearch"
        />
      </InfoField>

      <InfoField for="center-form-office">
        <template #label>관할청<span :class="styles.requiredDot" /></template>
        <SelectField
          id="center-form-office"
          v-model="form.office"
          :options="officeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="병원명" for="center-form-hospital">
        <InputField2
          id="center-form-hospital"
          v-model="form.hospitalName"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="전화번호" for="center-form-phone">
        <InputField2
          id="center-form-phone"
          v-model="form.phone"
          size="sm"
          type="tel"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="비고" for="center-form-note">
        <InputField2
          id="center-form-note"
          v-model="form.note"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="formDialogOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import AddressInput from '@/components/custom/address/AddressInput.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { SunflowerCenterKey, officeOptions } from '../composable/PM-PUB-0401'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(SunflowerCenterKey)!
const { formDialogOpen, formMode, form, validateForm, commitForm } = store

const dialog = useDialog()

/** 주소검색 팝업은 개발팀 연동 대상이라 화면단에서는 안내만 낸다 */
async function onAddressSearch() {
  await dialog.alert({ title: '주소검색은 연동 후 제공됩니다.', btnCancel: '확인' })
}

async function onSave() {
  const message = validateForm()
  if (message) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  commitForm()
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}
</script>
