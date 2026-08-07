<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Text Input 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        Shadcn UI 기반 Input · Label 과 에러 메시지를 하나로 묶은 커스텀
        <span class="text-primary font-medium">InputField</span>
        컴포넌트 예시 페이지입니다.
        레이블 · 플레이스홀더 · 도움말 · 에러 메시지의 구성과 유형별 입력 예시를 확인할 수 있습니다.
      </div>

      <!-- Section 1: 기본 구조 -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">기본 구조</h2>
        <div class="text-gray-500">
          <span class="text-primary font-medium">InputField</span> 하나로 레이블, 입력 필드(플레이스홀더),
          도움말(선택), 에러 메시지를 구성합니다.
        </div>

        <div class="w-[360px]">
          <InputField
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
          <li><b>입력 필드</b> — 텍스트가 입력되는 영역. 배경과 테두리로 입력 필드임을 인지하게 함</li>
          <li><b>플레이스홀더</b> — 어떤 내용을 입력해야 하는지에 대한 힌트 또는 예시 (<code>placeholder</code>)</li>
          <li><b>도움말 [선택]</b> — 입력 방식 또는 입력할 내용에 대한 도움말 (<code>description</code>)</li>
          <li><b>에러 메시지</b> — 입력한 내용에 오류가 있을 경우 안내 (<code>error</code>)</li>
        </ol>
      </section>

      <!-- Section 2: 이름 (기본 텍스트 + 필수 에러 처리) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">이름</h2>
        <div class="text-gray-500">기본 텍스트 입력입니다. 필수 항목으로, 미입력 시 에러 메시지를 표시합니다.</div>

        <div class="w-[360px]">
          <InputField
            v-model="name"
            label="이름"
            required
            placeholder="이름을 입력해 주세요. 예) 홍길동"
            :error="nameError"
            @blur="validateName"
          />
        </div>
      </section>

      <!-- Section 3: 전화번호 (3개 필드 분리, 각각 InputField) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">전화번호</h2>
        <div class="text-gray-500">3개의 필드로 분리하여 각각 InputField 로 구성했습니다. 숫자만 입력되며 자리수를 제한합니다.</div>

        <div class="w-[360px] space-y-1.5">
          <Label>전화번호</Label>
          <div class="flex items-start gap-2">
            <InputField
              v-model="phone.first"
              inputmode="numeric"
              maxlength="3"
              placeholder="010"
              class="w-[80px]"
              input-class="text-center"
              :aria-invalid="!!phoneError || undefined"
            />
            <span class="pt-2 text-muted-foreground">-</span>
            <InputField
              v-model="phone.middle"
              inputmode="numeric"
              maxlength="4"
              placeholder="1234"
              class="flex-1"
              input-class="text-center"
              :aria-invalid="!!phoneError || undefined"
            />
            <span class="pt-2 text-muted-foreground">-</span>
            <InputField
              v-model="phone.last"
              inputmode="numeric"
              maxlength="4"
              placeholder="5678"
              class="flex-1"
              input-class="text-center"
              :aria-invalid="!!phoneError || undefined"
              @blur="validatePhone"
            />
          </div>
          <p v-if="phoneError" class="text-sm text-destructive">{{ phoneError }}</p>
        </div>
      </section>

      <!-- Section 4: 이메일 (주소 앞 + host 분리, 각각 InputField) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">이메일</h2>
        <div class="text-gray-500">이메일 주소(앞)와 host(도메인)를 분리하여 각각 InputField 로 구성했습니다.</div>

        <div class="w-[480px] space-y-1.5">
          <Label>이메일</Label>
          <div class="flex items-start gap-2">
            <InputField
              v-model="email.local"
              class="flex-1"
              placeholder="이메일 주소"
              :aria-invalid="!!emailError || undefined"
              @blur="validateEmail"
            />
            <span class="pt-2 text-muted-foreground">@</span>
            <InputField
              v-model="email.host"
              class="flex-1"
              placeholder="example.com"
              :aria-invalid="!!emailError || undefined"
              @blur="validateEmail"
            />
          </div>
          <p v-if="emailError" class="text-sm text-destructive">{{ emailError }}</p>
          <p v-else-if="fullEmail" class="text-sm text-muted-foreground">입력된 이메일: {{ fullEmail }}</p>
        </div>
      </section>

      <!-- Section 5: 기타 정보 (도움말 + 글자수 카운터) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">기타 정보</h2>
        <div class="text-gray-500">도움말과 글자수 카운터를 함께 제공하는 입력입니다. 최대 100자까지 입력할 수 있습니다.</div>

        <div class="w-[480px]">
          <InputField
            v-model="etc"
            label="기타 정보"
            description="신청 이유를 100자 이내로 간단히 작성해 주세요."
            placeholder="내용을 입력해 주세요."
            :maxlength="100"
            show-count
          />
        </div>
      </section>

      <!-- Section 6: 상태 (Disabled / Readonly) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">입력 상태</h2>
        <div class="text-gray-500">비활성화(disabled)와 읽기 전용(readonly) 상태 예시입니다.</div>

        <div class="flex gap-6">
          <div class="w-[220px]">
            <InputField label="비활성화" placeholder="입력할 수 없습니다." disabled />
          </div>
          <div class="w-[220px]">
            <InputField label="읽기 전용" model-value="수정할 수 없는 값" readonly />
          </div>
        </div>
      </section>


      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">커스텀(InputField2 컴포넌트 사용)</h2>
        <div class="text-gray-500">InputField2</div>
        <div>
          <div class="w-[480px] mb-3">
            <label for="input11">개별 라벨</label>
            <InputField2 id="input11" placeholder="플레이스홀더" clearable></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="사이즈 md" placeholder="플레이스홀더" size="md" label-position="left"></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="사이즈 sm" placeholder="플레이스홀더" size="sm" clearable></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="설명버튼" description="안녕?"></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="아이콘 있을 때" :icon="sampleIcon" iconClass="size-8" clearable></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="비활성화" value="123" :icon="sampleIcon" iconClass="size-8" clearable disabled></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="메시지 있는 input" value="123" message="complete메시지" iconClass="size-8" clearable></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 label="메시지 있는 input(error)" value="123" borderStyle="error" message="error메시지" message-type="error" iconClass="size-8" clearable></InputField2>
          </div>
          <div class="w-[480px] mb-3">
            <InputField2 description="안녕" label="메시지 있는 input(error)" value="123" borderStyle="error" message="error메시지" message-type="error" iconClass="size-8" clearable></InputField2>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import InputField from '@/components/custom/input/InputField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Label } from '@/components/ui/label'
