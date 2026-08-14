<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, watch } from 'vue'
import { cn } from '@/lib/utils'
import SelectField from './SelectField.vue'

/**
 * 상위부서 → 하위부서 → 세부(팀) 3단 종속 선택 컴포넌트.
 * 상위 선택이 바뀌면 하위 옵션 목록이 그에 맞게 갱신되고, 값도 자동으로 첫 옵션으로 맞춰진다.
 */
export interface DepartmentNode {
  label: string
  value: string
  children?: DepartmentNode[]
}

export interface DepartmentValue {
  level1: string
  level2: string
  level3: string
}

interface Props {
  /** 선택 값 (v-model) */
  modelValue: DepartmentValue
  /** 상위부서 트리 (미지정 시 기본 목데이터 사용) */
  tree?: DepartmentNode[]
  size?: 'lg' | 'md' | 'sm' | 'xs'
  class?: HTMLAttributes['class']
  /** 각 셀렉트 트리거에 적용할 클래스 */
  selectClass?: HTMLAttributes['class']
}

const DEFAULT_TREE: DepartmentNode[] = [
  {
    label: '본청',
    value: 'hq',
    children: [
      { label: '전체', value: 'all', children: [{ label: '전체', value: 'all' }] },
    ],
  },
  {
    label: '부산청',
    value: 'busan',
    children: [
      {
        label: '부산중부서',
        value: 'busan-central',
        children: [
          { label: '전체', value: 'all' },
          { label: '1팀', value: 'team1' },
          { label: '2팀', value: 'team2' },
        ],
      },
      {
        label: '부산동부서',
        value: 'busan-east',
        children: [
          { label: '전체', value: 'all' },
          { label: '1팀', value: 'team1' },
        ],
      },
    ],
  },
  {
    label: '대구청',
    value: 'daegu',
    children: [
      {
        label: '대구중부서',
        value: 'daegu-central',
        children: [{ label: '전체', value: 'all' }],
      },
    ],
  },
]

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DepartmentValue): void
}>()

const tree = computed(() => props.tree ?? DEFAULT_TREE)

const level1Options = computed(() =>
  tree.value.map((node) => ({ label: node.label, value: node.value })),
)

const level1Node = computed(() =>
  tree.value.find((node) => node.value === props.modelValue.level1) ?? tree.value[0],
)

const level2Options = computed(() =>
  (level1Node.value?.children ?? []).map((node) => ({ label: node.label, value: node.value })),
)

const level2Node = computed(() =>
  level1Node.value?.children?.find((node) => node.value === props.modelValue.level2) ??
  level1Node.value?.children?.[0],
)

const level3Options = computed(() =>
  (level2Node.value?.children ?? []).map((node) => ({ label: node.label, value: node.value })),
)

function update(partial: Partial<DepartmentValue>) {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

function onLevel1Change(value: string | number) {
  const node = tree.value.find((n) => n.value === String(value))
  const nextLevel2 = node?.children?.[0]?.value ?? ''
  const nextLevel3 = node?.children?.[0]?.children?.[0]?.value ?? ''
  update({ level1: String(value), level2: nextLevel2, level3: nextLevel3 })
}

function onLevel2Change(value: string | number) {
  const node = level1Node.value?.children?.find((n) => n.value === String(value))
  const nextLevel3 = node?.children?.[0]?.value ?? ''
  update({ level2: String(value), level3: nextLevel3 })
}

function onLevel3Change(value: string | number) {
  update({ level3: String(value) })
}

/** 트리가 바뀌거나 초기값이 트리에 없을 때 유효한 값으로 보정 */
watch(
  () => [tree.value, props.modelValue.level1] as const,
  () => {
    if (!level1Node.value) return
    if (!level1Node.value.children?.some((n) => n.value === props.modelValue.level2)) {
      onLevel1Change(level1Node.value.value)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-3', props.class)" role="group" aria-label="부서 선택">
    <SelectField
      :model-value="modelValue.level1"
      :options="level1Options"
      :size="size"
      :trigger-class="selectClass"
      class="!space-y-0"
      aria-label="상위부서"
      @update:model-value="onLevel1Change"
    />
    <SelectField
      v-if="level2Options.length"
      :model-value="modelValue.level2"
      :options="level2Options"
      :size="size"
      :trigger-class="selectClass"
      class="!space-y-0"
      aria-label="하위부서"
      @update:model-value="onLevel2Change"
    />
    <SelectField
      v-if="level3Options.length"
      :model-value="modelValue.level3"
      :options="level3Options"
      :size="size"
      :trigger-class="selectClass"
      class="!space-y-0"
      aria-label="세부부서"
      @update:model-value="onLevel3Change"
    />
  </div>
</template>
