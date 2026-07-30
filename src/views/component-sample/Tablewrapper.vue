<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6 ">
      <h1 class="text-2xl font-bold ">TableWrapper 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        TableWrapper 커스텀 컴포넌트 사용 예시 페이지입니다
      </div>
    
      <TableWrapper
        :columns="movieColumns"
        :items="pagedMovies"
        :show-pagination="true"
        :items-per-page="pagination.pageSize"
        :total-elements="pagination.totalElements"
        :current-page="pagination.currentPage + 1"
        :total-pages="pagination.totalPages"
        :selectable="false"
        @page-change="handlePageChange"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'

type Movie = {
  code: string
  title: string
  releaseYear: number
  genre: string
  runtimeMin: number
}

const pagination = ref({
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 5,
})

// Dummy Data for Table
const allMovies = ref<Movie[]>([
  { code: 'MOV-001', title: '기생충', releaseYear: 2019, genre: '드라마', runtimeMin: 132 },
  { code: 'MOV-002', title: '가타카', releaseYear: 1997, genre: 'SF', runtimeMin: 108 },
  { code: 'MOV-003', title: '이터널 선샤인', releaseYear: 2004, genre: '로맨스', runtimeMin: 108 },
  { code: 'MOV-004', title: '올드보이', releaseYear: 2003, genre: '스릴러', runtimeMin: 120 },
  { code: 'MOV-005', title: '스파이더맨: 뉴 유니버스', releaseYear: 2018, genre: '애니메이션', runtimeMin: 117 },
  { code: 'MOV-006', title: '인터스텔라', releaseYear: 2014, genre: 'SF', runtimeMin: 169 },
  { code: 'MOV-007', title: '쇼생크 탈출', releaseYear: 1994, genre: '드라마', runtimeMin: 142 },
  { code: 'MOV-009', title: '위플래쉬', releaseYear: 2014, genre: '드라마', runtimeMin: 107 },
])

/** 테이블에 보여줄 현재 페이지 데이터 */
const pagedMovies = computed(() => {
  const start = pagination.value.currentPage * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return allMovies.value.slice(start, end)
})

/** totalElements / totalPages 자동 계산 */
watchEffect(() => {
  pagination.value.totalElements = allMovies.value.length
  pagination.value.totalPages = Math.max(1, Math.ceil(allMovies.value.length / pagination.value.pageSize))

  // 현재 페이지가 totalPages 범위 밖이면 보정
  if (pagination.value.currentPage > pagination.value.totalPages - 1) {
    pagination.value.currentPage = pagination.value.totalPages - 1
  }
})

/** TableWrapper가 1-based 페이지를 넘긴다고 가정 */
const handlePageChange = (page: number) => {
  pagination.value.currentPage = Math.max(0, page - 1)
}

// 테이블 컬럼 정의
const movieColumns = [
  { key: 'code', label: '코드', width: '120px' },
  { key: 'title', label: '제목', width: '260px' },
  { key: 'releaseYear', label: '개봉년도', width: '120px'},
  { key: 'genre', label: '장르', width: '140px' },
  { key: 'runtimeMin', label: '러닝타임(분)', width: '140px'},
]

</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 