import sampleIcon from '@/assets/icon/icon_sample.svg'

/**
 * 기본 구조 예시용 값
 */
const anatomyValue = ref('')

/**
 * 이름 - 필수 입력 처리
 */
const name = ref('')
const nameError = ref('')
const validateName = () => {
  nameError.value = name.value.trim() ? '' : '이름을 입력해 주세요.'
}

/**
 * 전화번호 - 3개 필드로 분리, 숫자만 입력 / 자리수 제한
 */
const phone = reactive({ first: '', middle: '', last: '' })
const phoneError = ref('')

/** 숫자만 남기고 최대 자리수로 자름 */
const onlyDigits = (value: string, max: number) =>
  value.replace(/[^0-9]/g, '').slice(0, max)

// 각 필드에 숫자만 유지되도록 정규화
watch(phone, () => {
  phone.first = onlyDigits(phone.first, 3)
  phone.middle = onlyDigits(phone.middle, 4)
  phone.last = onlyDigits(phone.last, 4)
})

const validatePhone = () => {
  const { first, middle, last } = phone
  if (!first && !middle && !last) {
    phoneError.value = ''
    return
  }
  phoneError.value =
    first.length >= 2 && middle.length >= 3 && last.length === 4
      ? ''
      : '전화번호를 정확히 입력해 주세요.'
}

/**
 * 이메일 - 주소(local)와 host를 분리
 */
const email = reactive({ local: '', host: '' })
const emailError = ref('')

/** 두 필드를 합친 전체 이메일 */
const fullEmail = computed(() =>
  email.local && email.host ? `${email.local}@${email.host}` : '',
)

const validateEmail = () => {
  if (!email.local && !email.host) {
    emailError.value = ''
    return
  }
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail.value)
    ? ''
    : '올바른 이메일 주소를 입력해 주세요.'
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
