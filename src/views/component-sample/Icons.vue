<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { ref, computed } from 'vue'

const searchQuery = ref('')

const icons = Object.entries(LucideIcons)
  .filter(([name]) =>
    name.endsWith('Icon') && name !== 'Icon' && name !== 'createLucideIcon'
  ).map(([name, component]) => ({
    name,
    component: component as any,
    displayName: name.replace(/Icon$/, '')
  }))

const filteredIcons = computed(() => {
  if (!searchQuery.value) return icons.slice(0, 100) // 처음엔 100개만 표시
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
            Lucide Vue Next 아이콘 라이브러리 샘플입니다.
          </p>
        </div>
        <div class="max-w-xs w-full ml-4">
          <Input v-model="searchQuery" placeholder="아이콘 이름 검색..." class="w-full" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div v-for="icon in filteredIcons" :key="icon.name"
            class="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors group">
            <component :is="icon.component" :size="24" class="mb-2 group-hover:scale-110 transition-transform" />
            <span class="text-[10px] text-center text-muted-foreground break-all px-1">
              {{ icon.displayName }}
            </span>
          </div>
        </div>

        <div v-if="filteredIcons.length === 0" class="text-center py-20 text-muted-foreground">
          검색 결과가 없습니다.
        </div>

        <section class="mt-4 space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Styling Examples</h2>
          <div class="flex flex-wrap gap-8 items-center">
            <div class="flex flex-col items-center gap-2">
              <LucideIcons.HeartIcon class="size-4 text-red-500 fill-red-500" />
              <span class="text-xs">Colored/Filled</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <LucideIcons.SettingsIcon class="size-8 animate-spin-slow" />
              <span class="text-xs">Large / Spin</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <LucideIcons.BellIcon class="size-6 text-yellow-500 animate-bounce" />
              <span class="text-xs">Animated</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <LucideIcons.ShieldIcon class="size-6 text-blue-600 stroke-[3]" />
              <span class="text-xs">Thick Stroke</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
