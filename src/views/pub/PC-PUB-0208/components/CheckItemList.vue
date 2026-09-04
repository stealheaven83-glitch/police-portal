<template>
  <ol class="lp-survey-list">
    <li v-for="(item, index) in items" :key="item.id" class="lp-survey-item">
      <div>
        <p>{{ index + 1 }}. <b>{{ headOf(item.text) }}</b>{{ tailOf(item.text) }}</p>
        <p v-if="item.note" class="lp-label-text">{{ item.note }}</p>
      </div>
      <div class="lp-survey-choice">
        <Checkbox v-model="values[item.id]" :label="checkLabel" />
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/custom/checkbox'
import type { CheckItem } from '../composable/PC-PUB-0208'

/**
 * '해당함' 체크 하나만 붙는 문항 목록.
 * 시안은 문항 앞부분(제목)만 굵고 괄호 안 예시는 보통 글씨라 첫 괄호에서 잘라 쓴다.
 */
withDefaults(
  defineProps<{
    items: CheckItem[]
    /** 문항 id → 체크 여부. 부모의 객체를 그대로 받아 고친다 */
    values: Record<string, boolean>
    checkLabel?: string
  }>(),
  { checkLabel: '해당함' },
)

function headOf(text: string) {
  const i = text.indexOf('(')
  return i === -1 ? text : text.slice(0, i)
}
function tailOf(text: string) {
  const i = text.indexOf('(')
  return i === -1 ? '' : text.slice(i)
}
</script>
