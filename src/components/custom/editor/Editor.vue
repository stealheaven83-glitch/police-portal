<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ToastEditor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/ko-kr'

/**
 * 본문 작성용 에디터 (TOAST UI Editor 래퍼).
 * 화면마다 직접 new Editor(...) 하지 않도록 v-model 만 붙이면 되게 감싼 것.
 * 마크다운은 쓰지 않는 화면이 대부분이라 WYSIWYG 고정에 모드 전환을 숨긴다.
 */
interface Props {
  /** 본문 HTML (v-model) */
  modelValue?: string
  /** 에디터 높이 (CSS 길이) */
  height?: string
  placeholder?: string
  /** 마크다운 ↔ WYSIWYG 전환 버튼을 노출할지 */
  showModeSwitch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '40rem',
  placeholder: '',
  showModeSwitch: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const hostEl = ref<HTMLElement | null>(null)
let editor: ToastEditor | null = null

/** 우리가 내보낸 값이 v-model 로 되돌아왔을 때 다시 setHTML 하면 커서가 맨 앞으로 튄다 */
let lastEmitted = ''

onMounted(() => {
  if (!hostEl.value) return

  editor = new ToastEditor({
    el: hostEl.value,
    height: props.height,
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    language: 'ko-KR',
    placeholder: props.placeholder,
    initialValue: props.modelValue,
    hideModeSwitch: !props.showModeSwitch,
    events: {
      change: () => {
        lastEmitted = editor?.getHTML() ?? ''
        emit('update:modelValue', lastEmitted)
      },
    },
  })
})

watch(
  () => props.modelValue,
  (next) => {
    if (!editor || next === lastEmitted) return
    editor.setHTML(next ?? '')
  },
)

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})

defineExpose({
  /** Editor 인스턴스를 직접 다뤄야 할 때 */
  getEditor: () => editor,
})
</script>

<template>
  <div ref="hostEl" />
</template>
