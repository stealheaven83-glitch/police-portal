<!--
  지역경찰포털 레이아웃.
  퍼블리싱 원본 html/index.html 의 .wrap 골격(본문 바로가기 / 헤더 / main / 푸터)을 담당하고,
  main 안쪽 내용은 #main 슬롯으로 라우트별 화면이 채운다.
-->
<template>
  <div class="wrap sub-page">
    <PortalHeader :show-banner="false" />
    <main class="work-main">
      <SideMenu v-if="sideMenuStore.visible" />
      <div class="flex-1 min-w-0 relative pr-10 flex flex-col pb-[4px]">
         <!--
           화면 내용. .wrap 이 화면 높이로 잠겨 있으므로 넘치는 내용은 이 래퍼가 스크롤한다.
           바깥 컬럼이 아니라 안쪽 래퍼가 스크롤을 맡는 이유는, 탭 바가 컬럼에 absolute 로
           붙어 있어서 컬럼이 스크롤 컨테이너가 되면 탭 바가 내용을 따라다니며 그리드 위로
           겹쳐 올라오기 때문이다.
         -->
         <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
           <slot name="main" />
         </div>
         <!-- 하단 동적 탭. 목록은 화면(View)의 useBottomTabSetup 이 채운다 -->
         <BottomTab v-if="bottomTabStore.visible" />
      </div>
        
    </main>
  </div>
</template>

<script setup lang="ts">
import PortalHeader from '../portal/PortalHeader.vue'
import { SideMenu } from '@/components/custom/sidemenu/index.ts'
import { BottomTab } from '@/components/custom/bottom-tab'
import { useBottomTabStore } from '@/stores/tab/useBottomTab'
import { useSideMenuStore } from '@/stores/menu/useSideMenu'

const bottomTabStore = useBottomTabStore()
const sideMenuStore = useSideMenuStore()

defineSlots<{
  main: () => any
}>()

</script>

<style scoped>
/*
 * 화면 높이에 잠긴 껍데기. 넘치는 내용은 본문 래퍼가 스크롤하고 문서는 스크롤하지 않는다.
 * overflow:hidden 은 그 규칙을 보장하는 장치다. 이게 없으면 탭 바처럼 박스 밖으로
 * 밀어낸 요소가 문서 높이를 늘려 스크롤바가 하나 더 생긴다.
 * (모달·셀렉트 등 떠 있는 UI 는 body 로 teleport 되므로 잘리지 않는다)
 *
 * dvh 는 모바일 주소창이 접혔다 펴질 때 실제 보이는 높이를 따라간다.
 * 100vh 로만 두면 하단에 고정한 탭 바가 주소창 뒤로 숨는다.
 */
.wrap{
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.work-main{
  height: 0;
  display: flex;
  padding-bottom: 36px;
  position: relative;
  flex: 1;
}
.work-main:after{
  content: '';
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: #EEF2F7;
  border-top: 1px solid #CDD1D5;
}
/* 탭 바 자체의 스타일은 BottomTab.vue 가 들고 있다 */
</style>
