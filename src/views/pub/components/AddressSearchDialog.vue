<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'

/**
 * 주소검색 팝업 — 방범협력단체 관련 폼(단체정보/단체활동기록)이 공용으로 쓴다.
 * 실제 주소 API 연동 전까지는 입력한 키워드를 포함하는 목업 주소 목록에서 고르는 식으로 동작한다.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', address: string): void
}>()

const MOCK_ADDRESSES = [
  '서울특별시 중구 을지로 264',
  '서울특별시 중구 을지로 12길 6',
  '서울특별시 중구 다산로 10',
  '서울특별시 중구 퇴계로 100',
  '서울특별시 중구 창경궁로 8',
]

const keyword = ref('')
const results = ref<string[]>([])

function search() {
  const kw = keyword.value.trim()
  results.value = kw ? MOCK_ADDRESSES.filter((a) => a.includes(kw)) : MOCK_ADDRESSES
}

function select(address: string) {
  emit('select', address)
  emit('update:open', false)
}
</script>

<template>
  <GenericDialog2
    :open="props.open"
    title="주소검색"
    :size="480"
    :show-close-button="true"
    @update:open="emit('update:open', $event)"
  >
    <div class="group-gap2 mb-4">
      <InputField2 v-model="keyword" size="sm" placeholder="도로명, 지번 등으로 검색" class="flex-1 !space-y-0" @keyup.enter="search" />
      <Button type="button" variant="secondary" size="sm" class="w-20" @click="search">검색</Button>
    </div>

    <ul class="max-h-80 overflow-y-auto border-t-2 border-[var(--Text-body_0,#1e2124)]">
      <li v-for="address in results" :key="address">
        <button
          type="button"
          class="w-full px-2 py-3 text-left text-[1.4rem] text-[var(--Text-body_1)] border-b border-[var(--Border_gray03,#e6e8ea)] hover:bg-[var(--Surface-primary,#eef4fb)]"
          @click="select(address)"
        >
          {{ address }}
        </button>
      </li>
      <li v-if="!results.length" class="py-10 text-center text-[1.4rem] text-[var(--Text-body_disable)]">
        검색어를 입력해 주소를 찾아보세요.
      </li>
    </ul>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">닫기</Button>
    </template>
  </GenericDialog2>
</template>
