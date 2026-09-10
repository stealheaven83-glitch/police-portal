<template>
  <!-- 오른쪽에 넣을 게 있을 때만 양끝 정렬(space-between). 문구만 있으면 police-style 의 .list-actions 기본 정렬 -->
  <div :class="cn('list-actions', $slots.default && 'space-between', props.class)">
    <p class="form-note end">
      * 개인정보를 공무수행 목적외 사적으로 조회 또는 유출하여 타인의 비밀을 침해하거나 누설할 경우
      <span class="notice-strong">5년이하의 징역 또는 5천만원 이하의 벌금</span>에 처해집니다.
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/**
 * 개인정보 오남용 경고 문구 줄. 검색영역 아래·본문 위에 놓는다.
 * 기본 슬롯에 버튼을 넣으면 문구는 왼쪽, 버튼은 오른쪽으로 벌어진다(PC-LPO-0801 / PC-STT-0103 의 '저장').
 * 문구만 쓰는 화면(PC-PUB-0208, PM-PUB-0201/0202)은 슬롯을 비운다.
 * 스타일은 police-style.css 의 .list-actions / .form-note.end / .notice-strong 그대로 — 새 CSS 없음.
 */
interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>
