<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/custom/tabs"
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Tabs</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 탭 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Variants</h2>
          <Tabs default-value="tab1">
            <TabsList variant="fill" :grow="true">
              <TabsTrigger value="tab1">Default 탭1: 타이틀이 길어도상관없이 똑같은 넓이로 적용됩니다</TabsTrigger>
              <TabsTrigger value="tab2">Default 탭2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Default 탭내용1<br/>타이틀이 길어도상관없이 똑같은 넓이로 적용됩니다</TabsContent>
            <TabsContent value="tab2">Default 탭내용2</TabsContent>
          </Tabs>
          <Tabs default-value="tab1">
            <TabsList variant="line" :grow="true">
              <TabsTrigger value="tab1">Line탭1</TabsTrigger>
              <TabsTrigger value="tab2">Line탭2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Line탭내용1</TabsContent>
            <TabsContent value="tab2">Line탭내용2</TabsContent>
          </Tabs>

          <Tabs default-value="tab1">
            <TabsList variant="fill" :grow="false">
              <TabsTrigger value="tab1">탭1</TabsTrigger>
              <TabsTrigger value="tab2">탭2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">탭내용1</TabsContent>
            <TabsContent value="tab2">탭내용2</TabsContent>
          </Tabs>

          <Tabs default-value="tab2">
            <TabsList variant="line" :grow="false">
              <TabsTrigger value="tab1">Line탭1</TabsTrigger>
              <TabsTrigger value="tab2">Line탭2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Line탭내용1</TabsContent>
            <TabsContent value="tab2">Line탭내용2</TabsContent>
          </Tabs>

          <!-- Chip 탭: Figma chip(11220:71184) — chip__single 을 가로로 늘어놓은 탭. 활성 탭 앞에 체크, 폭은 균등(grow 기본) -->
          <Tabs default-value="tab1">
            <TabsList variant="chip">
              <TabsTrigger value="tab1">장애처리</TabsTrigger>
              <TabsTrigger value="tab2">출동수당</TabsTrigger>
              <TabsTrigger value="tab3">범죄예방진단</TabsTrigger>
              <TabsTrigger value="tab4">해바라기센터</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Chip탭내용1 (장애처리)</TabsContent>
            <TabsContent value="tab2">Chip탭내용2 (출동수당)</TabsContent>
            <TabsContent value="tab3">Chip탭내용3 (범죄예방진단)</TabsContent>
            <TabsContent value="tab4">Chip탭내용4 (해바라기센터)</TabsContent>
          </Tabs>

          <!-- Chip 탭, 내용 폭에 맞춤(grow=false) -->
          <Tabs default-value="tab1">
            <TabsList variant="chip" :grow="false">
              <TabsTrigger value="tab1">장애처리</TabsTrigger>
              <TabsTrigger value="tab2">출동수당</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Chip탭내용1</TabsContent>
            <TabsContent value="tab2">Chip탭내용2</TabsContent>
          </Tabs>

          <!-- Category 탭: Figma category tab(14374:123334) — 목록 위 pill 카테고리 탭. 항상 내용 폭, 활성은 bold -->
          <Tabs default-value="tab0">
            <TabsList variant="category">
              <TabsTrigger value="tab0">전체</TabsTrigger>
              <TabsTrigger value="tab1">장애처리</TabsTrigger>
              <TabsTrigger value="tab2">출동수당</TabsTrigger>
              <TabsTrigger value="tab3">범죄예방진단</TabsTrigger>
              <TabsTrigger value="tab4">해바라기 센터</TabsTrigger>
            </TabsList>
            <TabsContent value="tab0">Category탭내용 (전체)</TabsContent>
            <TabsContent value="tab1">Category탭내용 (장애처리)</TabsContent>
            <TabsContent value="tab2">Category탭내용 (출동수당)</TabsContent>
            <TabsContent value="tab3">Category탭내용 (범죄예방진단)</TabsContent>
            <TabsContent value="tab4">Category탭내용 (해바라기 센터)</TabsContent>
          </Tabs>
          
        </section>
        
        <section class="space-y-4 w-[400px]">
          <Tabs default-value="tab2">
            <TabsList variant="line" :grow="false" :scrollable="true">
              <TabsTrigger value="tab1">Line탭1 Line탭1 Line탭1 Line탭1 Line탭1</TabsTrigger>
              <TabsTrigger value="tab2">Line탭2 Line탭2 Line탭2</TabsTrigger>
              <TabsTrigger value="tab3">Line탭3 Line탭3 Line탭3 Line탭3 Line탭3 Line탭3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Line탭내용1</TabsContent>
            <TabsContent value="tab2">Line탭내용2</TabsContent>
            <TabsContent value="tab3">Line탭내용3</TabsContent>
          </Tabs>

        </section>

      </div>
    </div>
  </div>
</template>