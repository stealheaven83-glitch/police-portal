<template>
  <GenericDialog2 :open="open" title="공인인증서 등록" :size="560" @update:open="onUpdateOpen">
    <div :class="styles.dialogBody">
      <InputField2
        v-model="userId"
        label="아이디"
        label-position="top"
        label-class="text-[1.5rem] font-normal text-[var(--Text-body_1)]"
        placeholder="아이디를 입력하세요"
        clearable
        size="md"
        autocomplete="username"
      />

      <div :class="styles.pwField">
        <Label :class="styles.pwLabel" for="cert-password">비밀번호</Label>
        <div :class="styles.pwWrap">
          <Input
            id="cert-password"
            v-model="password"
            :type="pwVisible ? 'text' : 'password'"
            placeholder="비밀번호를 입력하세요"
            size="md"
            autocomplete="new-password"
            :class="styles.pwInput"
          />
          <div :class="styles.pwIcons">
            <button
              v-if="password"
              type="button"
              aria-label="입력값 지우기"
              @click="password = ''"
            >
              <img :src="iconClear" alt="" />
            </button>
            <!--
              기획서(PM-COM-0102) 1-1: 비밀번호는 클릭하고 있는 동안에만 평문으로 보이고,
              손을 떼면 다시 암호화 표시로 돌아간다 — 토글이 아니라 누르고 있는 동안만.
            -->
            <button
              v-if="password"
              type="button"
              :aria-label="pwVisible ? '비밀번호 숨기기' : '비밀번호 표시'"
              @mousedown="pwVisible = true"
              @mouseup="pwVisible = false"
              @mouseleave="pwVisible = false"
              @touchstart.prevent="pwVisible = true"
              @touchend.prevent="pwVisible = false"
            >
              <EyeOff v-if="pwVisible" :size="20" aria-hidden="true" />
              <Eye v-else :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        type="button"
        variant="primary"
        size="md"
        :class="styles.dialogSubmitBtn"
        :disabled="!canRegister"
        @click="onRegister"
      >
        로그인
      </Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Input from '@/components/custom/input/Input.vue'
import { Button } from '@/components/custom/button'
import iconClear from '@/assets/icon/_delete.svg?url'
import { useCertRegister } from '../composable/PM-COM-0101'
import styles from '../style/PM-COM-0101.module.css'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const { userId, password, pwVisible, canRegister, register, reset } = useCertRegister()

function onUpdateOpen(value: boolean) {
  emit('update:open', value)
}

function onRegister() {
  register(() => emit('update:open', false))
}

/** 팝업이 닫힐 때마다 다음에 열었을 때 깨끗한 상태로 시작하도록 입력값을 비운다 */
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) reset()
  },
)
</script>
