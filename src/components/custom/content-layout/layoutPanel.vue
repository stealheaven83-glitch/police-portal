<template>
  <!--
    분할 레이아웃(LayoutSplite) 한 칸을 채우는 패널.
    제목 줄 + 본문으로 이루어진 같은 구조가 화면마다 반복돼서 공통으로 뺐다.
    본문은 남는 높이를 flex 로 채우므로 안쪽 그리드에 height="100%" 를 주면 딱 맞는다.
  -->
  <section class="layoutPanel" :aria-labelledby="titleId">
    <LayoutHeader :title="title" :as="as" :title-id="titleId">
      <template v-if="$slots.center" #center>
        <slot name="center" />
      </template>
      <template v-if="$slots.actions" #right>
        <slot name="actions" />
      </template>
    </LayoutHeader>
    <div
      ref="bodyRef"
      class="layoutPanelBody"
      :class="{ 'no-padding': noPadding, 'has-scroll': isScrollable }"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import LayoutHeader from './layoutHeader.vue'
import { useIsScrollable } from '@/composable/scroll/useIsScrollable'

interface Props {
  /** 패널 제목. section 의 접근성 이름으로도 쓰인다 */
  title: string
  /** 제목 태그. 화면 제목(h1) 바로 아래 영역이면 기본값 h2 그대로 둔다 */
  as?: 'h2' | 'h3' | 'h4'
  /** 본문 안쪽 여백을 없앤다. 그리드가 패널 가장자리까지 붙어야 하는 화면에서만 준다 */
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  as: 'h2',
  noPadding: false,
})

const bodyRef = ref<HTMLElement | null>(null)
const isScrollable = useIsScrollable(bodyRef);


/** section 이 제목을 가리키게 할 id. 같은 화면에 패널이 여러 개여도 겹치지 않는다 */
const titleId = useId()
</script>

<style scoped>
.layoutPanel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/*
 * 제목 줄을 뺀 나머지를 본문이 차지한다. 안쪽 내용(그리드 등)이 스스로 스크롤하므로
 * 본문은 넘치는 부분을 잘라만 둔다. min-height:0 이 없으면 flex 아이템이 내용 높이만큼
 * 부풀어 pane 밖으로 넘친다.
 */
.layoutPanelBody {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
  padding: 2rem;
}

/* 호출부가 :no-padding 으로 켠다. 기본은 위 padding 그대로 */
.layoutPanelBody.no-padding {
  padding: 0;
}
.layoutPanelBody.has-scroll {
  padding-right: 1rem;
}

@media (max-width: 48rem) {
  .layoutPanelBody {
    padding: 1.2rem;
  }
}
</style>
