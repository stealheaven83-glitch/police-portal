<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import styles from './InfoTable.module.css'

/**
 * 등록/상세 화면에서 반복되는 "라벨-값" 정보 표.
 * 내용(필드 구성)은 모르지만 레이아웃(그리드, 반응형 collapse)은 반복되는 부분이라
 * 이 컴포넌트로 분리하고, 실제 필드는 페이지에서 <InfoField> 로 채워 넣는다.
 * - columns: 한 행에 라벨+값 쌍을 몇 개 나란히 둘지(1~4). 표가 넓은 화면(전체 폭 페이지)이면 2,
 *   좁은 패널(2단 레이아웃의 한쪽 등)에 쓰면 1로 — 그렇지 않으면 값 영역이 너무 좁아져 내용이 겹친다.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  columns?: 1 | 2 | 3 | 4
  /** 팝업(다이얼로그) 안에 놓일 때 위쪽 여백을 준다 */
  popup?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2,
  popup: false,
})

const COLUMN_CLASS = {
  1: styles.cols1,
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
} as const

const columnsClass = computed(() => COLUMN_CLASS[props.columns] ?? styles.cols2)
</script>

<template>
  <div :class="cn(styles.grid, columnsClass, { [styles.popTable]: popup })" v-bind="$attrs">
    <slot />
  </div>
</template>
