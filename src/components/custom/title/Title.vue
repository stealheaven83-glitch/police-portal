<script setup>
import PageHeader from '@/components/custom/title/PageHeader.vue';
import PageTitle from '@/components/custom/title/PageTitle.vue';
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue';

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전', path: '/safety' },
  { label: '범죄예방진단', path: '/safety/crime' }
];
</script>

<template>
  <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)]">
    <div class="flex justify-between items-center mb-6 ">
      <h1 class="text-2xl font-bold ">Title 샘플</h1>
    </div>    
    <div class="text-gray-500 pb-10">
        Title 컴포넌트 사용 예시 페이지입니다
    </div>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b">기본 조합(본문)</h2>
        <PageHeader>
          <template #left>
            <PageTitle title="간소화 입력 · 관리" />
          </template>
          <template #right>
            <Breadcrumb :items="navItems" />
          </template>
        </PageHeader>
    </section>
    <section class="mt-10">
      <h2 class="text-xl font-semibold border-b mt-8 mb-9">팝업 헤더</h2>
      <div class="pop-title">
        <h1>공지팝업</h1>
      </div>
      <div class="pop-title-sub">
        <h2>서브타이틀</h2>
      </div>
      <div class="pop-title-lv2">
        <h3>서브- 서브 타이틀</h3>
      </div>
    </section>
      <!-- <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b">기본 조합(팝업)</h2>
      </section> -->
  </div>
</template>
