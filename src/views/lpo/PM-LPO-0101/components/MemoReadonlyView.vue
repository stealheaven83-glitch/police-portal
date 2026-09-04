<template>
  <div class="lp-narrow-form">
    <div class="lp-form-body">
      <div class="lp-row-between">
        <div class="lp-meta-line">
          <!-- 기획서 3/3-1/3-2: 내 메모는 일시만, 받은 메모=보낸 사람·받은 일시,
               보낸 메모=받은 사람·보낸 일시 -->
          <span v-if="personLabel">{{ personLabel }}: {{ memo.person }}</span>
          <span>
            <template v-if="dateLabel">{{ dateLabel }}: </template>{{ memo.date }}&nbsp; {{ memo.time }}
          </span>
        </div>
        <div class="lp-icon-row">
          <button
            type="button"
            class="lp-icon-btn lp-icon-btn-24"
            :aria-label="memo.important ? '중요 해제' : '중요 표시'"
            @click="emit('toggle-important')"
          >
            <Icon :name="memo.important ? 'starFill' : 'star'" :size="24" />
          </button>
          <button type="button" class="lp-icon-btn lp-icon-btn-24" aria-label="공유" @click="emit('share')">
            <Icon name="share" :size="24" />
          </button>
        </div>
      </div>

      <div class="lp-view-field">
        <span class="lp-label-text">제목</span>
        <p class="lp-view-title">{{ memo.title }}</p>
      </div>

      <div class="lp-view-field">
        <span class="lp-label-text">내용</span>
        <p class="lp-view-content">{{ memo.content }}</p>
      </div>

      <div v-if="memo.summary" class="lp-field">
        <span class="lp-label-text">요약</span>
        <p class="lp-view-summary">{{ memo.summary }}</p>
      </div>

      <div v-if="memo.files.length" class="lp-field">
        <div class="lp-view-file-head">
          <span class="lp-label-text">첨부파일</span>
          <!-- 읽기 전용은 '/ 3개' 없이 첨부 개수만 표시 -->
          <b class="lp-view-file-count">{{ memo.files.length }}개</b>
        </div>
        <!-- 공통 FileUpload 의 readonly 상태 = Figma file_upload__atomic__pc (다운로드 · 바로보기) -->
        <div class="lp-file-list">
          <FileUpload
            v-for="(name, i) in memo.files"
            :key="i"
            :file-name="name"
            variant="circle"
            readonly
          />
        </div>
      </div>
    </div>

    <div class="lp-form-actions-center">
      <Button type="button" variant="tertiary2" size="md" class="w-30" @click="onDelete">삭제</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import Icon from '@/components/custom/icon/Icon.vue'
import { useDialog } from '@/composable/dialog/dialog'
import type { MemoItem } from '../composable/PM-LPO-0101'

/**
 * 받은 메모 · 보낸 메모 상세(PM-LPO-0102).
 * Figma `PC_지역경찰_01_개인수첩_01_메모_02_받은메모_상세`(10523:43293) — 입력 폼이 아니라
 * 읽기 전용 뷰다 — 기획서의 "받은 메모, 보낸 메모의 경우 전체 입력란 비활성화" 를
 * Figma 는 비활성 폼이 아니라 텍스트 뷰로 구현했다.
 * 내 메모 상세는 수정이 되므로 MemoForm.vue 를 쓴다.
 * 버튼도 삭제 하나뿐이고, 첨부는 다운로드·바로보기만 된다.
 */
interface Props {
  memo: MemoItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'share'): void
  (e: 'toggle-important'): void
}>()

const dialog = useDialog()

/** 내 메모는 사람 표시가 없고 일시도 라벨 없이 값만 나온다 */
const personLabel = computed(() => {
  if (props.memo.box === 'received') return '보낸 사람'
  if (props.memo.box === 'sent') return '받은 사람'
  return ''
})
const dateLabel = computed(() => {
  if (props.memo.box === 'received') return '받은 일시'
  if (props.memo.box === 'sent') return '보낸 일시'
  return ''
})

/** 기획서 11: 삭제는 되돌릴 수 없어 컨펌 후 목록으로 */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '삭제된 메모는 복구할 수 없습니다. 메모를 삭제 하시겠습니까?',
    btnOk: '삭제',
    btnCancel: '취소',
  })
  if (confirmed) emit('delete')
}
</script>
