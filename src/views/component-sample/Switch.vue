<script setup lang="ts">
import { Switch } from "@/components/custom/switch"
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Switch</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 스위치 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Variants</h2>
          <div class="flex items-center gap-6 p-4">
            <Switch label="Default" />
            <Switch variant="none" />
          </div>
        </section>
        
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sizes</h2>
          <div class="flex items-center gap-6 p-4">
            <Switch label="Default 폰트사이즈 15px" />
            <Switch size="lg" label="Large 폰트사이즈 17px" />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">States</h2>
          <div class="flex items-center gap-6 p-4">
            <Switch :default-value="true" label="Default" />
            <Switch label="checked" disabled />
            <Switch label="checked + disabled" :default-value="true" disabled />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>