<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6 ">
        <h1 class="text-2xl font-bold ">Dialog & Select 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        Dialog & Select 커스텀 컴포넌트 사용 예시 페이지입니다
      </div>


      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Dialogs 사용 예시</h2>
        <div class="flex gap-4">

          <Button @click="handleConfirmDialog">
            확인 Dialog 생성
          </Button>

          <Button @click="handleAlertDialog">
            알림 Dialog 생성
          </Button>

          <Button @click="handleFormeDialog">
            Form Dialog 생성
          </Button>

        </div>
      </section>

      <!-- Section: GenericDialog (Layer Pop-up) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">Layer Pop-up (GenericDialog) 사용 예시</h2>
        <p class="text-sm text-gray-500">
          슬롯 기반 범용 레이어 팝업입니다. size(소/중/대)와 커스텀 하단 버튼을 지원합니다.
        </p>
        <div class="flex flex-wrap gap-4">
          <Button variant="outline" @click="openGeneric('sm')">소형(sm) 팝업</Button>
          <Button variant="outline" @click="openGeneric('md')">중형(md) 팝업</Button>
          <Button variant="outline" @click="openGeneric('lg')">대형(lg) 팝업</Button>
          <Button @click="customDialogOpen = true">커스텀 Footer 팝업</Button>
        </div>
      </section>

      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">Select 사용 예시</h2>
        <div class="flex gap-4">
          <BaseSelect v-model="selectedValue" :options="sampleFruitOptions" placeholder="과일을 선택하세요"
            width-class="w-[150px]" />

          <p class="mt-2 text-sm text-muted-foreground" v-if="selectedValue">
            선택된 과일: {{ selectedValue }}
          </p>
        </div>
      </section>

      <!-- Section 3: Toast (Sonner) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">알림 (Sonner Toast) 예시</h2>
        <div class="flex flex-wrap gap-4">
          <Button @click="showToast">알림</Button>
          <Button variant="outline" @click="showSuccess">성공</Button>
          <Button variant="destructive" @click="showError">오류</Button>
        </div>
      </section>
    </div>

    <!-- GenericDialog: size 예시 -->
    <GenericDialog
      v-model:open="genericDialogOpen"
      :title="genericDialogTitle"
      description="레이어 팝업 관련 설명을 작성합니다."
      :size="genericDialogSize"
      @confirm="handleGenericConfirm"
    >
      <div class="space-y-3 text-sm text-gray-600">
        <p>기존 페이지 위에 레이어를 깔아서 보여주는 레이어 팝업입니다.</p>
        <p v-for="n in 12" :key="n">
          본문 내용 {{ n }} — 내용이 많아지면 본문 영역이 자동으로 스크롤됩니다.
        </p>
      </div>
    </GenericDialog>

    <!-- GenericDialog: 커스텀 Footer 예시 -->
    <GenericDialog
      v-model:open="customDialogOpen"
      title="커스텀 Footer 팝업"
      size="md"
    >
      <p class="text-sm text-gray-600">
        footer 슬롯을 이용해 하단 버튼 영역을 자유롭게 구성할 수 있습니다.
      </p>
      <template #footer="{ cancel }">
        <Button variant="ghost" @click="cancel">닫기</Button>
        <Button variant="destructive" @click="handleCustomDelete">삭제</Button>
        <Button @click="handleCustomSave">저장</Button>
      </template>
    </GenericDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner';
import { useDialog } from '@/composable/dialog/dialog'
import { z } from 'zod'
import type { Config } from '@/components/ui/auto-form'
import BaseSelect from '@/components/select/BaseSelect.vue';
import GenericDialog from '@/components/custom/dialog/GenericDialog.vue';

const dialog = useDialog()

/**
 * GenericDialog (Layer Pop-up) 샘플 코드
 */
type DialogSize = 'sm' | 'md' | 'lg'

const genericDialogOpen = ref(false)
const genericDialogSize = ref<DialogSize>('md')
const genericDialogTitle = ref('레이어 팝업 예시')
const customDialogOpen = ref(false)

const openGeneric = (size: DialogSize) => {
  genericDialogSize.value = size
  genericDialogTitle.value = `레이어 팝업 예시 (${size})`
  genericDialogOpen.value = true
}

const handleGenericConfirm = () => {
  genericDialogOpen.value = false
  toast.success('확인', {
    description: '레이어 팝업에서 확인을 눌렀습니다.',
  })
}

const handleCustomSave = () => {
  customDialogOpen.value = false
  toast.success('저장 완료', {
    description: '저장 버튼을 눌렀습니다.',
  })
}

const handleCustomDelete = () => {
  customDialogOpen.value = false
  toast.error('삭제됨', {
    description: '삭제 버튼을 눌렀습니다.',
  })
}

/**
 * Confirm Dialog 샘플 코드 
 */
const handleConfirmDialog = async () => {

  try {
    const result = await dialog.confirm({
      title: 'Confirm Dialog 예시',
      description: 'Confirm Dialog 관련 설명을 작성합니다.',
      btnOk: '확인',
      btnCancel: '취소'
    })

    if (result.confirmed) {
      toast.success('확인', {
        description: '확인 알림입니다.',
      })
    }
  } catch (error) {
    toast.error('오류', {
      description: '오류 알림입니다.',
    })
  }
}

/**
 * Alert Dialog 샘플 코드 
 */
const handleAlertDialog = async () => {

  await dialog.alert({
    title: 'Alert Dialog 예시',
    description: 'Alert Dialog 관련 설명을 작성합니다.',
    btnCancel: '확인'
  })

}

/**
 * Form Dialog 샘플 코드
 */
const createSchema = z.object({
  name: z.string().describe('이름').min(1, '필수값입니다'),
  nickname: z.string().describe('닉네임').nullish(),
})
const fieldConfig: Config<z.infer<typeof createSchema>> = {
  name: {
    inputProps: {
      placeholder: '이름을 입력해주세요'
    }
  },
  nickname: {
    inputProps: {
      placeholder: '사용자명을 입력해주세요'
    }
  }
}
const handleFormeDialog = async () => {
  try {
    const result = await dialog.form({
      title: 'Form Dialog 예시',
      description: 'Form Dialog 관련 설명을 작성합니다..',
      submitText: '확인',
      cancelText: '취소',
      schema: createSchema,
      fieldConfig,
      initialValues: {
        name: '',
        username: undefined,
      },
    })

    if (result.confirmed) {
      toast.success('성공', {
        description: '폼이 제출되었습니다',
      })
    }
  } catch (error) {
    toast.error('오류', {
      description: '폼 제출에 실패했습니다.',
    })
  }
}

/**
 * Toast 알림 테스트 코드
 */
const showToast = () => {
  toast('알림', {
    description: '기본 토스트 테스트입니다.',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  })
}

const showSuccess = () => {
  toast.success('성공', {
    description: '정상적으로 처리되었습니다.',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  })
}

const showError = () => {
  toast.error('오류', {
    description: '처리에 실패했습니다.',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  })
}

/**
 * Select 샘플 코드
 */
const selectedValue = ref<string>('')

const sampleFruitOptions = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
  { label: '블루베리', value: 'blueberry' },
  { label: '포도', value: 'grapes' },
  { label: '파인애플', value: 'pineapple' },

]

</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>