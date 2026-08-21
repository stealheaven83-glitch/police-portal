<script setup lang="ts">
import { Alert } from "@/components/custom/alert"

const states = ["danger", "warning", "success", "info"] as const
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Alert</h1>
          <p class="text-muted-foreground text-sm mt-1">
            인라인 알림 배너 컴포넌트 샘플입니다. title prop 유무로 "+title / slim" 크기가 결정됩니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">+title (제목 + 최대 2줄 본문)</h2>
          <div class="flex flex-col gap-4 max-w-[640px]">
            <Alert v-for="state in states" :key="state" :state="state" title="메시지 타이틀">
              콘텐츠 내 알럿은 최대 2줄 이내로 작성합니다. 콘텐츠 내 알럿은 최대 2줄 이내로 작성합니다.
            </Alert>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">slim (한 줄, 아이콘 + 본문만)</h2>
          <div class="flex flex-col gap-4 max-w-[640px]">
            <Alert v-for="state in states" :key="state" :state="state">
              메시지 내용 최대 1줄
            </Alert>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
