<template>
  <section class="lp-comment-area" aria-label="댓글">
    <!-- 새 댓글 -->
    <div class="lp-comment-write">
      <p class="lp-comment-head">
        <b class="lp-comment-writer">{{ me }}</b>
        <span class="lp-comment-date">{{ nowLabel }}</span>
      </p>
      <TextareaField
        v-model="newComment"
        aria-label="댓글 입력"
        placeholder="내용을 입력하세요"
        :height="64"
      />
      <div class="lp-comment-actions">
        <Button type="button" variant="primary" size="sm" padding="16" @click="onAdd()">등록</Button>
      </div>
    </div>

    <!-- 댓글 목록 -->
    <ul class="lp-comment-list">
      <li v-for="comment in roots" :key="comment.id" class="lp-comment-item">
        <article class="lp-comment">
          <p class="lp-comment-head">
            <b class="lp-comment-writer">{{ comment.writer }}</b>
            <span class="lp-comment-date">{{ comment.createdAt }}</span>
            <button
              type="button"
              class="lp-comment-more"
              :aria-label="`${comment.writer} 댓글 메뉴`"
              @click="toggleMenu(comment.id)"
            >
              <MoreHorizontal :size="18" aria-hidden="true" />
            </button>
          </p>

          <template v-if="editingId === comment.id">
            <TextareaField v-model="editText" aria-label="댓글 수정" :height="64" />
            <div class="lp-comment-actions">
              <Button type="button" variant="tertiary2" size="sm" padding="16" @click="cancelEdit">취소</Button>
              <Button type="button" variant="tertiary2" size="sm" padding="16" @click="onRemove(comment.id)">삭제</Button>
              <Button type="button" variant="primary" size="sm" padding="16" @click="onSaveEdit(comment.id)">등록</Button>
            </div>
          </template>
          <template v-else>
            <p class="lp-comment-body">{{ comment.content }}</p>
            <div v-if="openMenuId === comment.id" class="lp-comment-actions">
              <Button type="button" variant="tertiary2" size="sm" padding="16" @click="startEdit(comment)">수정</Button>
              <Button type="button" variant="tertiary2" size="sm" padding="16" @click="onRemove(comment.id)">삭제</Button>
            </div>
            <button type="button" class="lp-comment-reply-btn" @click="toggleReply(comment.id)">
              <MessageSquare :size="16" aria-hidden="true" />
              {{ repliesOf(comment.id).length }}
            </button>
          </template>
        </article>

        <!-- 대댓글 -->
        <ul v-if="repliesOf(comment.id).length" class="lp-comment-replies">
          <li v-for="reply in repliesOf(comment.id)" :key="reply.id">
            <article class="lp-comment">
              <p class="lp-comment-head">
                <CornerDownRight :size="14" aria-hidden="true" />
                <b class="lp-comment-writer">{{ reply.writer }}</b>
                <span class="lp-comment-date">{{ reply.createdAt }}</span>
                <button
                  type="button"
                  class="lp-comment-more"
                  :aria-label="`${reply.writer} 답글 메뉴`"
                  @click="toggleMenu(reply.id)"
                >
                  <MoreHorizontal :size="18" aria-hidden="true" />
                </button>
              </p>

              <template v-if="editingId === reply.id">
                <TextareaField v-model="editText" aria-label="답글 수정" :height="64" />
                <div class="lp-comment-actions">
                  <Button type="button" variant="tertiary2" size="sm" padding="16" @click="cancelEdit">취소</Button>
                  <Button type="button" variant="primary" size="sm" padding="16" @click="onSaveEdit(reply.id)">저장</Button>
                </div>
              </template>
              <template v-else>
                <p class="lp-comment-body">{{ reply.content }}</p>
                <div v-if="openMenuId === reply.id" class="lp-comment-actions">
                  <Button type="button" variant="tertiary2" size="sm" padding="16" @click="startEdit(reply)">수정</Button>
                  <Button type="button" variant="tertiary2" size="sm" padding="16" @click="onRemove(reply.id)">삭제</Button>
                </div>
              </template>
            </article>
          </li>
        </ul>

        <!-- 답글 입력 -->
        <div v-if="replyToId === comment.id" class="lp-comment-replies">
          <div class="lp-comment-write">
            <p class="lp-comment-head">
              <b class="lp-comment-writer">{{ me }}</b>
              <span class="lp-comment-date">{{ nowLabel }}</span>
            </p>
            <TextareaField v-model="replyText" aria-label="답글 입력" placeholder="내용을 입력하세요" :height="64" />
            <div class="lp-comment-actions">
              <Button type="button" variant="tertiary2" size="sm" padding="16" @click="replyToId = null">취소</Button>
              <Button type="button" variant="primary" size="sm" padding="16" @click="onAddReply(comment.id)">저장</Button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :total-elements="roots.length"
      @update:page="(p: number) => (currentPage = p)"
      @update:items-per-page="onChangePageSize"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { CornerDownRight, MessageSquare, MoreHorizontal } from 'lucide-vue-next'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { Pagination } from '@/components/custom/pagination'
import type { NoticeComment } from '../composable/notice'

/**
 * 게시글 댓글 영역. 공지사항 상세(PM-COM-1002)에서 쓰고,
 * Q&A·우수사례 등 다른 게시판 상세도 같은 형태라 도메인 공용으로 둔다.
 */
const props = withDefaults(
  defineProps<{
    comments: NoticeComment[]
    /** 로그인 사용자 이름 (댓글 입력칸에 표시) */
    me?: string
  }>(),
  { me: '강길동' },
)

const emit = defineEmits<{
  (e: 'add', content: string, parentId: number | null): void
  (e: 'update', id: number, content: string): void
  (e: 'remove', id: number): void
}>()

const newComment = ref('')
const replyToId = ref<number | null>(null)
const replyText = ref('')
const editingId = ref<number | null>(null)
const editText = ref('')
/** 점 3개 메뉴가 열린 댓글 id — 수정/삭제 버튼이 그 아래 펼쳐진다 */
const openMenuId = ref<number | null>(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)

const allRoots = computed(() => props.comments.filter((c) => c.parentId === null))
const totalPages = computed(() => Math.max(1, Math.ceil(allRoots.value.length / itemsPerPage.value)))
const roots = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return allRoots.value.slice(start, start + itemsPerPage.value)
})

function repliesOf(id: number) {
  return props.comments.filter((c) => c.parentId === id)
}

const nowLabel = 'YYYY-MM-DD (HH:MM)'

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function toggleReply(id: number) {
  replyToId.value = replyToId.value === id ? null : id
  replyText.value = ''
}

function onAdd() {
  if (!newComment.value.trim()) {
    toast.warning('댓글 내용을 입력해 주세요.')
    return
  }
  emit('add', newComment.value.trim(), null)
  newComment.value = ''
}

function onAddReply(parentId: number) {
  if (!replyText.value.trim()) {
    toast.warning('답글 내용을 입력해 주세요.')
    return
  }
  emit('add', replyText.value.trim(), parentId)
  replyText.value = ''
  replyToId.value = null
}

function startEdit(comment: NoticeComment) {
  editingId.value = comment.id
  editText.value = comment.content
  openMenuId.value = null
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

function onSaveEdit(id: number) {
  if (!editText.value.trim()) {
    toast.warning('댓글 내용을 입력해 주세요.')
    return
  }
  emit('update', id, editText.value.trim())
  cancelEdit()
}

function onRemove(id: number) {
  emit('remove', id)
  cancelEdit()
  openMenuId.value = null
}

function onChangePageSize(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
}
</script>
