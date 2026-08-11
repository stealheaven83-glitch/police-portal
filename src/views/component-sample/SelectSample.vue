<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Select 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        Shadcn UI(reka-ui) 기반 Select 를 레이블 · 도움말 · 에러 메시지와 함께 묶은 커스텀
        <span class="text-primary font-medium">SelectField</span>
        컴포넌트 예시 페이지입니다. InputField2 와 동일한 레이블 위치/사이즈/테두리 규칙을 사용합니다.
      </div>

      <!-- Section 1: 기본 구조 -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">기본 구조</h2>
        <div class="text-gray-500">
          <span class="text-primary font-medium">SelectField</span> 하나로 레이블, 셀렉트 박스(플레이스홀더),
          도움말(선택), 에러 메시지를 구성합니다.
        </div>

        <div class="w-[360px]">
          <SelectField
            v-model="anatomyValue"
            label="레이블"
            required
            placeholder="선택해주세요."
            description="선택 시 필요한 정보에 대한 도움말을 제공합니다."
            :options="fruitOptions"
          />
        </div>
      </section>

      <!-- Section 2: 레이블 위치 (top / left) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">레이블 위치</h2>
        <div class="text-gray-500"><code>label-position</code> 로 레이블을 위/왼쪽에 배치할 수 있습니다.</div>

        <div class="flex gap-6">
          <div class="w-[280px]">
            <SelectField label="레이블" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
          <div class="w-[280px]">
            <SelectField label="Label" label-position="left" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
        </div>
      </section>

      <!-- Section 3: 사이즈 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">사이즈</h2>
        <div class="text-gray-500"><code>size</code> 로 lg(기본, 56px) / md(48px) / sm(40px) / xs(36px) 를 지정할 수 있습니다.</div>

        <div class="flex items-start gap-6">
          <div class="w-[240px]">
            <SelectField label="Label" size="lg" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
          <div class="w-[240px]">
            <SelectField label="Label" size="md" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
          <div class="w-[240px]">
            <SelectField label="Label" size="sm" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
          <div class="w-[240px]">
            <SelectField label="Label" size="xs" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
        </div>
      </section>

      <!-- Section 4: 상태 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">상태</h2>
        <div class="text-gray-500">기본 / 완료 / 에러 / 비활성화 상태 예시입니다. (포커스 상태는 클릭 또는 Tab 으로 확인)</div>

        <div class="flex items-start gap-6">
          <div class="w-[240px]">
            <SelectField label="Label" placeholder="선택해주세요." :options="fruitOptions" />
          </div>
          <div class="w-[240px]">
            <SelectField
              v-model="completeValue"
              label="Label"
              border-style="complete"
              message="완료 메시지"
              message-type="complete"
              :options="fruitOptions"
            />
          </div>
          <div class="w-[240px]">
            <SelectField
              label="Label"
              border-style="error"
              message="에러 메시지"
              message-type="error"
              error="선택 항목은 필수입니다."
              :options="fruitOptions"
            />
          </div>
          <div class="w-[240px]">
            <SelectField label="Label" placeholder="선택해주세요." disabled :options="fruitOptions" />
          </div>
        </div>
      </section>

      <!-- Section 5: 옵션 직접 구성 (#options 슬롯) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">옵션 직접 구성</h2>
        <div class="text-gray-500"><code>#options</code> 슬롯으로 그룹 등 옵션 목록을 직접 구성할 수 있습니다.</div>

        <div class="w-[280px]">
          <SelectField v-model="groupedValue" label="근무 부서" placeholder="부서를 선택해주세요.">
            <template #options>
              <SelectGroup>
                <SelectLabel>본청</SelectLabel>
                <SelectItem value="cyber">사이버수사대</SelectItem>
                <SelectItem value="traffic">교통관리계</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>지구대</SelectLabel>
                <SelectItem value="station1">중앙지구대</SelectItem>
                <SelectItem value="station2">동부지구대</SelectItem>
              </SelectGroup>
            </template>
          </SelectField>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select'

const fruitOptions = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
  { label: '포도', value: 'grape' },
]

const anatomyValue = ref<string>()
const completeValue = ref<string>('apple')
const groupedValue = ref<string>()
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
