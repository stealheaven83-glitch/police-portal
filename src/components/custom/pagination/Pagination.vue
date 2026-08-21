<template>
  <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full">
    <div class="justify-self-start text-sm">
      총 <span class="font-bold">{{ totalElements }}</span>건 / 현재 {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
        Math.min(currentPage
          * itemsPerPage, totalElements) }}
    </div>
    <Pagination class="justify-self-center"
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
    <div class="justify-self-end">
      <section class="space-y-4">
        <div class="flex gap-4">
          <BaseSelect v-model="selectedValue" :options="itemsPerPageOptions" placeholder=""
            width-class="" class="border-0 shadow-none
            "/>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSelect from '@/components/select/BaseSelect.vue'

interface PageSizeOption {
  label: string;
  value: string;
}
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
  itemsPerPageOptions?: PageSizeOption[];
  totalElements?: number;
  /** 현재 페이지 기준 좌우로 보여줄 페이지 개수 (기본 1) */
  siblingCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  itemsPerPageOptions: () => [
    { label: '10건', value: '10' },
    { label: '20건', value: '20' },
    { label: '30건', value: '30' },
  ],
  totalElements: 0,
  siblingCount: 1
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:itemsPerPage', itemsPerPage: number): void
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

//select box
const selectedValue = ref<string>(String(props.itemsPerPage))

// 부모가 itemsPerPage 를 외부에서 바꾸면(초기값 포함) 셀렉트 표시값을 동기화
watch(() => props.itemsPerPage, (value) => {
  selectedValue.value = String(value)
})

watch(selectedValue, (value) => {
  if (Number(value) === props.itemsPerPage) return
  emit('update:itemsPerPage', Number(value))
  emit('update:page', 1)
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
