<template>
  <GenericDialog2
    v-model:open="open"
    title="임의등록"
    :size="800"
    :show-close-button="true"
  >
    <InfoTable :columns="2" popup>
      <InfoField label="신청부서" for="manual-apply-dept" full>
        <div class="group-gap3">
          <InputField2
            id="manual-apply-dept"
            v-model="form.applyDept"
            size="sm"
            input-class="w-75"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            class="w-20 min-w-0"
            :disabled="!isDeptChange"
            >조회</Button
          >
          <Checkbox v-model="isDeptChange" label="부서변경" />
        </div>
      </InfoField>

      <InfoField for="manual-receipt-no" full>
        <template #label>접수번호</template>
        <span class="group-gap3">
          <InputField2
            id="manual-receipt-no"
            v-model="form.receiptNo"
            size="sm"
            class="flex-1"
            input-class="w-full"
          />
          <Checkbox v-model="is112Search" label="112사건조회" />
          <p class="form-note end lp-em-success">＊ 등록 가능한 접수번호입니다.</p>
        </span>
      </InfoField>

      <InfoField label="근무일자">2026-08-06</InfoField>
      <InfoField label="사건종별">보호조치</InfoField>
      <InfoField label="접수일시">2026-08-08 14:00</InfoField>
      <!-- 시안(15197:135771): 접수일시 오른쪽 칸은 비어 있다(표 골격만 유지) -->
      <InfoField>
        <template #label><span class="sr-only">빈 항목</span></template>
        <span class="sr-only">입력 항목 없음</span>
      </InfoField>
      <InfoField label="도착일시" full>
        <span class="group-gap3">
          <DatePicker
            id="manual-arrived-at"
            v-model="form.arrivedAt"
            size="sm"
            class="!space-y-0"
            input-class="w-[15rem]"
          />
          <SelectField
            v-model="arrivedAtTime"
            :options="arrivalTimeOptions"
            placeholder="선택"
            size="sm"
            class="!space-y-0"
            trigger-class="w-25"
            aria-label="도착시간 선택"
          />
        </span>
      </InfoField>
      <InfoField label="신고내용" full layout="column">
          장충동 빠리바게트 앞쪽<br> 50대 남자분이 도로가에 쓰러져 잇다면서//
          119도 불럿다면서 장충동 빠리바게트 앞쪽<br/> 50대 남자분이 도로가에
          쓰러져 잇다면서// 119도 불럿다면서
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

      <InfoField for="manual-reason" full>
        <template #label>임의등록사유</template>
        <TextareaField
          id="manual-reason"
          v-model="form.manualReason"
          class="w-full"
          textarea-class="w-full"
          :height="112"
        />
      </InfoField>

      <InfoField full>
        <template #label>112신고 출동자</template>
        <span class="group-gap3">
          <span>{{ report112Officers }}</span>
          <Button
            v-if="!autoRegistrationDeleted"
            type="button"
            variant="tertiary2"
            size="sm"
            padding="12"
            class="h-9"
            @click="onDeleteAutoRegistration"
            >자동등록 삭제</Button
          >
          <span v-else class="lp-em-point">[자동등록 삭제완료]</span>
        </span>
      </InfoField>

      <InfoField full>
        <template #label>출동자</template>
        <span class="group-gap3">
          <span>{{ dispatchOfficers }}</span>
          <Button
            type="button"
            variant="tertiary2"
            size="sm"
            padding="12"
            class="h-9"
            @click="onManageDispatchOfficers"
            >출동자 관리</Button
          >
        </span>
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
import { ref, watch } from "vue";
import { useDialog } from "@/composable/dialog/dialog";
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
  /** 112사건조회 체크 — 112사건조회 팝업(PC-LPO-0503)을 연다(기획서 1) */
  (e: "open-112"): void;
}>();

watch(is112Search, (checked) => {
  if (checked) emit("open-112");
});

const dialog = useDialog();

/* 112사건조회에서 사건을 고르면 채워지는 값이라 연동 전까지는 목업이다 */
const report112Officers = ref("홍길동, 최두회");
const dispatchOfficers = ref("홍길동1, 홍길동2");
/** 자동등록된 출동수당을 지웠는지 — 지우면 버튼 대신 '자동등록 삭제완료' 가 남는다(기획서 3) */
const autoRegistrationDeleted = ref(false);

/** 기획서 4 — 자동등록 건이 있으면 컨펌창[A27] 후 삭제. 알림 발송은 개발팀 몫이다 */
async function onDeleteAutoRegistration() {
  const result = await dialog.confirm({
    title: "자동등록된 출동수당을 삭제하시겠습니까?",
    btnOk: "확인",
    btnCancel: "취소",
  });
  if (!result.confirmed) return;
  autoRegistrationDeleted.value = true;
  await dialog.alert({ title: "삭제되었습니다.", btnCancel: "확인" });
}

/** 기획서 5 — 112신고 출동자를 먼저 지워야 한다[A29]. 관리 화면은 시안에 없어 안내만 낸다 */
async function onManageDispatchOfficers() {
  if (!autoRegistrationDeleted.value) {
    await dialog.alert({
      title: "112신고 출동자의 자동등록을 먼저 삭제해 주세요.",
      btnCancel: "확인",
    });
    return;
  }
  await dialog.alert({ title: "출동자 관리는 연동 후 제공됩니다.", btnCancel: "확인" });
}

async function onSave() {
  const result = await dialog.confirm({
    title: "저장하시겠습니까?",
    btnOk: "확인",
    btnCancel: "취소",
  });
  if (!result.confirmed) return;

  // TODO: API 연동. 변경된 행만 보내려면 gridRef.getDirtyRows() 를 쓴다.
  await dialog.alert({ title: "저장되었습니다.", btnCancel: "확인" });
}
</script>
