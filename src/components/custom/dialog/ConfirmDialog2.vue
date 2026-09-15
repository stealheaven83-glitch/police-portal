<script lang="ts" setup>
  import { computed, ref } from 'vue'

  import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog'

  import closeIcon from '@/assets/icon/icon_popup_x.svg?url'
  import { Button } from '@/components/custom/button'
  import { dialogDeviceClass, type DialogDevice } from './dialogDevice'

  // Props 정의
  const props = defineProps<{
    /** **HTML 태그를 넣을 수 있다**(v-html) — 아이콘은 `<img src="/portal/asset/images/icon/...">` */
    title: string
    subtitle?: string
    description?: string
    btnOk?: string
    btnCancel?: string
    /** 어느 화면 기준으로 그리나. 기본 'responsive' — dialogDevice.ts 참고 */
    device?: DialogDevice
  }>()

  /** 기기별 치수는 police-override.css 의 .lp-dialog-* 가 CSS 변수로 들고 있다 */
  const deviceClass = computed(() => dialogDeviceClass(props.device))

  const open = ref(false)

  let onConfirmCallback: ((value: any) => void) | null = null
  let onCancelCallback: (() => void) | null = null  

  // 부모에게 open 함수를 노출
  defineExpose({
    openDialog: () => {
      open.value = true
      const chainableAPI = {
        onOk(callback: (value: any) => void) {
          onConfirmCallback = callback
          return chainableAPI
        },
        onCancel(callback: () => void) {
          onCancelCallback = callback
          return chainableAPI
        },
      }
      return chainableAPI
    },
    closeDialog: () => {
      onConfirmCallback = null
      onCancelCallback = null
      open.value = false
    },
  })

  function handleConfirm() {
    onConfirmCallback?.(true)
    open.value = false
  }

  function handleCancel() {
    onCancelCallback?.()
    open.value = false
  }

  
  function addClass(){
    const returnClass = {
      wrapper: '',
      header: '',
      desc: '',
      btn: '',
    };

    switch(props.device){
      case 'mobile':
        returnClass.wrapper = '!gap-0';
        returnClass.header = 'hidden';
        returnClass.desc = 'min-h-auto';
        returnClass.btn = 'flex-1 w-full';
        break;
        case 'responsive':
          returnClass.wrapper = 'mo:!gap-0';   // important 는 변형 뒤에 붙는다(!mo:gap-0 은 안 나온다)
          returnClass.header = 'mo:hidden';
          returnClass.desc = 'mo:min-h-auto';
          returnClass.btn = 'mo:flex-1 mo:w-full';
      break;
    }

    return returnClass;

  }

</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent
      class="px-6 pt-6 gap-0"
      :class="[description ? 'pb-[3.2rem]' : 'pb-[3.4rem]', deviceClass, addClass().wrapper]"
      :style="{ width: 'calc(100% - 2rem)' }"
    >
      <AlertDialogHeader class="flex justify-end flex-row" :class="addClass().header">
        <!-- <button type="button" @click="handleCancel">
          <img :src="closeIcon" alt="닫기 버튼" />
        </button> -->
      </AlertDialogHeader>
      <div class="min-h-21 text-center flex flex-col justify-center">
        <!-- title 은 태그를 받는다(아이콘용) — 문구는 우리가 넣는 상수라 v-html 이다 -->
        <AlertDialogTitle class="lp-dialog-title text-[2.4rem] font-[700]">
          <span v-html="title"></span>
        </AlertDialogTitle>
         <p v-if="subtitle" class="mt-2 text-[1.5rem] text-[var(--Text-body_2)]">
          {{ subtitle }}
        </p>
        <div v-if="description" class="lp-dialog-desc-box max-h-30 overflow-y-auto bg-[#F4F5F6] mt-4 mb-2 rounded-[8px] min-h-21" :class="addClass().desc">
          <AlertDialogDescription class="lp-dialog-desc flex items-center justify-center text-[1.7rem]/[150%] p-4 text-[var(--Text-body_0)]">
            {{ description }}
          </AlertDialogDescription>
        </div>
      </div>
      <AlertDialogFooter class="lp-dialog-footer justify-center sm:justify-center mt-4">
        <Button variant="tertiary2" size="md" @click="handleCancel" :class="addClass().btn">
          {{ btnCancel ?? '취소' }}
        </Button>
        <Button variant="primary" size="md" @click="handleConfirm" :class="addClass().btn">
          {{ btnOk ?? '확인' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
