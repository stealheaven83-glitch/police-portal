<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 아직 만들지 않은 화면 자리에 대신 뜨는 화면.
 *
 * router/plannedRoutes.ts 가 화면 폴더가 없는 화면ID 에 이 컴포넌트를 붙인다.
 * 폴더(`views/{도메인}/{화면ID}/{화면ID}.vue`)가 생기면 라우터를 고치지 않아도
 * 자동으로 진짜 화면으로 바뀐다.
 */
defineOptions({ name: 'NotReady' })

const route = useRoute()

const screenId = computed(() => String(route.name ?? ''))
const title = computed(() => String(route.meta?.title ?? ''))
/** 이 화면ID 로 만들어야 할 파일 경로 — 만드는 사람이 바로 복사해 쓸 수 있게 보여준다 */
const expectedPath = computed(() => {
  const domain = screenId.value.split('-')[1]?.toLowerCase() ?? ''
  return `src/views/${domain}/${screenId.value}/${screenId.value}.vue`
})
</script>

<template>
  <div class="layout-wrap">
    <p class="pop-title-lv2">{{ title || screenId }}</p>
    <p class="form-note">아직 작업하지 않은 화면입니다.</p>
    <p class="form-note">
      <span class="dept-name">화면ID</span> {{ screenId }}
    </p>
    <p class="form-note">
      <span class="dept-name">만들 파일</span> {{ expectedPath }}
    </p>
  </div>
</template>
