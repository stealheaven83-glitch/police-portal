<template>
  <div class="p-6">
    <div class="grid grid-cols-2 gap-6">
      <!-- 좌측 레이아웃 -->
      <div class=" p-6 bg-white rounded-lg h-[calc(100vh-200px)] overflow-y-auto">

        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">좌측 레이아웃</h1>
          <Button>
            예시 버튼
          </Button>
        </div>

      </div>

      <!-- 우측 레이아웃 -->
      <div class="p-6 bg-white rounded-lg h-[calc(100vh-200px)]">

        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">우측 레이아웃</h1>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Button } from '@/components/ui/button'

onMounted(() => {

})

</script>
