<script setup lang="ts">
import { Checkbox } from "@/components/custom/checkbox"

</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Checkbox</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 체크박스 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Variants</h2>
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-start gap-4 p-4">
              <Checkbox variant="default" :default-value="true" />
              <Checkbox variant="minus" label="minus" :default-value="true" />
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sizes</h2>
          <div class="flex flex-wrap gap-4">
            <div class="grid grid-cols-3 items-start gap-4 p-4">
              <Checkbox variant="default" size="default" label="Default 폰트사이즈 15px" />
              <Checkbox variant="default" size="lg" label="Large 폰트사이즈 19px" />
              <Checkbox variant="default" size="lg" label="폰트 사이즈 커스텀" labelClass="text-[10px]" />
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">States</h2>
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-start gap-8 p-4">
              <Checkbox variant="default" label="Default" />
              <Checkbox variant="default" label="checked" :default-value="true" />
              <Checkbox variant="default" label="disabled" disabled />
              <Checkbox variant="default" label="checked + disabled" :default-value="true" disabled />
            </div>
          </div>
        </section>
        
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Help Text</h2>
          <div class="flex items-start flex-wrap gap-8">
            <Checkbox
              variant="default"
              size="default"
              label="Help text"
              description="라벨 아래 보조 설명이 표시됩니다."
            />
            <Checkbox
              variant="default"
              size="default"
              label="Help text"
              description="disabled 시 설명 텍스트도 함께 흐려집니다."
              disabled
            />
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
</style>
