<template>
  <div>
    <div class="w-full overflow-hidden border-[#1E2124] border-t">
      <Table class="w-full">
        <TableCaption v-if="caption">{{ caption }}</TableCaption>
        <TableHeader class="bg-transparent">
          <TableRow class="" >
            <TableHead v-for="column in columns" :key="column.key" :class="cn('text-center text-[#464C53] font-bold border-b border-[#8A949E]')"
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
                  <Badge
                    :color="statusColorMap[getNestedValue(item, column.key)] ?? 'grayLighter'"
                    size="md"
                  >
                    {{ getNestedValue(item, column.key) }}
                  </Badge>
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

    <Pagination
      v-if="showPagination"
      class="mt-[20px]"
      :current-page="currentPageComputed"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :total-elements="totalElements"
      @update:page="goToPage"
      @update:items-per-page="onItemsPerPageSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { Pagination } from '@/components/custom/pagination'
import { Badge, type BadgeVariants } from '@/components/custom/badge'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'

// Props 정의
interface Column {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'status' | 'custom' | 'dateTime';
  cellClass?: string;
}

interface PageSizeOption {
  label: string;
  value: string;
}

interface Props {
  columns: Column[];
  items: any[];
  caption?: string;
  itemsPerPage?: number;
  itemsPerPageOptions?: PageSizeOption[];
  showPagination?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  /** type: 'status' 컬럼 값 -> Badge 색상 매핑. 지정 안 된 값은 grayLighter 로 표시 */
  statusColorMap?: Record<string, BadgeVariants['color']>;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  itemsPerPageOptions: () => [
    { label: '10건', value: '10' },
    { label: '20건', value: '20' },
  ],
  showPagination: true,
  caption: '',
  emptyTitle: '데이터가 없습니다',
  emptyDescription: '현재 표시할 데이터가 없습니다.',
  selectable: false,
  totalElements: 0,
  totalPages: 1,
  currentPage: 1,
  statusColorMap: () => ({
    '활성화': 'success',
    '비활성화': 'danger',
    '대기중': 'warning',
  }),
})

// Emits 정의
const emit = defineEmits(['page-change', 'select-row', 'update:itemsPerPage'])

// 페이지당 표시건수 select 변경 핸들러 (부모가 update:itemsPerPage 를 안 듣는 기존 사용처는 그대로 무동작)
const onItemsPerPageSelect = (value: unknown) => {
  emit('update:itemsPerPage', Number(value))
}

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

// 행 선택 핸들러
const selectRow = (index: number, item: any) => {
  selectedIndex.value = selectedIndex.value === index ? null : index
  emit('select-row', { index, item })
}

</script>



<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
