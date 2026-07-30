<script setup lang="ts">
import {
  Layout,
  Database,
  Zap,
  Files,
  Cpu,
  Package
} from 'lucide-vue-next'

const techStack = [
  { name: 'Vue 3', version: '^3.5.24', category: 'Framework' },
  { name: 'TypeScript', version: '~5.9.3', category: 'Language' },
  { name: 'Vite', version: '^7.2.4', category: 'Build Tool' },
  { name: 'Tailwind CSS', version: '^4.1.18', category: 'Styling' },
  { name: 'Pinia', version: '^3.0.4', category: 'State' },
  { name: 'shadcn-vue', version: '-', category: 'UI' },
]

const features = [
  {
    title: 'State Management',
    description: 'Pinia 기반 글로벌 상태 및 데이터 영속화',
    icon: Database
  },
  {
    title: 'UI Components',
    description: 'shadcn-vue 기반의 일관된 UI 구성 요소',
    icon: Layout
  },
  {
    title: 'API Integration',
    description: 'Axios Helper를 통한 표준화된 통신 구조',
    icon: Zap
  }
]
</script>

<template>
  <div class="max-w-5xl mx-auto py-12 px-6 space-y-20">
    <!-- Header -->
    <header class="space-y-4 border-b pb-12 border-slate-100">
      <h1 class="text-4xl font-bold text-slate-900 tracking-tight">
        Vue Starter Project
      </h1>
      <p class="text-lg text-slate-500 leading-relaxed max-w-3xl">
        DKI DSBP 웹 애플리케이션 개발을 위한 Vue 3 기반 스타터 템플릿입니다.
        표준화된 통신, 상태 관리 및 UI 구성을 미리 구축하여 프로젝트 시작을 지원합니다.
      </p>
    </header>

    <div class="grid md:grid-cols-2 gap-16 items-start">
      <!-- Technical Stack -->
      <section class="space-y-8">
        <div class="flex items-center gap-2 text-slate-800 border-l-4 border-blue-500 pl-3">
          <Cpu class="w-6 h-6 text-blue-500" />
          <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Technical Stack</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="tech in techStack" :key="tech.name"
            class="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-slate-200 transition-all">
            <div class="space-y-0.5">
              <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">{{ tech.category }}</div>
              <div class="text-lg font-bold text-slate-700">{{ tech.name }}</div>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              {{ tech.version }}
            </span>
          </div>
        </div>
      </section>

      <!-- Key Implementation -->
      <section class="space-y-8">
        <div class="flex items-center gap-2 text-slate-800 border-l-4 border-emerald-500 pl-3">
          <Package class="w-6 h-6 text-emerald-500" />
          <h2 class="text-3xl font-bold tracking-tight">Core Implementation</h2>
        </div>
        <div class="space-y-6">
          <div v-for="feature in features" :key="feature.title" class="flex items-start gap-4 p-1 group">
            <div
              class="mt-1 p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-bold text-slate-800">{{ feature.title }}</h3>
              <p class="text-base text-slate-500 leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Samples Link -->
    <section class="bg-slate-50 rounded-2xl p-8 border border-slate-100">
      <div class="flex flex-col md:flex-row md:items-center gap-8">
        <div class="flex-1 space-y-4">
          <div class="flex items-center gap-2 text-slate-800">
            <Files class="w-6 h-6 text-slate-600" />
            <h2 class="text-3xl font-bold tracking-tight text-slate-800">Samples & Documentation</h2>
          </div>
          <p class="text-lg text-slate-500 leading-relaxed">
            좌측 네비게이션 메뉴를 통해 본 프로젝트에 적용된 주요 UI 컴포넌트와 API 구현 샘플을 즉시 확인할 수 있습니다.
            다양한 다이얼로그 패턴과 Axios 기반 통신 구조를 참고하여 개발을 진행하세요.
          </p>
        </div>
        <div class="flex flex-col gap-3 min-w-[200px]">
          <div
            class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
            <div class="w-2 h-2 rounded-full bg-blue-400"></div> UI Component Samples
          </div>
          <div
            class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div> API Call Examples
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs">
      <p>&copy; 2026 DKI Technology Services. Starter V3</p>
      <div class="flex gap-4">
        <span>Build with Vue 3 + Vite</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 담백함을 유지하기 위해 추가 스타일 최소화 */
</style>
