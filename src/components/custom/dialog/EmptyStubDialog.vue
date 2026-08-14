<script setup lang="ts">
import GenericDialog from './GenericDialog.vue'

/**
 * 실제 데이터/검색 로직이 붙기 전까지 사용하는 빈 모달 뼈대.
 * 주소검색, 행정동 수정처럼 "클릭하면 팝업이 뜬다"는 UI 동작만 필요한 지점에서 재사용한다.
 */
interface Props {
  open: boolean
  title: string
  description?: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()
</script>

<template>
  <GenericDialog
    :open="open"
    :title="title"
    :description="description"
    size="md"
    :show-cancel="false"
    confirm-text="닫기"
    @update:open="(v) => emit('update:open', v)"
    @confirm="emit('update:open', false)"
  >
    <p class="py-10 text-center text-[1.5rem] text-[var(--Text-body_2)]">
      준비 중인 화면입니다.
    </p>
  </GenericDialog>
</template>
