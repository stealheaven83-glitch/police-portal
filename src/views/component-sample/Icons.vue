<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { iconMap } from '@/components/custom/icon'

const searchQuery = ref('')

const icons = Object.entries(iconMap).map(([name, component]) => ({
  name,
  component: component as any,
  displayName: name,
}))

const filteredIcons = computed(() => {
  if (!searchQuery.value) return icons
  return icons.filter(icon =>
    icon.displayName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Icons</h1>
          <p class="text-muted-foreground text-sm mt-1">
            프로젝트 커스텀 아이콘 샘플입니다.
          </p>
        </div>
        <div class="max-w-xs w-full ml-4">
          <Input v-model="searchQuery" placeholder="아이콘 이름 검색..." class="w-full" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div v-for="icon in filteredIcons" :key="icon.name"
            class="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors group">
            <component :is="icon.component" class="mb-2 size-6 group-hover:scale-110 transition-transform" />
            <span class="text-[10px] text-center text-muted-foreground break-all px-1">
              {{ icon.displayName }}
            </span>
          </div>
        </div>

        <div v-if="filteredIcons.length === 0" class="text-center py-20 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>