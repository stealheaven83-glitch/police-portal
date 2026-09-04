<template>
  <GenericDialog2
    v-model:open="open"
    title="임의등록"
    :size="1000"
    :show-close-button="true"
  >
    <InfoTable :columns="2" popup>
      <InfoField label="신청부서" for="manual-apply-dept" full>
        <div class="group-gap3">
          <InputField2
            id="manual-apply-dept"
            v-model="form.applyDept"
            size="sm"
            class="!space-y-0 flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            class="min-w-21"
            :disabled="!isDeptChange"
            >조회</Button
          >
          <Checkbox v-model="isDeptChange" label="부서변경" />
        </div>
      </InfoField>

      <InfoField for="manual-receipt-no" full>
        <template #label>접수번호</template>
        <span class="group-gap2">
          <InputField2
            id="manual-receipt-no"
            v-model="form.receiptNo"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
          <Checkbox v-model="is112Search" label="112사건조회" />
          <span :class="styles.hintSuccess">등록 가능한 접수번호입니다.</span>
        </span>
      </InfoField>

      <InfoField label="근무일자">2026-08-06</InfoField>
      <InfoField label="사건종별">보호조치</InfoField>
      <InfoField label="접수일시">2026-08-08 14:00</InfoField>
      <InfoField label="도착일시">
        <span class="group-gap2">
          <DatePicker
            id="manual-arrived-at"
            v-model="form.arrivedAt"
            size="sm"
            class="!space-y-0"
            input-class="w-40"
          />
          <SelectField
            v-model="arrivedAtTime"
            :options="arrivalTimeOptions"
            placeholder="선택"
            size="sm"
            class="!space-y-0"
            trigger-class="w-28"
            aria-label="도착시간 선택"
          />
        </span>
      </InfoField>
      <InfoField label="신고내용" full>
        <div class="pc-lpo-0501-report-content">
          장충동 빠리바게트 앞쪽// 50대 남자분이 도로가에 쓰러져 잇다면서//
          119도 불럿다면서 장충동 빠리바게트 앞쪽// 50대 남자분이 도로가에
          쓰러져 잇다면서// 119도 불럿다면서
        </div>
      </InfoField>

      <InfoField for="manual-on-site-action" full>
        <template #label>현장조치 내용</template>
        <TextareaField
          id="manual-on-site-action"
          v-model="form.onSiteAction"
          class="w-full !space-y-0"
          textarea-class="w-full"
          :height="112"
        />
      </InfoField>

      <InfoField for="manual-on-site-action" full>
        <template #label>임의등록사유</template>
        <TextareaField
          id="manual-on-site-action"
          v-model="form.onSiteAction"
          class="w-full !space-y-0"
          textarea-class="w-full"
          :height="112"
        />
      </InfoField>

      <InfoField full>
        <template #label>증빙구분</template>
        <RadioGroup
          v-model="form.evidenceType"
          :class="styles['info-table-radio']"
        >
          <RadioGroupItem
            v-for="option in evidenceTypeOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false"
        >닫기</Button
      >
      <Button type="button" variant="primary" size="md" @click="onSave"
        >저장</Button
      >
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";
import GenericDialog2 from "@/components/custom/dialog/GenericDialog2.vue";
import { Button } from "@/components/custom/button";
import { InfoTable, InfoField } from "@/components/custom/info-table";
import InputField2 from "@/components/custom/input/InputField2.vue";
import TextareaField from "@/components/custom/textarea/TextareaField.vue";
import DatePicker from "@/components/custom/datepicker/DatePicker.vue";
import SelectField from "@/components/custom/select/SelectField.vue";
import { RadioGroup, RadioGroupItem } from "@/components/custom/radio-group";
import {
  evidenceTypeOptions,
  type ManualRegistrationForm,
} from "../composable/PC-LPO-0501";
import { Checkbox } from "@/components/custom/checkbox";
import styles from "@/components/custom/info-table/InfoTable.module.css";
import { ref } from "vue";
defineOptions({ name: "ManualRegisterDialog" });

// check state
const isDeptChange = ref(false);
const is112Search = ref(false);
const arrivedAtTime = ref("");
const arrivalTimeOptions = [
  { label: "08:00", value: "08:00" },
  { label: "14:00", value: "14:00" },
  { label: "20:00", value: "20:00" },
];
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  form: ManualRegistrationForm;
}>();

const emit = defineEmits<{
  (e: "save"): void;
}>();

function onSave() {
  emit("save");
  toast.success("저장되었습니다.");
}
</script>

<style scoped>
.pc-lpo-0501-report-content {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 9.3rem;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
