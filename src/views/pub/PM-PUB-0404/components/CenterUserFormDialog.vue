<template>
  <GenericDialog2
    v-model:open="formDialogOpen"
    :title="isDetail ? '해바라기센터 사용자 상세' : '해바라기센터 사용자 등록'"
    :size="500"
    :show-close-button="true"
  >
    <InfoTable :columns="1" popup size="110">
      <!-- 상세는 조회값만 보여주고(시안), 등록은 셀렉트로 고른다 -->
      <InfoField label="관할청" :for="isDetail ? undefined : 'center-user-office'">
        <span v-if="isDetail" class="readonly-text">{{ form.office }}</span>
        <SelectField
          v-else
          id="center-user-office"
          v-model="form.office"
          :options="officeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="센터명" :for="isDetail ? undefined : 'center-user-center'">
        <span v-if="isDetail" class="readonly-text">{{ form.centerName }}</span>
        <SelectField
          v-else
          id="center-user-center"
          v-model="form.centerName"
          :options="centerNameOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="병원명" :for="isDetail ? undefined : 'center-user-hospital'">
        <span v-if="isDetail" class="readonly-text">{{ form.hospitalName }}</span>
        <SelectField
          v-else
          id="center-user-hospital"
          v-model="form.hospitalName"
          :options="hospitalOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="성명" :for="isDetail ? undefined : 'center-user-name'">
        <span v-if="isDetail" class="readonly-text">{{ form.name }}</span>
        <div v-else class="group-gap1 lp-flex-fill">
          <InputField2
            id="center-user-name"
            v-model="form.name"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
          <Button type="button" variant="tertiary" size="sm" @click="onUserSearch">사용자 검색</Button>
        </div>
      </InfoField>

      <InfoField label="직위" :for="isDetail ? undefined : 'center-user-position'">
        <span v-if="isDetail" class="readonly-text">{{ form.position }}</span>
        <InputField2
          v-else
          id="center-user-position"
          v-model="form.position"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="센터 전입일" :for="isDetail ? undefined : 'center-user-joined'">
        <span v-if="isDetail" class="readonly-text">{{ form.joinedDate }}</span>
        <DatePicker
          v-else
          id="center-user-joined"
          v-model="form.joinedDate"
          size="sm"
          class="flex-1"
          input-class="w-full"
          placeholder="선택"
        />
      </InfoField>

      <!-- 권한만은 상세에서도 고칠 수 있다(시안) -->
      <InfoField label="권한" for="center-user-role">
        <SelectField
          id="center-user-role"
          v-model="form.role"
          :options="roleOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="formDialogOpen = false">취소</Button>
      <Button v-if="isDetail" type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { useDialog } from '@/composable/dialog/dialog'
import {
  CenterUserKey,
  officeOptions,
  centerNameOptions,
  hospitalOptions,
  roleOptions,
} from '../composable/PM-PUB-0404'

const store = inject(CenterUserKey)!
const { formDialogOpen, formMode, form, validateForm, commitForm, removeForm } = store

const isDetail = computed(() => formMode.value === 'detail')

const dialog = useDialog()

/** 사용자 검색 팝업은 시안에 없다 — 개발팀 연동 대상이라 안내만 낸다 */
async function onUserSearch() {
  await dialog.alert({ title: '사용자 검색은 연동 후 제공됩니다.', btnCancel: '확인' })
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

async function onDelete() {
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  removeForm()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}
</script>
