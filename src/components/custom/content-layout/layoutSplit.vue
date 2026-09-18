<template>
  <!-- class="default-theme" 는 splitpanes 기본 테마라 빼면 스플릿 바 형태가 깨집니다 -->
  <splitpanes
    ref="rootRef"
    class="default-theme splitLayout"
    :class="cn(defaultClass, !props.resizable && 'splitpanes--fixed', props.class)"
    :horizontal="isHorizontal"
    :maximize-panes="props.resizable && !isStacked"
  >
    <slot>
      <template v-for="i in props.count" :key="i">
        <pane
          v-if="$slots[`layout-${i}`]"
          :size="paneSize(i)"
          :min-size="minSizeOf(i)"
          :max-size="props.maxWidths?.[i - 1]"
        >
          <slot :name="`layout-${i}`" />
        </pane>
      </template>
    </slot>
  </splitpanes>
</template>

<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { useMediaQuery, useElementSize } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Splitpanes, Pane } from 'splitpanes'
// CSS 파일을 반드시 불러와야 스플릿 바 형태가 깨지지 않고 제대로 보입니다!
import 'splitpanes/dist/splitpanes.css'
const defaultClass = 'w-full p-0'
interface Props {
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
  /** pane 개수. 각 pane은 layout-1, layout-2 ... layout-{count} 슬롯으로 채웁니다 */
  count?: number
  /** 각 pane의 처음 로드시 기본 width(%). 인덱스는 pane 순서(0 = layout-1)와 대응하며, 값이 없으면 기존과 동일하게 자동 분배됩니다 */
  widths?: number[]
  /** 각 pane의 최소 width(%). 값을 주지 않으면 첫 번째 pane만 20%가 적용됩니다 */
  minWidths?: (number | undefined)[]
  /**
   * 각 pane의 최소 width(px). splitpanes 는 % 만 받으므로 컨테이너 폭을 재서 % 로 환산합니다(창 크기가 바뀌면 따라감).
   * 숫자를 준 pane 은 minWidths(%) 보다 우선하고, 'auto' 나 빈 값은 minWidths(%) 로 넘어갑니다.
   * 예: :min-widths-px="['auto', 380]" → 두 번째 pane 만 380px 제한
   */
  minWidthsPx?: (number | 'auto' | undefined)[]
  /** 각 pane의 최대 width(%). minWidths와 같은 값을 주면 해당 pane만 사이즈가 고정됩니다 */
  maxWidths?: (number | undefined)[]
  /**
   * true 면 스플리터 드래그/더블클릭 최대화로 pane 사이즈를 바꿀 수 있습니다. 기본은 false(고정) —
   * 사이즈 조절이 필요한 화면만 `resizable` 을 켭니다(2026-09-18 기본값 true → false).
   */
  resizable?: boolean
  /**
   * true 면 화면 폭과 무관하게 pane 을 위아래로 쌓고 구분선을 상하로 드래그해 높이를 조절합니다.
   * 이때 widths / minWidths / minWidthsPx / maxWidths 는 그대로 높이(%·px) 로 쓰입니다.
   * 다른 분할의 pane 안에 넣을 때는 `.lp-split-nested`(police-override.css) 를 함께 줘서 테두리·높이를 pane 에 맞춥니다.
   */
  horizontal?: boolean
}
const props = withDefaults(defineProps<Props>(), { count: 1, resizable: false, horizontal: false })

/*
 * 좁은 화면에서는 pane 을 좌우로 두면 각 pane 이 글자 몇 자 폭밖에 안 남는다.
 * 사이드메뉴가 사라지는 지점과 같은 폭에서 위아래로 쌓아 각 pane 이 전체 폭을 쓰게 한다.
 * (미디어쿼리의 rem 은 html font-size 가 아니라 초기값 16px 기준이라 CSS 쪽과 값을 맞춘다)
 */
const isStacked = useMediaQuery('(max-width: 82rem)')

/** 위아래 배치 — 호출부가 horizontal 로 고정했거나, 좁은 화면이라 자동으로 쌓인 경우 */
const isHorizontal = computed(() => props.horizontal || isStacked.value)

/**
 * 좁은 화면 때문에 쌓인 상태에서는 가로 비율이 의미가 없어 pane 을 균등 높이로 나눈다.
 * 호출부가 horizontal 로 고정한 분할은 처음부터 높이 비율이므로 widths 를 그대로 쓴다.
 */
const useGivenSizes = computed(() => props.horizontal || !isStacked.value)
const paneSize = (i: number) => (useGivenSizes.value ? props.widths?.[i - 1] : undefined)

/** px 최소값을 % 로 환산할 기준 — splitpanes 루트 요소의 실제 폭(위아래 배치면 높이) */
const rootRef = ref<InstanceType<typeof Splitpanes> | null>(null)
const { width: rootWidth, height: rootHeight } = useElementSize(rootRef)
const rootExtent = computed(() => (isHorizontal.value ? rootHeight.value : rootWidth.value))

// minWidths/minWidthsPx 를 안 넘긴 기존 사용처는 첫 번째 pane 20% 제한을 그대로 유지합니다.
const minSizeOf = (i: number) => {
  if (!useGivenSizes.value) return undefined
  const px = props.minWidthsPx?.[i - 1]
  // 폭을 아직 못 쟀을 때(0)는 % 로 넘어간다 — 0 으로 나누면 Infinity 가 되어 pane 이 잠긴다
  if (typeof px === 'number' && rootExtent.value > 0) return (px / rootExtent.value) * 100
  const hasAnyMin = props.minWidths || props.minWidthsPx
  return props.minWidths?.[i - 1] ?? (hasAnyMin ? undefined : (i === 1 ? 20 : undefined))
}
</script>

<style scoped>
@reference "@/assets/css/style.css";

/*
 * 높이·상단여백은 인라인 style 대신 여기서 잡는다. 화면마다 값이 달라야 하면
 * 호출부가 module.css 클래스로 CSS 변수를 덮어쓴다.
 * (police-style.css 같은 @layer 안에서는 이 스코프 스타일을 못 이긴다 — 레이어 없는
 *  선언이 항상 우선하므로, 바깥에서 규칙으로 덮으려 하지 말고 변수를 쓴다)
 *
 *   .tightSplit { --split-margin-top: 0; --split-height: 110rem; }
 *   <LayoutSplite :class="styles.tightSplit" />
 *
 * 테두리·모서리도 변수다 — 다른 분할의 pane 안에 중첩할 때 바깥 테두리와 겹치지 않게
 * 호출부가 0 으로 덮는다(.lp-split-nested, police-override.css).
 */
.splitLayout {
  height: var(--split-height, 90rem);
  border: var(--split-border, 1px solid var(--Border_gray0));
  /* border-bottom: 0; */
  border-radius: var(--split-radius, 1rem);
  overflow: hidden;
}

/* 위아래로 쌓이면 pane 하나가 가로 전체를 쓰는 대신 세로 공간이 더 필요하다 */
@media (max-width: 82rem) {
  .splitLayout {
    height: var(--split-height-stacked, 120rem);
  }
}

:deep(.splitpanes__pane) {
  background-color: transparent !important;
}

:deep(.splitpanes__splitter) {
  border-left:1px solid var(--Border_gray0)!important;
  border: 1px solid var(--Border_gray0);
}

/* 사이즈 조절 비활성화: 구분선은 그대로 두고 드래그만 막습니다.
   자식 결합자(>)여야 pane 안에 중첩한 분할의 구분선까지 같이 잠기지 않는다 */
.splitpanes--fixed > :deep(.splitpanes__splitter) {
  pointer-events: none;
  cursor: default;
}
</style>
