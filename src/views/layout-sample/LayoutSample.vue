<template>
  <div class="p-6">
    <div class="grid grid-cols-2 gap-6">
      <!-- 좌측: 사용자 목록 -->
      <div class=" p-6 bg-white rounded-lg h-[calc(100vh-200px)] overflow-y-auto">

        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">사용자 목록</h1>
          <Button @click="handleCreate">
            <Plus class="mr-2 h-4 w-4"  />
            사용자 추가
          </Button>
        </div>

        <TableWrapper
          :columns="columns"
          :items="managers"
          :loading="loading"
          :show-pagination="true"
          :items-per-page="pagination.pageSize"
          :total-elements="pagination.totalElements"
          :current-page="pagination.currentPage + 1"
          :total-pages="pagination.totalPages"
          :selectable="true"
          @page-change="handlePageChange"
          @select-row="handleRowSelect"
        />

      </div>

      <!-- 우측: 사용자 관리 -->
      <div class="p-6 bg-white rounded-lg h-[calc(100vh-200px)]">

        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">사용자 상세 정보</h1>
        </div>

        <div v-if="!selectedManagerId" class="text-center text-gray-500 py-8">
          사용자를 선택해주세요
        </div>

        <div v-else class="pt-2">
          <AutoForm
            class="space-y-6"
            :schema="detailSchema"
            :field-config="detailFieldConfig"
            :form="form"
            @submit="handleUpdate"
          />
          <div class="mt-6 flex justify-end">
            <Button variant="destructive" @click="handleDelete" class="mr-3">삭제</Button>
            <Button type="button" @click="handleUpdate">저장</Button>
          </div>
        </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { z } from 'zod'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { toast } from 'vue-sonner';
import { useDialog } from '@/composable/dialog/dialog'
import type { Config } from '@/components/ui/auto-form'
import type { ApiResponse } from '@/modules/api/types/auth.types'
import { managerApi } from '@/modules/api/managerApi'
import type { Manager } from '@/modules/api/types/manager.types'
import { AutoForm } from '@/components/ui/auto-form'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

// 상태 관리
const loading = ref(false)
const selectedManagerId = ref<string | null>()
const dialog = useDialog()
const managers = ref<Manager[]>([])
const pagination = ref({
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10
})

const columns = [
  { key: 'adminId', label: '사용자 ID', width: '120px' },
  { key: 'adminNm', label: '이름', width: '120px' },
  { key: 'emailAdr', label: '이메일', width: '200px' },
  { key: 'telNo', label: '전화번호', width: '150px' },
  { key: 'regDt', label: '등록일', width: '150px', type: 'dateTime' as const },
]

// 테이블 리스트업
const fetchListUp = async () => {
  try {
    loading.value = true
    const response = await managerApi.manager.list({ 
      page: pagination.value.currentPage, 
      size: pagination.value.pageSize, 
      searchTextCd: 'none' 
    }) as ApiResponse
    
    if (response?.result) {
      managers.value = response.result.content
      pagination.value = {
        totalElements: response.result.totalElements,
        totalPages: response.result.totalPages,
        currentPage: response.result.number,
        pageSize: response.result.size
      }
    }
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    toast.error('오류', {
      description: '사용자 목록 조회에 실패했습니다.',
    })
  } finally {
    loading.value = false
  }
}

// 테이블 페이징네이션
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page - 1 // 백엔드는 0-based pagination
  fetchListUp()
}

// 테이블 row 선택 시 작동
const handleRowSelect = ({ item }: { item: Manager }) => {
  selectedManagerId.value = item.adminId
}

// AutoForm 설정
const detailSchema = z.object({
  adminId: z.string().describe('사용자 ID'),
  adminNm: z.string().describe('이름').nullish(),
  emailAdr: z.string().email('올바른 이메일 형식을 입력해주세요').describe('이메일').nullish(),
  telNo: z.string().describe('전화번호').nullish(),
  useYn: z.enum(['Y', 'N']).describe('상태'),
  regDt: z.string().describe('등록일').optional()
})

const form = useForm({
  validationSchema: toTypedSchema(detailSchema),
  validateOnMount: false,
})

const detailFieldConfig: Config<z.infer<typeof detailSchema>> = {
  adminId: {
    inputProps: {
      disabled: true
    }
  },
  adminNm: {
    inputProps: {
      placeholder: '이름을 입력해주세요'
    }
  },
  emailAdr: {
    inputProps: {
      placeholder: '이메일을 입력해주세요',
      type: 'email'
    }
  },
  telNo: {
    inputProps: {
      placeholder: '전화번호를 입력해주세요'
    }
  },
  useYn: {
    component: 'select' as const,
    description: '활성화/비활성화 상태를 선택해주세요',
    inputProps: {
      placeholder: '상태를 선택해주세요'
    }
  },
  regDt: {
    inputProps: {
      disabled: true
    }
  }
}

