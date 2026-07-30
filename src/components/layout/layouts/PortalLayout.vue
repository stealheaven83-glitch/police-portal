<!--
  지역경찰포털 레이아웃.
  퍼블리싱 원본 html/index.html 의 .wrap 골격(본문 바로가기 / 헤더 / main / 푸터)을 담당하고,
  main 안쪽 내용은 #main 슬롯으로 라우트별 화면이 채운다.
-->
<template>
  <div class="wrap">
    <!-- 본문 바로가기 영역 -->
    <div class="skip-nav">
      <a href="#breadCrumb">본문 바로가기</a>
    </div>
    <!-- //본문 바로가기 영역 -->

    <PortalHeader />

    <main>
      <slot name="main" />
    </main>

    <PortalFooter />
  </div>
</template>

<script setup lang="ts">
import PortalHeader from '../portal/PortalHeader.vue'
import PortalFooter from '../portal/PortalFooter.vue'

defineSlots<{
  main: () => any
}>()
</script>
