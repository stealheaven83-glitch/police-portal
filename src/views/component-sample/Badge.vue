<script setup lang="ts">
import { Badge, BadgeDot, BadgeNumber } from "@/components/custom/bedge"

const colors = ["primary", "secondary", "tertiary", "point", "danger", "warning", "success", "info"] as const
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Badge</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 뱃지 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge__dot</h2>
          <div class="flex items-center gap-6 p-4">
            <BadgeDot type="primary" />
            <BadgeDot type="new" />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge__number</h2>
          <div class="flex items-center gap-6 p-4">
            <BadgeNumber type="primary" :value="5" />
            <BadgeNumber type="primary" :value="1200" />
            <BadgeNumber type="new" :value="5" />
            <BadgeNumber type="new" :value="1200" />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge - Color (Solid)</h2>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <Badge v-for="color in colors" :key="`solid-${color}`" :color="color" variant="solid">
              {{ color }}
            </Badge>
   
          </div>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <Badge v-for="color in colors" :key="`solid-${color}`" :color="color" variant="solid" shape="sm" size="lg">
              {{ color }}
            </Badge>    
          </div>                
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge - Color (Outline)</h2>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <Badge v-for="color in colors" :key="`outline-${color}`" :color="color" variant="outline" shape="sm">
              {{ color }}
            </Badge>
          </div>
          <div class="flex flex-wrap items-center gap-3 p-4">
            <Badge v-for="color in colors" :key="`outline-${color}`" :color="color" variant="outline" size="lg" shape="sm">
              {{ color }}
            </Badge>
          </div>          
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge - Size</h2>
          <div class="flex items-center gap-3 p-4">
            <Badge size="lg">Large</Badge>
            <Badge size="md">Medium</Badge>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Badge - Shape</h2>
          <div class="flex items-center gap-3 p-4">
            <Badge shape="full">Full</Badge>
            <Badge shape="sm">4px</Badge>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
