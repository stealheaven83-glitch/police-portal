<template>
  <GenericDialog2
    :open="open"
    title="이미지 선택"
    size="md"
    confirm-text="확인"
    cancel-text="취소"
    @update:open="(v: boolean) => emit('update:open', v)"
    @confirm="onConfirm"
    @cancel="emit('update:open', false)"
  >
    <ul class="lp-imgpick-grid">
      <li v-for="image in images" :key="image.id">
        <label
          class="lp-imgpick-tile"
          :class="{
            'lp-imgpick-tile-on': picked === image.id,
            'lp-imgpick-tile-off': usedIds.includes(image.id),
          }"
        >
          <span class="lp-imgpick-thumb" aria-hidden="true">{{ image.name }}</span>
          <span class="lp-imgpick-pick">
            <input
              type="radio"
              name="main-image"
              :value="image.id"
              :checked="picked === image.id"
              :disabled="usedIds.includes(image.id)"
              @change="picked = image.id"
            >
            선택
          </span>
        </label>
      </li>
    </ul>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import type { MainImage } from '../composable/PM-LPO-0122'

/**
 * 메인화면 카드에 쓸 이미지를 고르는 팝업(화면설정 › 이미지 선택).
 * 다른 카드가 이미 쓰고 있는 이미지는 비활성으로 보여준다.
 */
const props = defineProps<{
  open: boolean
  images: MainImage[]
  /** 지금 선택돼 있는 이미지 id */
  modelValue: string
  /** 다른 카드가 이미 쓰고 있는 이미지 id 목록 */
  usedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: string): void
}>()

const picked = ref(props.modelValue)

// 팝업이 다시 열릴 때 바깥 값으로 되돌린다(취소하고 다시 열면 이전 선택이 남지 않게)
watch(
  () => props.open,
  (open) => {
    if (open) picked.value = props.modelValue
  },
)

function onConfirm() {
  emit('update:modelValue', picked.value)
  emit('update:open', false)
}
</script>
