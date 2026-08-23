<!--
  지역경찰포털 레이아웃.
  퍼블리싱 원본 html/index.html 의 .wrap 골격(본문 바로가기 / 헤더 / main / 푸터)을 담당하고,
  main 안쪽 내용은 #main 슬롯으로 라우트별 화면이 채운다.
-->
<template>
  <div class="wrap sub-page">
    <PortalHeader :show-banner="false" />
    <main class="work-main">
      <SideMenu :items="leftMenuDummyData" />
      <div class="flex-1 min-w-0 relative pr-10 flex flex-col pb-8">
         <!--
           화면 내용. .wrap 이 화면 높이로 잠겨 있으므로 넘치는 내용은 이 래퍼가 스크롤한다.
           바깥 컬럼이 아니라 안쪽 래퍼가 스크롤을 맡는 이유는, 탭 바가 컬럼에 absolute 로
           붙어 있어서 컬럼이 스크롤 컨테이너가 되면 탭 바가 내용을 따라다니며 그리드 위로
           겹쳐 올라오기 때문이다.
         -->
         <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
           <slot name="main" />
         </div>
         <!-- 컴포넌트화 작업중 -->
         <div class="absolute bottom-[7px] left-0 z-1" style="transform: translateY(100%)">
            <ul class="flex tab-ul">
              <li>메모<button class="tab-delete" aria-label="닫기"></button></li>
              <li class="active">근무일정조회<button class="tab-delete" aria-label="닫기"></button></li>
              <li>출동수당조회 <button class="tab-delete" aria-label="닫기"></button></li>
              <li>사용자 권한 권리 <button class="tab-delete" aria-label="닫기"></button></li>
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
  height: 43px;
  background: #EEF2F7;
  border-top: 1px solid #CDD1D5;
}
.tab-ul{
  height:36px;
}
.tab-ul li{
  border: 1px solid #CDD1D5;
  border-top: 0;
  padding: 2px 8px;
  border-radius: 0 0 4px 4px;
  color:var(--Text-body_2);
  line-height: 3rem;


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
