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
  /**
   * 모바일(폭 1600 미만)에서의 열 수. PC 는 `columns` 로 2단이어도 `mo-columns="1"` 을 주면
   * 모바일에서 한 줄에 한 칸씩 선다.
   *
   * 안 주면 기존 동작 그대로다 — 1000px 미만에서만 1단으로 접힌다. 즉 1600~1000 구간은
   * 페이지가 모바일인데 표만 2단으로 남는데, 그게 싫은 표에서 이걸 준다.
   * 칸 안에서 라벨을 값 위로 올리는 건 `InfoField` 의 `mo="col"` 이다(다른 축).
   */
  moColumns?: 1 | 2 | 3
  /** 팝업(다이얼로그) 안에 놓일 때 위쪽 여백을 준다 */
  popup?: boolean
  /**
   * 라벨 열 폭. 시안 치수를 그대로 옮길 수 있게 **숫자는 px** 로 본다.
   * - `size="200"` / `:size="200"` → 200px
   * - 단위를 붙이면 그 CSS 길이 그대로 — `size="14rem"` / `size="25%"`
   * 안 주면 CSS 기본값 14rem(140px)을 쓴다.
   */
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2,
  popup: false,
  size: undefined,
})

const COLUMN_CLASS = {
  1: styles.cols1,
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
} as const

const MO_COLUMN_CLASS = {
  1: styles['grid-mo-cols1'],
  2: styles['grid-mo-cols2'],
  3: styles['grid-mo-cols3'],
} as const

const columnsClass = computed(() => COLUMN_CLASS[props.columns] ?? styles.cols2)

/** 안 주면 undefined — 아무 클래스도 안 붙어 기존 동작(1000px 에서 1단)이 그대로다 */
const moColumnsClass = computed(() =>
  props.moColumns ? MO_COLUMN_CLASS[props.moColumns] : undefined,
)

/**
 * 라벨 열 폭은 InfoField(.field)가 var(--info-label-w) 로 읽는다.
 * CSS 변수는 상속되므로 표 루트에 한 번만 얹으면 안쪽 모든 칸에 적용된다.
 * prop 을 안 주면 아무것도 얹지 않아 기존 동작(CSS 기본값 14rem, 호출부 클래스 오버라이드)이 그대로다.
 */
const rootStyle = computed(() => {
  if (props.size === undefined || props.size === '') return undefined
  // size="200" 처럼 속성으로 넘기면 문자열 "200" 이 오므로 숫자 문자열도 px 로 본다
  const isBareNumber = typeof props.size === 'number' || /^\d+(\.\d+)?$/.test(props.size)
  const width = isBareNumber ? `${props.size}px` : props.size
  return { '--info-label-w': width }
})
</script>

<template>
  <div
    :class="cn(styles.grid, columnsClass, moColumnsClass, { [styles.popTable]: popup })"
    v-bind="$attrs"
    :style="rootStyle"
  >
    <slot />
  </div>
</template>
