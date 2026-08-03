<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox"

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
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" :default-value="true" />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="minus" label="minus" :default-value="true" />
              </label>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sizes</h2>
          <div class="flex flex-wrap gap-4">
            <div class="grid grid-cols-3 items-start gap-4 p-4">
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" size="default" label="Default 폰트사이즈 15px" />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" size="lg" label="Large 폰트사이즈 19px" />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" size="lg" label="폰트 사이즈 커스텀" labelClass="text-[10px]" />
              </label>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">States</h2>
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-start gap-8 p-4">
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" label="Default" />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" label="checked" :default-value="true" />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" label="disabled" disabled />
              </label>
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" label="checked + disabled" :default-value="true" disabled />
              </label>
            </div>
          </div>
        </section>
        
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Help Text</h2>
          <div class="flex items-start flex-wrap gap-8">
            <div class="group flex flex-col gap-1">
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" size="default" label="Help text" />
              </label>
              <p class="pl-7 text-[1.3rem] text-[#464C53] group-has-[[disabled]]:text-[#8A949E]">
                다크모드 컬러 필요.<br/>dark:text-[white] dark:group-has-[[disabled]]:text-[white]
              </p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="group flex items-center gap-2">
                <Checkbox variant="default" size="default" label="Help text" disabled />
              </label>
              <p class="pl-7 text-[1.3rem] text-[#464C53] group-has-[[disabled]]:text-[#8A949E]">
                상위 group 클래스를 넣어줘야 컬러가 같이 적용됩니다.
              </p>
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
</style>
