<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import InputField2 from "@/components/custom/input/InputField2.vue"

// 기존 화면(PM-PUB-0103)과 동일한 public 자산 경로를 쓴다
const searchIcon = "/portal/asset/images/icon/ico_seach_black_20.svg"

/**
 * 주소 입력(Adress input): "주소검색"(읽기 전용 + 돋보기) + "상세주소" 두 줄 묶음.
 * Figma: Adress input (10708:44187)
 *
 * ⚠ 주소 검색 팝업 자체는 이 컴포넌트에 없다. `@search`를 받아 화면에서 팝업을 연다
 *   (PM-PUB-0103 `NewDiagnosisDialog.vue`가 지금 그렇게 쓰고 있고, 이 컴포넌트는
 *   거기 인라인으로 있던 조합을 그대로 뽑아낸 것이다).
 *   우편번호 API(도로명주소/카카오 등) 연동은 저장소에 아직 없다 — 별도 결정 필요.
 */
interface Props {
  /** 검색으로 채워지는 기본 주소 (v-model) */
  modelValue?: string
  /** 직접 입력하는 상세주소 (v-model:detail) */
  detail?: string
  disabled?: boolean
  size?: "lg" | "md" | "sm"
  addressPlaceholder?: string
  detailPlaceholder?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  detail: "",
  disabled: false,
  size: "sm",
  addressPlaceholder: "주소검색",
  detailPlaceholder: "상세주소",
  class: undefined,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "update:detail", value: string): void
  /** 돋보기 클릭 — 화면에서 주소검색 팝업을 연다 */
  (e: "search"): void
}>()
</script>

<template>
  <div :class="cn('flex w-full flex-col items-start justify-center gap-1', props.class)">
    <InputField2
      :model-value="modelValue"
      :size="size"
      :placeholder="addressPlaceholder"
      :disabled="disabled"
      readonly
      search
      :icon="searchIcon"
      icon-class="size-5"
      icon-label="주소 검색"
      class="!space-y-0 w-full"
      input-class="w-full"
      aria-label="주소"
      @update:model-value="emit('update:modelValue', String($event))"
      @icon-click="emit('search')"
    />
    <InputField2
      :model-value="detail"
      :size="size"
      :placeholder="detailPlaceholder"
      :disabled="disabled"
      clearable
      class="!space-y-0 w-full"
      input-class="w-full"
      aria-label="상세주소"
      @update:model-value="emit('update:detail', String($event))"
    />
  </div>
</template>
