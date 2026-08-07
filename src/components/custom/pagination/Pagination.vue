<template>
  <div class="flex justify-center items-center" v-if="totalPages > 1">
    <Pagination
      :page="currentPage"
      :itemsPerPage="itemsPerPage"
      :total="totalElements"
      :siblingCount="siblingCount"
      show-edges
      @update:page="goToPage"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst
          class="p-1 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToPage(1)"
          :disabled="currentPage === 1"
        >
          <span class="inline-flex rotate-180">
            <Icon name="arrowNext" :size="16" />
          </span>
        </PaginationFirst>
        <PaginationPrev
          class="p-1 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
        >
          <span class="inline-flex rotate-180">
            <Icon name="arrowRight" :size="16" />
          </span>
        </PaginationPrev>

        <template v-for="(item, index) in items" :key="`${item.type}-${index}`">
          <PaginationListItem v-if="item.type === 'page'" :value="item.value" as-child>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors"
              :class="currentPage === item.value
                ? 'bg-[#123a70] text-white font-semibold'
                : 'bg-transparent text-[#464C53] font-normal hover:bg-gray-100 hover:text-gray-800'"
              @click="goToPage(item.value)"
            >
              {{ item.value }}
            </button>
          </PaginationListItem>
          <PaginationEllipsis
            v-else
            :index="index"
            class="w-8 h-8 flex items-center justify-center text-[#33363D]"
          />
        </template>

        <PaginationNext
          class="has-[>svg]:px-1 p-1 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
        >
          <Icon name="arrowRight" :size="16" />
        </PaginationNext>
        <PaginationLast
          class="has-[>svg]:px-1 p-1 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
        >
          <Icon name="arrowNext" :size="16" />
        </PaginationLast>
      </PaginationList>
    </Pagination>
  </div>
</template>

<script setup lang="ts">
import {
  Pagination,
  PaginationList,
  PaginationListItem,
  PaginationEllipsis,
  PaginationFirst,
  PaginationPrev,
  PaginationNext,
  PaginationLast
} from '@/components/ui/pagination'
// TODO: 실제 프로젝트에서 사용 중인 Icon 컴포넌트 경로로 맞춰주세요 (자동 임포트되는 구조라면 이 줄은 삭제해도 됩니다)
import Icon from '@/components/custom/icon/Icon.vue'

export interface Props {
  currentPage: number;
  totalPages: number;
  itemsPerPage?: number;
  totalElements?: number;
  /** 현재 페이지 기준 좌우로 보여줄 페이지 개수 (기본 1) */
  siblingCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  totalElements: 0,
  siblingCount: 1
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:page', page)
  }
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('update:page', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:page', props.currentPage + 1)
  }
}
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>