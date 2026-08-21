<script setup lang="ts">
import { ref } from "vue"
import { GridTitle } from "@/components/custom/grid-title"
import SelectField from "@/components/custom/select/SelectField.vue"
import Input from "@/components/custom/input/Input.vue"
import { Button } from "@/components/custom/button"

const searchField = ref("userId")
const searchFieldOptions = [
  { label: "사용자ID", value: "userId" },
  { label: "이름", value: "name" },
]
const keyword = ref("")
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Grid Title</h1>
          <p class="text-muted-foreground text-sm mt-1">
            그리드/테이블 상단 타이틀 바 컴포넌트 샘플입니다. 우측 영역은 슬롯으로 자유롭게 구성합니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Default (타이틀만)</h2>
          <GridTitle title="Title" />
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Search (검색조건)</h2>
          <GridTitle title="Title">
            <SelectField
              v-model="searchField"
              :options="searchFieldOptions"
              size="sm"
              class="w-[12rem] shrink-0"
            />
            <Input v-model="keyword" placeholder="사용자 조회" size="sm" class="w-[20rem]" />
          </GridTitle>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">BTNs (액션 버튼)</h2>
          <GridTitle title="Title">
            <div class="flex items-center gap-3">
              <Button variant="tertiary2" size="sm" class="w-[10rem]">선택삭제</Button>
              <Button variant="secondary" size="sm" class="w-[10rem]">추가</Button>
              <Button variant="primary" size="sm" class="w-[10rem]">저장</Button>
            </div>
          </GridTitle>
        </section>
      </div>
    </div>
  </div>
</template>
