<template>
  <GenericDialog2
    :open="open"
    title="음성인식"
    type="full"
    :show-footer="phase === 'result'"
    @update:open="onUpdateOpen"
  >
    <div class="lp-voice-search">
      <img class="lp-voice-search-img" src="/portal/asset/images/img/img_voice_mic.png" alt="" />

      <div class="lp-voice-search-body">
        <p class="lp-voice-search-text">{{ text }}</p>
        <!-- 상태가 바뀌는 자리라 스크린리더에도 읽히게 한다 -->
        <p class="lp-voice-search-status" aria-live="polite">{{ statusText }}</p>
      </div>
    </div>

    <template #footer>
      <Button variant="tertiary2" size="md" @click="onRetry">다시시도</Button>
      <Button variant="primary" size="md" @click="onSearch">검색</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'

/**
 * 음성인식 팝업 — 한 팝업이 두 화면ID를 겸한다.
 *   phase 'listening' → PM-IRC-0102 음성인식 진행중 (Figma MO 14958:133267)
 *   phase 'result'    → PM-IRC-0103 음성인식 결과   (Figma MO 14958:133367)
 * 두 시안이 마이크·인식문구까지 같고 아래 버튼줄 유무만 다르다 — 팝업을 닫았다 여는 게 아니라
 * 열린 채로 상태가 넘어가는 자리라 컴포넌트 하나로 둔다.
 *
 * `type="full"` 은 모바일 폭(<1000px)에서만 전체화면이 된다(device 기본값 responsive).
 * 이 팝업을 여는 음성검색 버튼 자체가 모바일 폭에서만 보인다 — police-style.css 미디어쿼리.
 *
 * 검색화면(PM-IRC-0101)과 결과화면(PM-IRC-0104) 둘 다 SearchBar 의 음성검색 버튼을 갖고 있어
 * 어느 화면 폴더에도 속하지 않는다 — 도메인 레벨에 둔다(docs/create/multi-route.md §1 과 같은 이유).
 *
 * 실제 음성인식(마이크 권한·STT·대기시간 초과 처리)은 개발팀이 잇는다. 여기서는 시안의 두
 * 상태가 보이도록 목업 타이머로 넘어간다.
 */
const props = withDefaults(
  defineProps<{
    /** v-model:open */
    open: boolean
    /** 인식된 말 — 개발팀이 STT 결과를 넣는다. 여기서는 시안 문구가 기본값이다 */
    text?: string
    /** 진행중 → 결과로 넘어가는 목업 대기시간(ms) */
    listenMs?: number
  }>(),
  {
    text: '가정폭력 신고 접수 시 조치절차 알려줘',
    listenMs: 2000,
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'search', value: string): void
}>()

const phase = ref<'listening' | 'result'>('listening')
let listenTimer = 0

const statusText = computed(() =>
  phase.value === 'listening' ? '음성인식 중입니다.' : '위 내용으로 검색하시겠습니까?',
)

/** 목업: 잠시 뒤 '결과' 상태로 넘어간다. 실제로는 STT 종료 시점에 개발팀이 바꾼다 */
function startListening() {
  phase.value = 'listening'
  window.clearTimeout(listenTimer)
  listenTimer = window.setTimeout(() => {
    phase.value = 'result'
  }, props.listenMs)
}

function stopListening() {
  window.clearTimeout(listenTimer)
  listenTimer = 0
}

watch(
  () => props.open,
  (value) => {
    if (value) {
      startListening()
    } else {
      stopListening()
    }
  },
  { immediate: true },
)

function onUpdateOpen(value: boolean) {
  emit('update:open', value)
}

/** 다시시도 — 같은 팝업 안에서 '진행중' 으로 되돌린다 */
function onRetry() {
  startListening()
}

/** 검색 — 팝업을 닫고 인식된 말로 화면 검색을 실행한다 */
function onSearch() {
  emit('update:open', false)
  emit('search', props.text)
}
</script>
