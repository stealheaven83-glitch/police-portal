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
  <h1>잉</h1>
</template>

<style scoped>
/* 담백함을 유지하기 위해 추가 스타일 최소화 */
</style>
