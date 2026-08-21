<script setup lang="ts">
import { ref } from "vue"
import { ChecklistItem } from "@/components/custom/checklist-item"
import { Checkbox } from "@/components/custom/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/custom/radio-group"

const check1 = ref(false)
const check2 = ref(false)
const check3 = ref(false)
const radio1 = ref("")
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Checklist Item</h1>
          <p class="text-muted-foreground text-sm mt-1">
            번호 매겨진 점검 항목 컴포넌트 샘플입니다. 우측 응답 영역은 슬롯으로 체크박스/라디오 등을 그대로 넣습니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-6 animate-in fade-in duration-500 scrollbar-hide max-w-[560px]">
        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">강조 + 체크 (inline sub text)</h2>
          <div>
            <ChecklistItem :number="1" text="text" sub-text="sub text" emphasis>
              <Checkbox v-model="check1" label="해당함" />
            </ChecklistItem>
            <ChecklistItem :number="2" text="text" sub-text="sub text" layout="stacked">
              <Checkbox v-model="check2" label="해당함" />
            </ChecklistItem>
            <ChecklistItem :number="3" text="text">
              <Checkbox v-model="check3" label="해당함" />
            </ChecklistItem>
          </div>
        </section>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold text-muted-foreground">라디오</h2>
          <ChecklistItem :number="1" text="text">
            <RadioGroup v-model="radio1" class="flex items-center gap-4">
              <RadioGroupItem value="yes" label="예" />
              <RadioGroupItem value="no" label="아니오" />
              <RadioGroupItem value="unknown" label="확인안됨" />
            </RadioGroup>
          </ChecklistItem>
        </section>
      </div>
    </div>
  </div>
</template>
