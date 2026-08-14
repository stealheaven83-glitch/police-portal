<template>
    <Button @click="handleConfirmDialog">
        근무자 추가
    </Button>
</template>

<script setup lang="ts">
import { useDialog } from '@/composable/dialog/dialog'
import { toast } from 'vue-sonner';
const dialog = useDialog()
const handleConfirmDialog = async () => {

    try {
        const result = await dialog.workerSelect({
        title: '근무자 추가',
        subtitle : '* 추가 근무자를 선택 후 저장하세요.',
        btnOk: '저장',
        btnCancel: '닫기'
        })

        if (result.confirmed) {
        toast.success('확인', {
            description: `${result.value?.length ?? 0}명 선택되었습니다.`,
        })
        }
    } catch (error) {
        toast.error('오류', {
        description: '오류 알림입니다.',
        })
    }
}
</script>