<template>
  <div :class="cn('search-wrap', props.class)">
    <form
      class="search-bar"
      :class="{ 'no-bedge': !status, 'lp-has-clear': !!modelValue }"
      role="search"
      @submit.prevent="onSubmit"
    >
      <h2 class="blind">{{ label }}</h2>

      <div v-if="status" class="status-box">
        <span class="status-bedge" :class="statusTone">
          <i class="icon info" aria-hidden="true"></i>
          <span>{{ status }}</span>
        </span>
      </div>

      <div class="search-box">
        <input
          ref="inputRef"
          class="input-search"
          type="search"
          name="search_txt"
          autocomplete="off"
          :placeholder="placeholder"
          :aria-label="label"
          :value="modelValue"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button v-if="modelValue" type="button" class="lp-search-clear" @click="onClear">
          <span class="blind">검색어 지우기</span>
          <img src="/portal/asset/images/icon/ico_clear_32.svg" alt="" />
        </button>
        <button class="btn btn-search" type="submit" aria-label="검색하기"></button>
      </div>

      <button
        class="btn btn-voice"
        type="button"
        aria-label="음성검색"
        @click="emit('voice')"
      ></button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
import { cn } from "@/lib/utils"

/**
 * 통합검색 대형 검색바. 자세한 설명과 형제 컴포넌트 구분은 ./index.ts 주석 참고.
 * Figma: Form (13315:97548) — 높이 80, 테두리 2px, 우측 원형 버튼.
 *
 * 마크업은 포털 원본(Main.vue 의 .search-wrap)과 같은 구조다. 뱃지·돋보기·음성검색
 * 버튼 모양은 전부 police-style.css 의 `.search-wrap .search-bar ...` 규칙(693~782행)이
 * 그린다 — 그래서 여기에는 클래스 이름만 있고 스타일이 없다.
 * 음성검색 버튼은 그 CSS 에서 기본 display:none 이라 시안대로 안 보인다.
 */

/** 상태 뱃지 색 — police-style.css 의 `.status-bedge` 수식어 이름과 같아야 한다 */
type SearchStatusTone = "good" | "normal" | "busy"

interface Props {
  /** 검색어 */
  modelValue?: string
  placeholder?: string
  /** 왼쪽 상태 뱃지 문구. 없으면 뱃지를 안 그리고 .no-bedge 로 왼쪽 여백을 줄인다 */
  status?: string
  statusTone?: SearchStatusTone
  /** 검색 영역 제목 겸 입력 이름(스크린리더용) */
  label?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "검색어를 입력해주세요.",
  status: undefined,
  statusTone: "good",
  label: "검색어",
  class: undefined,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "search", value: string): void
  /** 음성검색 버튼 클릭. 버튼은 police-style.css 의 모바일 미디어쿼리에서만 보인다 */
  (e: "voice"): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onSubmit() {
  emit("search", props.modelValue)
}

/** 지우고 나서 바로 다시 칠 수 있게 입력에 포커스를 돌려준다 */
function onClear() {
  emit("update:modelValue", "")
  inputRef.value?.focus()
}

/** 호출부에서 검증 실패 뒤 커서를 입력창으로 되돌릴 때 쓴다 */
function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>
