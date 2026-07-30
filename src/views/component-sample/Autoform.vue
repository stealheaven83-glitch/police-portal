<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)]">
        <div class="flex justify-between items-center mb-6 ">
        <h1 class="text-2xl font-bold ">Autoform 샘플</h1>
        </div>
        
        <div class="text-gray-500 pb-10">
            Autoform 컴포넌트 사용 예시 페이지입니다
        </div>

        <AutoForm 
            class="space-y-6"
            :schema="formSchema"
            :field-config="fieldConfig"
            :key="formKey"
            @submit="handleSubmit">
            
            <div class="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" @click="handelCancle">취소</Button>
                <Button type="submit">저장</Button>
            </div>
        </AutoForm>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { AutoForm, type Config } from '@/components/ui/auto-form'


// form 스키마
const formSchema = z.object({
  name: z.string().describe('이름').min(1, '이름을 입력해주세요'),
  age: z.number().describe('나이').nullish(),
  sex: z.enum(['남', '여']).describe('성별').nullish()
})

const fieldConfig: Config<z.infer<typeof formSchema>> = {
  name: {
    inputProps: {
      placeholder: '이름을 입력해주세요'
    }
  },
  age: {
    inputProps: {
      placeholder: '나이를 입력해주세요'
    }
  },
  sex: {
    component: 'select' as const,
    description: '성별을 선택해주세요'
  }
}

/**
 * 제출 후 로직
 */
const handleSubmit = async (data: any) => {
  console.log('submit data:', data)

  // TODO: API 호출 연결
  // await api.save(data)

}

/**
 * 취소 후 로직
 */
const formKey = ref(0)

const handelCancle = () => {
  console.log('취소')
  formKey.value += 1
}


</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}
</style> 