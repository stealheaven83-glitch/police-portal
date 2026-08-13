<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Textarea 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        Label · 에러 메시지를 하나로 묶은 커스텀
        <span class="text-primary font-medium">TextareaField</span>
        컴포넌트 예시 페이지입니다.
        레이블 · 플레이스홀더 · 도움말 · 에러 메시지의 구성과 유형별 입력 예시를 확인할 수 있습니다.
      </div>

      <!-- Section 1: 기본 구조 -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">기본 구조</h2>
        <div class="text-gray-500">
          <span class="text-primary font-medium">TextareaField</span> 하나로 레이블, 텍스트영역(플레이스홀더),
          도움말(선택), 에러 메시지를 구성합니다.
        </div>

        <div class="w-[360px]">
          <TextareaField
            v-model="anatomyValue"
            label="레이블"
            required
            placeholder="내용을 입력해 주세요."
            description="입력 시 필요한 정보에 대한 도움말을 제공합니다."
            error="에러가 있을 경우 메시지로 안내합니다."
          />
        </div>

        <ol class="text-sm text-gray-500 list-decimal list-inside space-y-1 pt-2">
          <li><b>레이블</b> — 입력해야 하는 항목에 대한 간략한 안내 문구 또는 제목 (<code>label</code>, <code>required</code>)</li>
          <li><b>텍스트영역</b> — 여러 줄의 텍스트가 입력되는 영역. 배경과 테두리로 입력 필드임을 인지하게 함</li>
          <li><b>플레이스홀더</b> — 어떤 내용을 입력해야 하는지에 대한 힌트 또는 예시 (<code>placeholder</code>)</li>
          <li><b>도움말 [선택]</b> — 입력 방식 또는 입력할 내용에 대한 도움말 (<code>description</code>)</li>
          <li><b>에러 메시지</b> — 입력한 내용에 오류가 있을 경우 안내 (<code>error</code>)</li>
        </ol>
      </section>

      <!-- Section 2: 의견 (기본 텍스트 + 필수 에러 처리) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">의견</h2>
        <div class="text-gray-500">기본 텍스트영역 입력입니다. 필수 항목으로, 미입력 시 에러 메시지를 표시합니다.</div>

        <div class="w-[480px]">
          <TextareaField
            v-model="opinion"
            label="의견"
            required
            placeholder="의견을 입력해 주세요."
            :error="opinionError"
            @blur="validateOpinion"
          />
        </div>
      </section>

      <!-- Section 3: 기타 정보 (도움말 + 글자수 카운터) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">기타 정보</h2>
        <div class="text-gray-500">도움말과 글자수 카운터를 함께 제공하는 입력입니다. 최대 100자까지 입력할 수 있습니다.</div>

        <div class="w-[480px]">
          <TextareaField
            v-model="etc"
            label="기타 정보"
            description="신청 이유를 100자 이내로 간단히 작성해 주세요."
            placeholder="내용을 입력해 주세요."
            :maxlength="100"
            show-count
          />
        </div>
      </section>

      <!-- Section 4: 상태 (Disabled / Readonly) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">입력 상태</h2>
        <div class="text-gray-500">비활성화(disabled)와 읽기 전용(readonly) 상태 예시입니다.</div>

        <div class="flex gap-6">
          <div class="w-[220px]">
            <TextareaField label="비활성화" placeholder="입력할 수 없습니다." disabled />
          </div>
          <div class="w-[220px]">
            <TextareaField label="읽기 전용" model-value="수정할 수 없는 값" readonly />
          </div>
        </div>
      </section>

      <!-- Section 5: 높이 / 메시지 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">커스텀(TextareaField 옵션)</h2>
        <div class="text-gray-500">높이, 메시지, 테두리 스타일 등 옵션 예시입니다.</div>
        <div>
          <div class="w-[480px] mb-3">
            <TextareaField label="높이 지정(200px)" placeholder="플레이스홀더" :height="200"  date="YYYY-MM-DD (HH:MM)"/>
          </div>
          <div class="w-[480px] mb-3">
            <TextareaField label="설명버튼" description="안녕?" placeholder="플레이스홀더" />
          </div>
          <div class="w-[480px] mb-3">
            <TextareaField label="메시지 있는 textarea" message="complete메시지" placeholder="플레이스홀더" />
          </div>
          <div class="w-[480px] mb-3">
            <TextareaField label="메시지 있는 textarea(error)" borderStyle="error" message="error메시지" message-type="error" placeholder="플레이스홀더" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'

/**
 * 기본 구조 예시용 값
 */
const anatomyValue = ref('')

/**
 * 의견 - 필수 입력 처리
 */
const opinion = ref('')
const opinionError = ref('')
const validateOpinion = () => {
  opinionError.value = opinion.value.trim() ? '' : '의견을 입력해 주세요.'
}

/**
 * 기타 정보 - 최대 100자
 */
const etc = ref('')
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

code {
  font-size: 0.85em;
  background: var(--muted);
  color: var(--foreground);
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
}
</style>
