<template>
  <!--
    좁은 화면에서는 2열로 접힌다.
      1행: 총 건수(왼쪽) · 페이지당 건수(오른쪽)
      2행: 페이지 버튼(전체 폭, 가운데)
    md(768px) 이상에서는 시안대로 한 줄 3분할(1fr auto 1fr)이라 페이저가 바 정중앙에 온다.
  -->
  <div class="grid w-full grid-cols-2 items-center gap-y-3 md:grid-cols-[1fr_auto_1fr] md:gap-y-0 -mb-[8px] border-t-[0.2rem] border-solid border-[var(--Border_gray03)] pt-5">
    <div v-if="!simple" class="order-1 min-w-0 justify-self-start truncate text-sm">
      총 <span class="font-bold">{{ totalElements }}</span>건 / 현재 {{ rangeStart }}-{{ rangeEnd }}
    </div>
    <Pagination class="order-3 col-span-2 justify-self-center md:order-2 md:col-span-1"
      :page="currentPage"
      :itemsPerPage="itemsPerPage"
      :total="totalElements"
      :siblingCount="effectiveSiblingCount"
      show-edges
      @update:page="goToPage"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst
          class="w-8 h-8 p-1 hidden sm:flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToPage(1)"
          :disabled="currentPage === 1"
        >
          <span class="inline-flex rotate-180">
            <Icon name="arrowNext" :size="16" />
          </span>
        </PaginationFirst>
        <PaginationPrev
          class="w-8 h-8 p-1 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
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
          class="has-[>svg]:px-1 p-1 w-8 h-8 flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
        >
          <Icon name="arrowRight" :size="16" />
        </PaginationNext>
        <PaginationLast
          class="has-[>svg]:px-1 p-1 w-8 h-8 hidden sm:flex items-center justify-center rounded-full border-none shadow-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-none disabled:opacity-40 disabled:hover:bg-transparent"
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
        >
          <Icon name="arrowNext" :size="16" />
        </PaginationLast>
      </PaginationList>
    </Pagination>
    <div v-if="!simple" class="order-2 justify-self-end md:order-3">
      <BaseSelect
        v-model="selectedValue"
        :options="itemsPerPageOptions"
        placeholder=""
        width-class=""
        class="border-0 shadow-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
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
  /**
   * 페이지 버튼만 가운데 놓는 형태(Figma: pagination__pc).
   * 총 건수 문구와 페이지당 건수 셀렉트를 감춘다 — 검색결과처럼 그리드가 아닌 목록에서 쓴다.
   * 기본 false 라 기존 화면 렌더 결과는 그대로다.
   */
  simple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  itemsPerPageOptions: () => [
    { label: '10개씩 보기', value: '10' },
    { label: '20개씩 보기', value: '20' },
    { label: '30개씩 보기', value: '30' },
  ],
  totalElements: 0,
  siblingCount: 1,
  simple: false
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:itemsPerPage', itemsPerPage: number): void
}>()

/* 현재 페이지가 보여주는 항목 범위.
 * 0건일 때 (currentPage - 1) * itemsPerPage + 1 을 그대로 쓰면 "1-0" 이 되므로 0-0 으로 표시한다. */
const rangeStart = computed(() =>
  props.totalElements ? (props.currentPage - 1) * props.itemsPerPage + 1 : 0,
)
const rangeEnd = computed(() =>
  Math.min(props.currentPage * props.itemsPerPage, props.totalElements),
)

/* 좁은 화면에서는 현재 페이지 좌우 번호를 접어 페이저가 넘치지 않게 한다.
 * (sm 미만에서는 맨앞/맨뒤 버튼도 CSS 로 숨긴다) */
const isNarrow = useMediaQuery('(max-width: 639px)')
const effectiveSiblingCount = computed(() => (isNarrow.value ? 0 : props.siblingCount))

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
