<script setup lang="ts">
import { ref } from 'vue'
import { FilterChip, FilterChipGroup, type FilterChipItem } from '@/components/custom/filter-chip'

const items: FilterChipItem[] = [
  { key: 'all', label: '전체', count: 345 },
  { key: 'unread', label: '안읽음', count: 45 },
  { key: 'read', label: '읽음', count: 300 },
]
const selected = ref('all')

const demoWithCountSelected = ref<'a' | 'b'>('b')
const demoWithoutCountSelected = ref<'a' | 'b'>('b')
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Filter Chip</h1>
          <p class="text-muted-foreground text-sm mt-1">
            버튼도 탭도 아닌, 항목 + 개수를 보여주고 선택하면 목록을 필터링하는 pill 형태 토글입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">FilterChipGroup (v-model)</h2>
          <div class="flex items-center gap-6 p-4">
            <FilterChipGroup v-model="selected" :items="items" />
          </div>
          <p class="px-4 text-sm text-muted-foreground">선택된 값: {{ selected }}</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">FilterChip - 상태(active)</h2>
          <p class="px-4 text-sm text-muted-foreground">라디오처럼 하나만 active가 됩니다(FilterChipGroup과 동일한 상호배타 동작을 보여주는 데모).</p>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <FilterChip label="전체" :count="345" :active="demoWithCountSelected === 'a'" @click="demoWithCountSelected = 'a'" />
            <FilterChip label="전체" :count="345" :active="demoWithCountSelected === 'b'" @click="demoWithCountSelected = 'b'" />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">FilterChip - 개수 없이</h2>
          <p class="px-4 text-sm text-muted-foreground">라디오처럼 하나만 active가 됩니다.</p>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <FilterChip label="라벨만" :active="demoWithoutCountSelected === 'a'" @click="demoWithoutCountSelected = 'a'" />
            <FilterChip label="라벨만" :active="demoWithoutCountSelected === 'b'" @click="demoWithoutCountSelected = 'b'" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
