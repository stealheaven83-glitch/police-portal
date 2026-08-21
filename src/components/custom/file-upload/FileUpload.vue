<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, ref, useId } from "vue"
import { CheckCircle2, ChevronRight, Download, Loader2, X, XCircle } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { fileUploadVariants } from "."

/**
 * Figma: file_upload__atomic__pc / __mo
 * 실제 업로드 진행은 상위에서 처리하고, 이 컴포넌트는 상태만 넘겨받아 표시합니다.
 */
interface Props {
  /** 첨부된 파일 (v-model) */
  modelValue?: File | null
  /** modelValue 없이 파일명만 표시하고 싶을 때(예: 서버에 저장된 파일) */
  fileName?: string
  /** placeholder / 안내 문구, 예: "파일명을 입력해주세요 [PDF,20KB]" */
  hint?: string
  accept?: string
  disabled?: boolean
  /** 업로드 진행중 (스피너 표시) */
  uploading?: boolean
  /** 방금 업로드 완료 (체크 표시, 일시적으로 사용) */
  uploaded?: boolean
  /** 있으면 에러 상태 + 하단에 메시지 표시 */
  error?: string
  /** true면 다운로드 전용(다운로드/바로보기 링크만 표시, 삭제 불가) */
  readonly?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  fileName: undefined,
  hint: "파일을 선택해 주세요",
  accept: undefined,
  disabled: false,
  uploading: false,
  uploaded: false,
  error: undefined,
  readonly: false,
  class: undefined,
})

const emit = defineEmits<{
  (e: "update:modelValue", file: File | null): void
  (e: "remove"): void
  (e: "download"): void
  (e: "preview"): void
}>()

const uid = useId()
const inputId = computed(() => `file-upload-${uid}`)
const inputRef = ref<HTMLInputElement | null>(null)

const displayName = computed(() => props.modelValue?.name ?? props.fileName)

function openPicker() {
  if (props.disabled || props.readonly) return
  inputRef.value?.click()
}

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  emit("update:modelValue", file)
}

function onRemove(e: Event) {
  e.stopPropagation()
  emit("update:modelValue", null)
  emit("remove")
  if (inputRef.value) inputRef.value.value = ""
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      role="button"
      :tabindex="disabled || readonly ? -1 : 0"
      :class="cn(fileUploadVariants({ error: !!error, disabled }), props.class)"
      @click="openPicker"
      @keydown.enter="openPicker"
    >
      <span
        class="flex-1 min-w-0 truncate text-[1.5rem]"
        :class="displayName ? 'text-[var(--Text-body_0)]' : 'text-[var(--Text-body_disable)]'"
      >
        {{ displayName ?? hint }}
      </span>

      <!-- ongoing -->
      <Loader2 v-if="uploading" class="size-5 shrink-0 animate-spin text-[var(--Base-primary)]" />

      <!-- progress_completed -->
      <CheckCircle2 v-else-if="uploaded" class="size-5 shrink-0 text-[var(--Base-primary)] fill-[var(--Base-primary)] text-white" />

      <!-- download -->
      <div v-else-if="readonly" class="flex items-center gap-3 shrink-0 text-[1.4rem]">
        <button
          type="button"
          class="flex items-center gap-1 text-[var(--Text-body_1)] hover:text-[var(--Base-primary)]"
          @click.stop="emit('download')"
        >
          다운로드 <Download class="size-4" />
        </button>
        <button
          type="button"
          class="flex items-center gap-1 text-[var(--Text-body_1)] hover:text-[var(--Base-primary)]"
          @click.stop="emit('preview')"
        >
          바로보기 <ChevronRight class="size-4" />
        </button>
      </div>

      <!-- upload / error: 삭제 -->
      <button
        v-else-if="displayName"
        type="button"
        class="flex items-center gap-1 shrink-0 text-[1.4rem] text-[var(--Text-body_1)] hover:text-[var(--danger)]"
        @click="onRemove"
      >
        삭제 <X class="size-4" />
      </button>

      <input
        :id="inputId"
        ref="inputRef"
        type="file"
        class="hidden"
        :accept="accept"
        :disabled="disabled || readonly"
        @click.stop
        @change="onChange"
      >
    </div>

    <div v-if="error" class="flex items-start gap-1.5 px-1">
      <XCircle class="size-4 shrink-0 mt-0.5 text-[var(--Alert-danger-icon)]" />
      <p class="text-[1.3rem] leading-[1.5] text-[var(--Text-body_0)]">{{ error }}</p>
    </div>
  </div>
</template>
