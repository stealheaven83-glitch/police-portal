<script setup lang="ts">
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/custom/accordion"
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Accordion</h1>
          <p class="text-muted-foreground text-sm mt-1">
            ui/accordion(reka-ui) 를 감싼 KRDS 스타일 아코디언입니다. type(line/default) × size(large/medium)를 지원합니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-2 max-w-[480px]">
          <h2 class="text-sm font-semibold text-muted-foreground">line / large</h2>
          <Accordion type="single" collapsible default-value="a">
            <AccordionItem value="a">
              <AccordionTrigger type="line" size="large">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="line" size="large">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger type="line" size="large">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="line" size="large">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section class="space-y-2 max-w-[480px]">
          <h2 class="text-sm font-semibold text-muted-foreground">default / large</h2>
          <Accordion type="single" collapsible default-value="a" class="space-y-2">
            <AccordionItem value="a" class="border-b-0">
              <AccordionTrigger type="default" size="large">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="default" size="large">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b" class="border-b-0">
              <AccordionTrigger type="default" size="large">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="default" size="large">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section class="space-y-2 max-w-[480px]">
          <h2 class="text-sm font-semibold text-muted-foreground">line / medium</h2>
          <Accordion type="single" collapsible default-value="a">
            <AccordionItem value="a">
              <AccordionTrigger type="line" size="medium">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="line" size="medium">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger type="line" size="medium">아코디언 타이틀 영역</AccordionTrigger>
              <AccordionContent type="line" size="medium">아코디언 콘텐츠 영역입니다.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  </div>
</template>
