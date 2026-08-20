<!--
  지역경찰포털 레이아웃.
  퍼블리싱 원본 html/index.html 의 .wrap 골격(본문 바로가기 / 헤더 / main / 푸터)을 담당하고,
  main 안쪽 내용은 #main 슬롯으로 라우트별 화면이 채운다.
-->
<template>
  <div class="wrap sub-page">
    <PortalHeader />
    <main class="work-main flex pb-9 relative flex-1">
      <SideMenu :items="leftMenuDummyData" />
      <div class="flex-1 min-w-0 relative pr-10">
         <slot name="main" />
         <!-- 컴포넌트화 작업중 -->
         <div class="absolute bottom-0 left-0 z-1" style="transform: translateY(100%)">
            <ul class="flex tab-ul">
              <li>1</li>
              <li class="active">2</li>
              <li>3</li>
              <li>4</li>
            </ul>
         </div>
         <!--// 컴포넌트화 작업중 -->
      </div>
        
    </main>
  </div>
</template>

<script setup lang="ts">
import PortalHeader from '../portal/PortalHeader.vue'
import { SideMenu } from '@/components/custom/sidemenu/index.ts'

defineSlots<{
  main: () => any
}>()

const leftMenuDummyData = [
  {
    name: '개인수첩',
    children: [
      { name: '메모' },
      { name: '근무일정 조회' },
      { name: '사고자/자원근무 신청' },
      { name: '출동수당' },
    ]
  },
  {
    name: '근무일지',
    children: [
      { name: '근무일지(甲)' },
      { name: '근무일지(乙)' },
      { name: '월간근무표' },
    ]
  },
  {
    name: '인수인계',
    children: [
      { name: '인수인계 작성' },
      { name: '차량점검' },
      { name: '인수인계 현황' },
    ]
  },
  {
    name: '출동수당',
    children: [
      { name: '출동수당 조회' },
      { name: '승인관리' },
    ]
  },
  { name: '관내현황' },
  { name: '개인장비' },
  { name: '인사관리' },
]
</script>

<style scoped>
.wrap{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

.tab-ul li{
  border: 1px solid #CDD1D5;
  border-top: 0;
  padding: 2px 10px;
  border-radius: 0 0 4px 4px;
}
.tab-ul li.active{
  background: #fff;
  border-top: 1px solid #fff;
  box-shadow: 1px 2px 2px 0px #00000014;
}
.tab-ul li + li{
  margin-left: 2px;
}
</style>
