<template>
  <GenericDialog2
    :open="open"
    title="이미지 선택"
    :size="1000"
    @update:open="(v: boolean) => emit('update:open', v)"
  >
    <RadioGroup v-model="picked" as-child>
      <ul class="lp-imgpick-grid">
        <li
          v-for="image in images"
          :key="image.id"
          class="lp-imgpick-tile"
          :class="{
            'lp-imgpick-tile-on': picked === image.id,
            'lp-imgpick-tile-used': !!usedSlots[image.id],
          }"
          @click="onTileClick(image.id)"
        >
          <span class="lp-imgpick-thumb-box">
            <img class="lp-imgpick-thumb" :src="image.src" :alt="image.name">
          </span>
          <span class="lp-imgpick-pick">
            <RadioGroupItem :value="image.id" />
            <!-- 이미 카드에 올라간 이미지는 몇 번 자리인지 알려준다(시안 'N번 메뉴') -->
            {{ usedSlots[image.id] ? `${usedSlots[image.id]}번 메뉴` : '선택' }}
          </span>
        </li>
      </ul>
    </RadioGroup>

    <!-- 시안(13393:29382)의 버튼은 100×48 — 기본 푸터(36px, outline)와 달라 직접 넣는다 -->
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">적용</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import type { MainImage } from '../composable/PM-LPO-0122'

/**
 * 메인화면 카드에 쓸 이미지를 고르는 팝업(화면설정 › 이미지 선택). Figma 13393:29314.
 * 이미 카드에 올라간 이미지는 'N번 메뉴' 로 표시하지만 고를 수는 있다(시안도 라디오가 살아 있다) —
 * 고르면 그 카드와 이미지를 맞바꾼다. 번호 셀렉트가 자리를 맞바꾸는 것과 같은 방식이다.
 */
const props = defineProps<{
  open: boolean
  images: MainImage[]
  /** 지금 선택돼 있는 이미지 id */
  modelValue: string
  /** 지금 쓰이고 있는 이미지 → 그 카드의 번호 ('N번 메뉴' 로 표시한다) */
  usedSlots: Record<string, number>
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

/** 라디오뿐 아니라 타일 어디를 눌러도 고를 수 있게 한다 */
function onTileClick(id: string) {
  picked.value = id
}

function onConfirm() {
  emit('update:modelValue', picked.value)
  emit('update:open', false)
}
</script>
