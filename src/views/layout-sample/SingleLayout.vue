<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6 ">
        <h1 class="text-2xl font-bold ">싱글 레이아웃 샘플</h1>
        <Button>예시 버튼</Button>
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

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>