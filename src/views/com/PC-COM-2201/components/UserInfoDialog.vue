<template>
  <GenericDialog2
    v-model:open="detailOpen"
    title="사용자 정보"
    :size="560"
    :show-close-button="true"
  >
    <!-- 대부분 조회 전용이고 사용여부만 바꿀 수 있다 -->
    <InfoTable :columns="1">
      <InfoField label="사용자 No">
        <strong :class="styles.detailStrong">{{ detailForm.userNo }}</strong>
      </InfoField>
      <InfoField label="사용자 ID">{{ detailForm.userId }}</InfoField>
      <InfoField label="성명">{{ detailForm.name }}</InfoField>
      <InfoField label="소속관서">{{ detailForm.agency }}</InfoField>
      <InfoField label="소속부서">{{ detailForm.dept }}</InfoField>
      <InfoField label="PW변경일자">{{ detailForm.pwChangedAt }}</InfoField>
      <InfoField label="경비전화">{{ detailForm.officePhone }}</InfoField>
      <InfoField label="휴대전화">{{ detailForm.mobile }}</InfoField>
      <InfoField label="사용여부">
        <RadioGroup v-model="detailForm.use" :class="styles['info-table-radio']">
          <RadioGroupItem value="Y" label="사용" />
          <RadioGroupItem value="N" label="사용 안함" />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="closeUserDetail">
        닫기
      </Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { useDialog } from '@/composable/dialog/dialog'
import { UserManageKey } from '../composable/PC-COM-2201'
import styles from '@/components/custom/info-table/InfoTable.module.css'

defineOptions({ name: 'UserInfoDialog' })

/** 사용자 정보 팝업 (PC-COM-2202). 사용자목록의 아이디를 누르면 열린다. */
const store = inject(UserManageKey)!
const { detailOpen, detailForm, closeUserDetail } = store

const dialog = useDialog()

async function onSave() {
  // TODO: API 연동
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  closeUserDetail()
}
</script>
