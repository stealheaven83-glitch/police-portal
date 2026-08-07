<script setup lang="ts">
import { ref } from 'vue'
import Pagination from '@/components/custom/pagination/Pagination.vue'

const page = ref(1)
const totalPages = ref(30)      // 실제로는 API 응답값 등으로 설정
const totalCount = ref(300)     // 실제로는 API 응답값 등으로 설정
</script>

<template>
  <Pagination
    :currentPage="page"
    :totalPages="totalPages"
    :itemsPerPage="10"
    :totalElements="totalCount"
    @update:page="page = $event"
  />
</template>