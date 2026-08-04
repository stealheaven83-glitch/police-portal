<script setup lang="ts">
import { ref } from "vue"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const selectedStates1 = ref("state1")
const selectedStates2 = ref("state2")
const selectSizes = ref("")
const selectHelp = ref("help1")
const selectSample = ref("sample1");

const scores = ref({
  q1: "1", // 1번 항목 초기값
  q2: "5", // 2번 항목 초기값
})
const etcText = ref("")
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Radio Group</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 라디오 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">States</h2>
          <div class="flex flex-wrap gap-6">
            <RadioGroup v-model="selectedStates1" class="flex flex-wrap gap-6">
              <RadioGroupItem value="state1" label="Default" size="default" />
              <RadioGroupItem value="state2" label="checked" size="default" />
            </RadioGroup>
            <RadioGroup v-model="selectedStates2" class="flex flex-wrap gap-6">
              <RadioGroupItem value="state1" label="disabled" size="default" disabled />
              <RadioGroupItem value="state2" label="checked + disabled" size="default" disabled />
            </RadioGroup>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sizes</h2>
          <RadioGroup v-model="selectSizes" class="flex flex-wrap gap-6 p-4">
            <RadioGroupItem value="size1" label="Default" size="default" />
            <RadioGroupItem value="size2" label="Large" size="lg" />
          </RadioGroup>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Help Text</h2>
          <div class="flex items-start flex-wrap gap-8">
            <RadioGroup v-model="selectHelp" class="grid grid-cols-3 gap-4">
              <div class="group flex flex-col gap-1">
                <RadioGroupItem value="help1" label="Help Text" />
                <p class="pl-7 text-[1.3rem] text-[#464C53] group-has-[[disabled]]:text-[#8A949E]">
                  다크모드 컬러 필요.<br/>dark:text-[white] dark:group-has-[[disabled]]:text-[white]
                </p>
              </div>
              <div class="group flex flex-col gap-1">
                <RadioGroupItem value="help2" label="Help Text" />
                <p class="pl-7 text-[1.3rem] text-[#464C53] group-has-[[disabled]]:text-[#8A949E]">
                   상위 group 클래스를 넣어줘야 컬러가 같이 적용됩니다.
                </p>
              </div>
              <div class="group flex flex-col gap-1">
                <RadioGroupItem value="help3" label="Help Text" disabled />
                <p class="pl-7 text-[1.3rem] text-[#464C53] group-has-[[disabled]]:text-[#8A949E]">
                   disabled 적용
                </p>
              </div>

            </RadioGroup>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sample</h2>
          <table class="w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr class="bg-gray-100 dark:bg-gray-800">
                <th class="p-3 text-left border">평가 항목</th>
                <!-- 1~10 헤더 생성 -->
                <th v-for="num in 10" :key="num" class="p-3 border w-12">{{ num }}</th>
              </tr>
            </thead>
            <tbody>
              <RadioGroup as="tr" v-model="scores.q1" class="border-b">
                <td class="p-3 text-left font-medium border">서비스 만족도</td>
                
                <!-- 1~10 라디오 버튼 td 출력 -->
                <td v-for="num in 10" :key="num" class="p-3 border">
                  <RadioGroupItem 
                    :value="String(num)" 
                    :aria-label="`서비스 만족도 ${num}점`"
                  />
                </td>
              </RadioGroup>

              <!-- 항목 2 -->
              <RadioGroup as="tr" v-model="scores.q2" class="border-b">
                <td class="p-3 text-left font-medium border">응대 친절도</td>
                <td v-for="num in 10" :key="num" class="p-3 border">
                  <RadioGroupItem 
                    :value="String(num)" 
                    :aria-label="`응대 친절도 ${num}점`"
                  />
                </td>
              </RadioGroup>
              <tr>
                <td colspan="11" class="p-3">
                  <div class="flex flex-wrap gap-2">
                    <RadioGroup v-model="selectSample" class="inline-flex flex-wrap gap-6">
                      <RadioGroupItem value="sample1" label="112신고" />
                      <RadioGroupItem value="sample2" label="고소장접수" />
                      <RadioGroupItem value="sample3" label="기타" />
                    </RadioGroup>
                    <input
                      v-model="etcText"
                      type="text"
                      :disabled="selectSample !== 'sample3'"
                      placeholder="input컴포넌트넣기"
                      class="h-9 rounded-md border border-gray-300 px-3 text-sm transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