watch(() => selectedManagerId.value, async (userId) => {
    if (userId != null) {

    try {
      loading.value = true
      const response = await managerApi.manager.detail({ 
        adminId: userId as string 
      }) as ApiResponse
      
      if (response?.result) {
        console.log('사용자정보', response.result)
        form.setValues({
          adminId: response.result.adminId,
          adminNm: response.result.adminNm,
          emailAdr: response.result.emailAdr,
          telNo: response.result.telNo,
          useYn: response.result.useYn,
          regDt: response.result.regDt
        })

      }
    } catch (error) {
      console.error('사용자 상세 정보 조회 실패:', error)
      toast.error('오류', {
        description: '사용자 정보를 불러오는데 실패했습니다.',
      })
    } finally {
      loading.value = false
    }
    }
  },
  { immediate: false }
)

const createSchema = z.object({
  adminId: z.string().describe('사용자 ID'),
  adminNm: z.string().describe('이름').nullish(),
  emailAdr: z.string().email('올바른 이메일 형식을 입력해주세요').describe('이메일').nullish(),
  telNo: z.string().describe('전화번호').nullish(),
  useYn: z.enum(['Y', 'N']).describe('상태'),
})

const createFieldConfig: Config<z.infer<typeof createSchema>> = {
  adminId: {
    inputProps: {
      placeholder: 'ID를 입력해주세요'
    }
  },
  adminNm: {
    inputProps: {
      placeholder: '이름을 입력해주세요'
    }
  },
  emailAdr: {
    inputProps: {
      placeholder: '이메일을 입력해주세요',
      type: 'email'
    }
  },
  telNo: {
    inputProps: {
      placeholder: '전화번호를 입력해주세요'
    }
  },
  useYn: {
    component: 'select' as const,
    description: '활성화/비활성화 상태를 선택해주세요',
    inputProps: {
      placeholder: '상태를 선택해주세요'
    }
  }
}

// 생성 핸들러
const handleCreate = async () => {
  console.log('생성버튼누름')

  try {
    const result = await dialog.form({
      title: '사용자 생성',
      description: '새로운 사용자를 생성합니다.',
      submitText: '생성',
      cancelText: '취소',
      schema: createSchema,
      createFieldConfig
    })

    if (!result.confirmed || !result.value) return

    await managerApi.manager.create({
      userId: result.value.adminId,
      adminName: result.value.adminNm,
      registerAsAdmin: result.value.registerAsAdmin,
      telNo: result.value.telNo,
      email: result.value.emailAdr
    })

    toast.success('성공', { description: '사용자가 생성되었습니다.' })
    fetchListUp()
    selectedManagerId.value = null

  } catch (error) {
    console.error('사용자 생성 실패:', error)
    toast.error('오류', { description: '사용자 생성에 실패했습니다.' })
  }
}

const handleUpdate = async () => {
  const { values } = form
  if (!values) return

  const isValid = await form.validate()
  if (!isValid.valid) {
    toast.error('오류',{
      description: '입력된 정보를 확인해주세요.'
    })
    return
  }

  try {
    await managerApi.manager.modify({
      adminId: values.adminId,
      adminName: values.adminNm,
      email: values.emailAdr,
      telNo: values.telNo,
      useYn: values.useYn,
    })

    toast.success('성공',{
      description: '사용자 정보가 수정되었습니다.'
    })

    fetchListUp()
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error)
    toast.error('오류',{
      description: '사용자 정보 수정에 실패했습니다.'
    })
  }
}

const handleDelete = async () => {
  const { values } = form
  if (!values) return

  const isValid = await form.validate()
  if (!isValid.valid) {
    toast.error('오류',{
      description: '입력된 정보를 확인해주세요.'
    })
    return
  }

  try {
    await managerApi.manager.delete({
      adminId: values.adminId,
    })

    toast.success('성공',{
      description: '사용자 정보가 삭제되었습니다.'
    })

    fetchListUp()
    selectedManagerId.value = null
  } catch (error) {
    console.error('사용자 정보 삭제 실패:', error)
    toast.error('오류',{
      description: '사용자 정보 삭제에 실패했습니다.'
    })
  }
}

onMounted(() => {
  // 초기 목록 조회
  fetchListUp()
  selectedManagerId.value = null
})

</script>
