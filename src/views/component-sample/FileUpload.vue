<script setup lang="ts">
import { ref } from "vue"
import { FileUpload } from "@/components/custom/file-upload"

const uploadedFile = ref<File | null>(null)
const errorFile = ref<File | null>(null)
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">File Upload</h1>
          <p class="text-muted-foreground text-sm mt-1">
            파일 첨부 컴포넌트 샘플입니다. 실제 업로드 진행/완료는 uploading·uploaded prop 으로 상위에서 제어합니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-6 animate-in fade-in duration-500 scrollbar-hide max-w-[500px]">
        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">ongoing (업로드 중)</h2>
          <FileUpload hint="파일명을 입력해주세요 [PDF,20KB]" uploading />
        </section>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">progress_completed (업로드 완료)</h2>
          <FileUpload hint="파일명을 입력해주세요 [PDF,20KB]" uploaded />
        </section>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">upload (첨부됨, 삭제 가능)</h2>
          <FileUpload v-model="uploadedFile" hint="파일명을 입력해주세요 [PDF,20KB]" file-name="근무표_2026.pdf" />
        </section>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">error</h2>
          <FileUpload
            v-model="errorFile"
            hint="파일명을 입력해주세요 [PDF,20KB]"
            file-name="대용량파일.pdf"
            error="등록 가능한 파일 용량을 초과하였습니다. 20MB 미만의 파일만 등록할 수 있습니다."
          />
        </section>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">download (다운로드 전용)</h2>
          <FileUpload hint="파일명을 입력해주세요 [PDF,20KB]" file-name="첨부문서.pdf" readonly />
        </section>
      </div>
    </div>
  </div>
</template>
