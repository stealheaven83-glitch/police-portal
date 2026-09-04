<template>
  <template v-for="group in groups" :key="group">
    <h4 class="lp-section-title">
      <Badge color="grayLighter" size="md">{{ group }}</Badge>
    </h4>
    <ol class="lp-survey-list lp-table-gap">
      <li v-for="item in itemsOf(group)" :key="item.id" class="lp-survey-item">
        <div>
          <p>{{ numberOf(item.id) }}. {{ item.text }}</p>
          <p v-if="item.note" class="lp-label-text">{{ item.note }}</p>
        </div>
        <RadioGroup
          :model-value="values[item.id]"
          class="lp-unit-row lp-survey-choice"
          :aria-label="`${numberOf(item.id)}번 문항`"
          @update:model-value="(v: any) => (values[item.id] = String(v))"
        >
          <RadioGroupItem value="yes" label="예" />
          <RadioGroupItem value="no" label="아니오" />
          <RadioGroupItem value="unknown" label="확인안됨" />
        </RadioGroup>
      </li>
    </ol>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/custom/badge'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import type { ScoreItem } from '../composable/PC-PUB-0208'

/** 예 / 아니오 / 확인안됨 3지선다 문항 목록. 묶음(group) 머리마다 뱃지를 얹는다 */
const props = defineProps<{
  items: ScoreItem[]
  /** 문항 id → 'yes' | 'no' | 'unknown'. 부모의 객체를 그대로 받아 고친다 */
  values: Record<string, string>
}>()

/** 등장 순서대로 묶음을 뽑는다(Set 이 삽입 순서를 지킨다) */
const groups = computed(() => [...new Set(props.items.map((i) => i.group))])

function itemsOf(group: string) {
  return props.items.filter((i) => i.group === group)
}
/** 번호는 묶음과 무관하게 1부터 이어진다(시안) */
function numberOf(id: string) {
  return props.items.findIndex((i) => i.id === id) + 1
}
</script>
