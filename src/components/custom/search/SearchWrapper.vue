<template>
  <div class="mb-[20px]">
    <div class="w-full flex justify-between items-center">
      <div v-if="hasDepartment || collapsible" class="flex items-center gap-6">
          <div :class="cn('flex items-center gap-3', props.departmentClass)">
            <slot name="department" />
          </div>
          <button
            v-if="collapsible"
            type="button"
            class="inline-flex items-center gap-1 shrink-0 text-[15px] font-semibold text-[var(--Text-body_1)]"
            :aria-expanded="expanded"
            @click="toggle"
          >
            상세조회 
            <ChevronDown :size="14" class="transition-transform duration-200" :class="expanded ? 'rotate-180' : ''" />
          </button>
      </div>
      <slot name="topRightSection"></slot>
    </div>
    <div v-if="formOnly || collapsible" v-show="formOnly || expanded" :class="cn(defaultClass, (formOnly ? '' : 'mt-[20px]'), props.class)">
      <div class="flex flex-col justify-center py-5 px-6">
        <slot name="form" />
      </div>
      <div class="flex items-end py-5 px-6">
        <slot name="btns" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useSlots } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
  /** true면 부서 선택 행 옆에 '상세조회 열기/닫기' 토글 버튼을 표시하고 form 슬롯을 접었다 펼 수 있게 함 */
  collapsible?: boolean
  /** department 슬롯을 감싸는 div에 적용할 클래스 (기본 'flex items-center gap-4' 를 덮어쓰고 싶을 때) */
  departmentClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
})

const slots = useSlots()

/** 부모가 #department 를 넘겼는가 */
const hasDepartment = computed(() => !!slots.department)
/** 부모가 #form 을 넘겼는가 */
const hasForm = computed(() => !!slots.form)
/** department 없이 form 만 있는 화면 — 접기 없이 항상 펼쳐 둔다 */
const formOnly = computed(() => !hasDepartment.value && hasForm.value)

/** form 슬롯(상세조회 영역) 펼침 상태. v-model:expanded 로 상위에서 제어 가능 */
const expanded = defineModel<boolean>('expanded', { default: false })

function toggle() {
  expanded.value = !expanded.value
}

const defaultClass = 'w-full flex justify-between items-stretch bg-[var(--Background-gray01)] rounded-[12px]'
</script>



<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
