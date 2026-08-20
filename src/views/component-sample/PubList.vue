<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">퍼블 목록</h1>
      </div>

      <div class="text-gray-500 pb-6">
        스마트워크 IA(요구사항 추가) 문서를 기준으로 정리한 퍼블리싱 대상 화면 목록입니다.
        화면이 실제로 작업되면 순차적으로 링크를 연결할 예정이며, 현재는 <b>{{ linkedCount }}</b>건이 연결되어 있습니다.
      </div>

      <!-- 필터 영역 -->
      <section class="flex flex-wrap items-center gap-3 pb-4">
        <BaseSelect
          v-model="selectedMajor"
          :options="majorOptions"
          placeholder="대분류"
          width-class="w-[160px]"
        />
        <BaseSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="작업상태"
          width-class="w-[140px]"
        />
        <Input
          v-model="keyword"
          placeholder="화면명 / 화면ID / 분류로 검색"
          class="w-[280px]"
        />
        <span class="text-sm text-gray-400">
          총 {{ filteredItems.length }}건 (전체 {{ pubListItems.length }}건)
        </span>
      </section>

      <!-- 목록 테이블 -->
      <div class="overflow-x-auto border rounded-md">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="border px-3 py-2 w-16 text-center">순번</th>
              <th class="border px-3 py-2 w-28">대분류</th>
              <th class="border px-3 py-2 min-w-[220px]">분류</th>
              <th class="border px-3 py-2 min-w-[200px]">화면명</th>
              <th class="border px-3 py-2 w-32">화면ID</th>
              <th class="border px-3 py-2 w-20 text-center">유형</th>
              <th class="border px-3 py-2 w-20 text-center">구분</th>
              <th class="border px-3 py-2 w-24 text-center">작업상태</th>
              <th class="border px-3 py-2 min-w-[160px]">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.no" class="hover:bg-gray-50/60">
              <td class="border px-3 py-2 text-center text-gray-400">{{ item.no }}</td>
              <td class="border px-3 py-2">{{ item.major }}</td>
              <td class="border px-3 py-2 text-gray-600">{{ item.sub ?? '-' }}</td>
              <td class="border px-3 py-2">
                <RouterLink
                  v-if="item.route"
                  :to="item.route"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {{ item.name }}
                </RouterLink>
                <span v-else>{{ item.name }}</span>
                <div v-if="item.screenName && item.screenName !== item.name" class="text-xs text-gray-400">
                  {{ item.screenName }}
                </div>
              </td>
              <td class="border px-3 py-2 font-mono text-xs">{{ item.screenId ?? '-' }}</td>
              <td class="border px-3 py-2 text-center">{{ item.type }}</td>
              <td class="border px-3 py-2 text-center">{{ item.change }}</td>
              <td class="border px-3 py-2 text-center">
                <Badge v-if="item.route" color="success" size="md">완료</Badge>
                <Badge v-else color="grayLighter" variant="outline" size="md">작업전</Badge>
              </td>
              <td class="border px-3 py-2 text-gray-500 text-xs">{{ item.note ?? '' }}</td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="9" class="border px-3 py-10 text-center text-gray-400">
                조건에 맞는 화면이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseSelect from '@/components/select/BaseSelect.vue'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/custom/badge'
import { pubListItems, pubListMajors } from './pubListData'

const majorOptions = [
  { label: '전체 대분류', value: 'ALL' },
  ...pubListMajors.map((major) => ({ label: major, value: major })),
]

const statusOptions = [
  { label: '전체 상태', value: 'ALL' },
  { label: '완료', value: 'LINKED' },
  { label: '작업전', value: 'PENDING' },
]

const selectedMajor = ref<string>('ALL')
const selectedStatus = ref<string>('ALL')
const keyword = ref('')

const linkedCount = computed(() => pubListItems.filter((item) => item.route).length)

const filteredItems = computed(() => {
  const kw = keyword.value.trim().toLowerCase()

  return pubListItems.filter((item) => {
    if (selectedMajor.value !== 'ALL' && item.major !== selectedMajor.value) return false
    if (selectedStatus.value === 'LINKED' && !item.route) return false
    if (selectedStatus.value === 'PENDING' && item.route) return false

    if (!kw) return true
    const haystack = [item.name, item.screenName, item.screenId, item.major, item.sub]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(kw)
  })
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
