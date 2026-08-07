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