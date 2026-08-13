<template>
  <div>
    <div class="w-full overflow-hidden border-[#1E2124] border-t">
      <Table class="w-full">
        <TableCaption v-if="caption">{{ caption }}</TableCaption>
        <TableHeader class="bg-transparent">
          <TableRow class="" >
            <TableHead v-for="column in columns" :key="column.key" :class="`text-center text-white text-[#464C53] font-bold border-b border-[#8A949E `"
              :style="{ width: column.width || 'auto' }">
              {{ column.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="[&_tr:last-child]:!border-b">
          <TableRow v-for="(item, index) in paginatedItems" :key="index" class="hover:bg-[#F0F7FF]  hover:text-[#0054A6] hover:font-bold" :class="{
            'cursor-pointer': selectable,
            'bg-muted': selectedIndex === index
          }" @click="selectable ? selectRow(index, item) : undefined">
            <TableCell v-for="column in columns" :key="column.key" class="text-center border-l border-[#E6E8EA] first:border-l-0 " :class="column.cellClass || ''">
              <slot :name="`cell-${column.key}`" :item="item" :column="column">
                <template v-if="column.type === 'status'">
                  <span :class="{
                    'px-2 py-1 rounded text-xs font-medium inline-block min-w-[80px] text-center': true,
                    'bg-green-100 text-green-800': getNestedValue(item, column.key) === '활성화',
                    'bg-red-100 text-red-800': getNestedValue(item, column.key) === '비활성화',
                    'bg-yellow-100 text-yellow-800': getNestedValue(item, column.key) === '대기중'
                  }">
                    {{ getNestedValue(item, column.key) }}
                  </span>
                </template>
                <template v-else-if="column.type === 'dateTime'">
                  {{ dayjs(getNestedValue(item, column.key)).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
                <template v-else>
                  {{ getNestedValue(item, column.key) }}
                </template>
              </slot>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-if="paginatedItems.length === 0">
      <TableEmpty>
        <template #icon>
          <div class="rounded-full bg-muted p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z">
              </path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </template>
        <template #title>{{ emptyTitle || '데이터가 없습니다' }}</template>
        <template #description>{{ emptyDescription || '현재 표시할 데이터가 없습니다.' }}</template>
      </TableEmpty>
    </div>

    <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full mt-[20px]" v-if="showPagination">
      <div class="justify-self-start text-sm">
        총 <span class="font-bold">{{ totalElements }}</span>건 / 현재 {{ (currentPageComputed - 1) * itemsPerPage + 1 }}-{{
          Math.min(currentPageComputed
            * itemsPerPage, totalElements) }}
      </div>
      <Pagination class="flex items-center justify-self-center" :page="currentPageComputed" :itemsPerPage="itemsPerPage"
        :total="totalElements" @update:page="goToPage">
        <PaginationList class="flex items-center">
          <PaginationFirst class="p-0 mx-1 bg-transparent flex items-center border-0 shadow-none" @click="goToPage(1)"
            :disabled="currentPageComputed === 1" />
          <PaginationPrev class="p-0 mx-1 bg-transparent flex items-center border-0 shadow-none" @click="goToPreviousPage"
            :disabled="currentPageComputed === 1" />
          <PaginationListItem v-for="page in totalPages" :key="page" :value="page"
            class="p-0 mx-1 bg-transparent flex items-center">
            <Button
              class="w-9 h-9 flex items-center justify-center rounded-md text-sm outline outline-1 bg-white text-black py-0 hover:text-white"
              :class="currentPageComputed === page ? 'bg-[#023F88] text-white rounded-full' : ''" @click="goToPage(page)">
              {{ page }}
            </Button>
          </PaginationListItem>
          <PaginationNext class="p-0 mx-1 bg-transparent flex items-center border-0 shadow-none" @click="goToNextPage"
            :disabled="currentPageComputed === totalPages" />
          <PaginationLast class="p-0 mx-1 bg-transparent flex items-center border-0 shadow-none" @click="goToPage(totalPages)"
            :disabled="currentPageComputed === totalPages" />
        </PaginationList>
      </Pagination>
      <div class="justify-self-end">      
        <section class="space-y-4">
          <div class="flex gap-4">
            <BaseSelect v-model="selectedValue" :options="samplePageOptions" placeholder=""
              width-class="" class="border-0 shadow-none
              "/>
          </div>
        </section>
      </div>    
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/select/BaseSelect.vue';
import { ref, computed } from 'vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Pagination,
  PaginationList,
  PaginationListItem,
  PaginationFirst,
  PaginationPrev,
  PaginationNext,
  PaginationLast
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'

// Props 정의
interface Column {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'status' | 'custom' | 'dateTime';
  cellClass?: string;
}

interface Props {
  columns: Column[];
  items: any[];
  caption?: string;
  itemsPerPage?: number;
  showPagination?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  showPagination: true,
  caption: '',
  emptyTitle: '데이터가 없습니다',
  emptyDescription: '현재 표시할 데이터가 없습니다.',
  selectable: false,
  totalElements: 0,
  totalPages: 1,
  currentPage: 1
})

// Emits 정의
const emit = defineEmits(['page-change', 'select-row'])

// 선택된 행 추적을 위한 상태
const selectedIndex = ref<number | null>(null)

// 페이지네이션 관련 상태
const currentPageComputed = computed(() => props.currentPage)
const itemsPerPage = computed(() => props.itemsPerPage)
const totalPages = computed(() => props.totalPages)

// 현재 페이지에 표시할 데이터
const paginatedItems = computed(() => {
  if (!props.showPagination) {
    return props.items
  }
  return props.items
})

// 중첩된 객체의 값을 가져오는 함수
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// 페이지 변경 함수
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page)
  }
}

// 이전 페이지로 이동
const goToPreviousPage = () => {
  if (currentPageComputed.value > 1) {
    emit('page-change', currentPageComputed.value - 1)
  }
}

// 다음 페이지로 이동
const goToNextPage = () => {
  if (currentPageComputed.value < totalPages.value) {
    emit('page-change', currentPageComputed.value + 1)
  }
}

// 행 선택 핸들러
const selectRow = (index: number, item: any) => {
  selectedIndex.value = selectedIndex.value === index ? null : index
  emit('select-row', { index, item })
}


//select box
const samplePageOptions = [
  { label: '10건', value: '10' },
  { label: '20건', value: '20' },
]

const selectedValue = ref<string>(samplePageOptions[0].value)

</script>



<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
