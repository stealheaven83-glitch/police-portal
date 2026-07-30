<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Bottom Sheet 샘플</h1>
          <p class="text-muted-foreground text-sm mt-1">
            바텀 시트는 주요 콘텐츠 또는 선택 옵션을 일시적으로 집중하여 볼 수 있도록 모바일에서 주로 사용합니다.
            모바일 기기 화면의 하단 가장자리에 고정하여 모달 형태로 표현합니다.
          </p>
        </div>
      </div>

      <div class="text-gray-500 pb-10">
        <code class="text-primary">@/components/custom/bottom-sheet</code> 의
        <strong>BottomSheet</strong> 커스텀 컴포넌트(shadcn-vue Drawer / vaul-vue 래핑)를 이용한 예시입니다.
        <strong>① 오버레이 · ② 헤더 · ③ 본문 · ④ 푸터 · ⑤ 닫기 버튼</strong>의 5가지 구조 요소가 컴포넌트 내부에 캡슐화되어 있습니다.
      </div>

      <!-- Section 1: 기본 구조 (trigger 슬롯 사용, 이미지 참고) -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold border-b pb-2">기본 구조</h2>
        <p class="text-gray-500">
          이미지의 구조(① 오버레이, ② 헤더, ③ 본문, ④ 푸터, ⑤ 닫기 버튼)를 그대로 구현한 예시입니다.
          <code>trigger</code> 슬롯으로 여는 버튼을, 기본 <code>footer</code>(확인/취소)를 사용합니다.
        </p>

        <BottomSheet
          v-model:open="basicOpen"
          title="타이틀"
          description="바텀 시트에서 제공하는 콘텐츠나 요청하는 행동에 대한 간단한 요약 정보를 제공합니다."
          confirm-text="버튼"
          cancel-text="버튼"
          @confirm="onBasicConfirm"
        >
          <template #trigger>
            <Button>바텀 시트 열기</Button>
          </template>

          <!-- ③ 본문 -->
          <div class="space-y-3 mb-4">
            <div class="h-3 w-3/4 rounded bg-muted" />
            <div class="h-3 w-full rounded bg-muted" />
          </div>
          <div
            class="flex aspect-video w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-sm">
            본문 콘텐츠 영역
          </div>
        </BottomSheet>
      </section>

      <!-- Section 2: 선택 옵션 (v-model:open 으로 제어, footer 미사용) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-xl font-semibold border-b pb-2">선택 옵션</h2>
        <p class="text-gray-500">
          짧은 상호작용을 위해 선택 옵션을 제공하는 바텀 시트입니다.
          <code>v-model:open</code> 으로 열림 상태를 직접 제어하고 <code>show-footer</code> 를 끕니다.
        </p>

        <Button variant="outline" @click="selectOpen = true">옵션 선택</Button>

        <BottomSheet
          v-model:open="selectOpen"
          title="정렬 기준 선택"
          description="목록을 정렬할 기준을 선택하세요."
          :show-close-button="false"
          :show-footer="false"
        >
          <div class="-m-2">
            <button v-for="option in sortOptions" :key="option.value" type="button"
              class="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-accent"
              @click="selectSort(option.value)">
              <span>{{ option.label }}</span>
              <Check v-if="selectedSort === option.value" class="size-4 text-primary" />
            </button>
          </div>
        </BottomSheet>

        <p v-if="selectedSort" class="text-sm text-muted-foreground">
          선택된 정렬 기준: {{ sortOptions.find(o => o.value === selectedSort)?.label }}
        </p>
      </section>

      <!-- Section 3: 입력 폼 & 행동 확정 (기본 footer + confirm 이벤트) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-xl font-semibold border-b pb-2">입력 폼 &amp; 행동 확정</h2>
        <p class="text-gray-500">
          본문에 입력 폼을 제공하는 경우, 입력 관련 컨트롤은 본문 영역에 배치하고
          행동을 확정하거나 취소하는 액션(<code>footer</code>)은 항상 푸터에 제공합니다.
        </p>

        <BottomSheet
          v-model:open="formOpen"
          title="프로필 수정"
          description="변경 후 저장 버튼을 눌러 완료하세요."
          confirm-text="저장"
          cancel-text="취소"
          @confirm="submitForm"
        >
          <template #trigger>
            <Button variant="secondary">프로필 수정</Button>
          </template>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <Label for="name">이름</Label>
              <Input id="name" v-model="form.name" placeholder="이름을 입력하세요" />
            </div>
            <div class="space-y-1.5">
              <Label for="email">이메일</Label>
              <Input id="email" v-model="form.email" type="email" placeholder="이메일을 입력하세요" />
            </div>
          </div>
        </BottomSheet>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { BottomSheet } from '@/components/custom/bottom-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** 기본 구조 바텀 시트 - 확인(버튼) 클릭 시 닫고 알림 */
const basicOpen = ref(false)
const onBasicConfirm = () => {
  basicOpen.value = false
  toast('확인', { description: '기본 구조 바텀 시트에서 확인했습니다.' })
}

/** 선택 옵션 바텀 시트 */
const selectOpen = ref(false)
const selectedSort = ref<string>('')
const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'name', label: '이름순' },
  { value: 'popular', label: '인기순' },
]
const selectSort = (value: string) => {
  selectedSort.value = value
  selectOpen.value = false
}

/** 입력 폼 바텀 시트 */
const formOpen = ref(false)
const form = reactive({
  name: '',
  email: '',
})
const submitForm = () => {
  formOpen.value = false
  toast('저장 완료', {
    description: `${form.name || '이름 미입력'} 님의 프로필이 저장되었습니다.`,
  })
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
