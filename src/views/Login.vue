<script setup lang="ts">
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { AutoForm } from '@/components/ui/auto-form'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
// import { useApi } from '@/modules/api'

const router = useRouter()
// const api = useApi()

const loginSchema = z.object({
  userId: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

const fieldConfig = {
  userId: {
    label: '아이디',
    component: 'string' as const,
    inputProps: {
      placeholder: '아이디를 입력하세요',
    },
  },
  password: {
    label: '비밀번호',
    component: 'string' as const,
    inputProps: {
      type: 'password',
      placeholder: '비밀번호를 입력하세요',
    },
  },
}

const onSubmit = async (values: z.infer<typeof loginSchema>) => {
  console.log(values)

  try {
    // const response = await api.authApi.login({
    //   userId: values.userId,
    //   password: values.password,
    // })
    // console.log(response)
    toast.success('로그인 성공', {
      description: '환영합니다!',
    })
    router.push('/')

  } catch (error: any) {
    console.log(error)
    if (error.response?.data?.state === '4019' || error.response?.data?.state === 4019) {
      console.log(error.response?.data.result)
    }
    if (error.response?.data?.state === '401') {
      toast.error('로그인 실패', {
        description: '아이디 또는 비밀번호가 올바르지 않습니다.',
      })
    } else {
      toast.error('오류', {
        description: '로그인 중 오류가 발생했습니다.',
      })
    }
  }
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          로그인
        </h2>
      </div>

      <AutoForm :schema="loginSchema" :field-config="fieldConfig" @submit="onSubmit" class="">
        <template #default>
          <Button type="submit">
            로그인
          </Button>
        </template>
      </AutoForm>
    </div>
  </div>
</template>

<style scoped></style>