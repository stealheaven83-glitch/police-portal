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
      <div class="lp-comment-actions" style="margin-left:auto">
        <Button type="button" variant="secondary" size="xs" padding="16" @click="onAdd()">등록</Button>
      </div>
    </div>

    <!-- 댓글 목록 -->
    <ul class="lp-comment-list">
      <li v-for="comment in roots" :key="comment.id" class="lp-comment-item">
        <article class="lp-comment">
          <p class="lp-comment-head">
            <b class="lp-comment-writer">{{ comment.writer }}</b>
            <span class="lp-comment-date">{{ comment.createdAt }}</span>
            <Popover :open="openMenuId === comment.id" @update:open="setMenuOpen(comment.id, $event)">
              <PopoverTrigger as-child>
                <button type="button" class="lp-comment-more" :disabled="anyEditing" :aria-label="`${comment.writer} 댓글 메뉴`">
                  <Icon name="ellipsisVertical" :size="24" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" :side-offset="4" class="lp-comment-menu">
                <button type="button" class="lp-comment-menu-item" @click="startEdit(comment)">
                  <Icon name="edit" :size="16" aria-hidden="true" /> 수정
                </button>
                <button v-if="!repliesOf(comment.id).length" type="button" class="lp-comment-menu-item" @click="onRemove(comment.id)">
                  <Icon name="trash" :size="16" aria-hidden="true" /> 삭제
                </button>
                <button type="button" class="lp-comment-menu-item" @click="toggleReply(comment.id); openMenuId = null">
                  <Icon name="inquiry" :size="16" aria-hidden="true" /> 답변
                </button>
              </PopoverContent>
            </Popover>
          </p>

          <template v-if="editingId === comment.id">
            <TextareaField v-model="editText" aria-label="댓글 수정" :height="64" />
            <div class="lp-comment-actions is-edit">
              <Button type="button" variant="tertiary2" size="xs" padding="16" @click="onCancelEditClick">취소</Button>
              <span class="lp-comment-actions-group">
                <Button v-if="!repliesOf(comment.id).length" type="button" variant="tertiary2" size="xs" padding="16" @click="onRemove(comment.id)">삭제</Button>
                <span v-else class="lp-comment-edit-note">* 답변이 작성된 댓글은 삭제할 수 없습니다.</span>
                <Button type="button" variant="secondary" size="xs" padding="16" @click="onSaveEdit(comment.id)">등록</Button>
              </span>
            </div>
          </template>
          <template v-else>
            <p class="lp-comment-body">
              <span v-if="comment.mention" class="lp-comment-mention">@{{ comment.mention }}</span>
              {{ comment.content }}
            </p>
            <button type="button" class="lp-comment-reply-btn" @click="toggleReply(comment.id)">
              <Icon name="inquiry" :size="19" />
              {{ repliesOf(comment.id).length }}
            </button>
          </template>
        </article>

        <!-- 대댓글 -->
        <ul v-if="repliesOf(comment.id).length" class="lp-comment-replies">
          <li v-for="reply in repliesOf(comment.id)" :key="reply.id" class="lp-comment-reply-row">
            <article class="lp-comment">
              <p class="lp-comment-head">
                <b class="lp-comment-writer">{{ reply.writer }}</b>
                <span class="lp-comment-date">{{ reply.createdAt }}</span>
                <Popover :open="openMenuId === reply.id" @update:open="setMenuOpen(reply.id, $event)">
                  <PopoverTrigger as-child>
                    <button type="button" class="lp-comment-more" :disabled="anyEditing" :aria-label="`${reply.writer} 답글 메뉴`">
                      <Icon name="ellipsisVertical" :size="24" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" :side-offset="4" class="lp-comment-menu">
                    <button type="button" class="lp-comment-menu-item" @click="startEdit(reply)">
                      <Icon name="edit" :size="16" aria-hidden="true" /> 수정
                    </button>
                    <button type="button" class="lp-comment-menu-item" @click="onRemove(reply.id)">
                      <Icon name="trash" :size="16" aria-hidden="true" /> 삭제
                    </button>
                    <button type="button" class="lp-comment-menu-item" @click="startReplyTo(comment.id, reply.writer)">
                      <Icon name="inquiry" :size="16" aria-hidden="true" /> 답변
                    </button>
                  </PopoverContent>
                </Popover>
              </p>

              <template v-if="editingId === reply.id">
                <TextareaField v-model="editText" aria-label="답글 수정" :height="64" />
                <div class="lp-comment-actions is-edit">
                  <Button type="button" variant="tertiary2" size="xs" padding="16" @click="onCancelEditClick">취소</Button>
                  <Button type="button" variant="secondary" size="xs" padding="16" @click="onSaveEdit(reply.id)">저장</Button>
                </div>
              </template>
              <template v-else>
                <p class="lp-comment-body">
                  <span v-if="reply.mention" class="lp-comment-mention">@{{ reply.mention }}</span>
                  {{ reply.content }}
                </p>
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
            <div v-if="replyMention" class="lp-comment-mention-field">
              <span class="lp-comment-mention-person">@{{ replyMention }}</span>
              <Textarea v-model="replyText" class="lp-comment-mention-input" :aria-label="`${replyMention} 님에게 답글 입력`" placeholder="내용을 입력하세요" />
            </div>
            <TextareaField v-else v-model="replyText" aria-label="답글 입력" placeholder="내용을 입력하세요" :height="64" />
            <div class="lp-comment-actions">
              <Button type="button" variant="tertiary2" size="xs" padding="16" @click="cancelReply">취소</Button>
              <Button type="button" variant="secondary" size="xs" padding="16" @click="onAddReply(comment.id)">저장</Button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :total-elements="totalElements"
      @update:page="(p: number) => (currentPage = p)"
      @update:items-per-page="onChangePageSize"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/components/custom/icon/Icon.vue'
import Textarea from '@/components/custom/textarea/Textarea.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import { Pagination } from '@/components/custom/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { NoticeComment } from '../composable/notice'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

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
  /** mention: 답글이 지목한 사람 이름(@ 없이). 답글 메뉴의 "답변"으로 열었을 때만 있다 */
  (e: 'add', content: string, parentId: number | null, mention?: string): void
  (e: 'update', id: number, content: string): void
  (e: 'remove', id: number): void
}>()

const newComment = ref('')
const replyToId = ref<number | null>(null)
const replyText = ref('')
/** 답글 입력칸 앞에 칩으로 붙는 멘션 대상 — 답글 메뉴의 "답변"으로 열었을 때 그 답글 작성자 */
const replyMention = ref<string | null>(null)
const editingId = ref<number | null>(null)
const editText = ref('')
/** 점 3개 메뉴가 열린 댓글 id — 수정/삭제 버튼이 그 아래 펼쳐진다 */
const openMenuId = ref<number | null>(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)

const allRoots = computed(() => props.comments.filter((c) => c.parentId === null))

function repliesOf(id: number) {
  return props.comments.filter((c) => c.parentId === id)
}

/**
 * 페이지네이션 기준 개수는 답글까지 포함한다(화면 요구사항 9번). 한 스레드(원댓글+답글)는
 * 페이지 경계에서 쪼개지 않는다 — 답글이 부모와 다른 페이지에 떨어지면 문맥을 잃는다.
 * 그래서 목록당 건수만큼 원댓글을 단순히 자르지 않고, 누적 개수가 목록당 건수를 넘기 전까지
 * 원댓글(+그 답글)을 그러모아 한 페이지로 묶는다.
 */
const pages = computed(() => {
  const result: NoticeComment[][] = []
  let current: NoticeComment[] = []
  let currentCount = 0
  for (const root of allRoots.value) {
    const threadCount = 1 + repliesOf(root.id).length
    if (current.length && currentCount + threadCount > itemsPerPage.value) {
      result.push(current)
      current = []
      currentCount = 0
    }
    current.push(root)
    currentCount += threadCount
  }
  if (current.length) result.push(current)
  return result.length ? result : [[]]
})

const totalPages = computed(() => pages.value.length)
const roots = computed(() => pages.value[currentPage.value - 1] ?? [])
/** 총 건수 표시도 답글을 포함한다 */
const totalElements = computed(() => props.comments.length)

const nowLabel = 'YYYY-MM-DD (HH:MM)'

/** 어느 댓글이든 수정 중이면 다른 댓글의 수정/삭제/답변 메뉴를 잠근다 — 동시 편집 방지 */
const anyEditing = computed(() => editingId.value !== null)

function setMenuOpen(id: number, isOpen: boolean) {
  openMenuId.value = isOpen ? id : null
}

function toggleReply(id: number) {
  replyToId.value = replyToId.value === id ? null : id
  replyText.value = ''
  replyMention.value = null
}

/** 답글의 "답변" — 같은 원댓글 아래에 답글 폼을 열고, 그 답글 작성자를 멘션 칩으로 붙인다 */
function startReplyTo(parentId: number, writer: string) {
  replyToId.value = parentId
  replyText.value = ''
  replyMention.value = writer
  openMenuId.value = null
}

/** 사용자 지정: 저장 컨펌창 — CLAUDE.md §4 기본(alert만)과 다르지만 요청(화면 정의서 ②)대로 따름 */
async function onAdd() {
  if (!newComment.value.trim()) {
    await dialog.alert({ title: '입력된 내용이 없습니다. 내용을 입력해 주시기 바랍니다.', btnCancel: '확인' })
    return
  }
  const { confirmed } = await dialog.confirm({
    title: '댓글을 등록하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return

  emit('add', newComment.value.trim(), null)
  newComment.value = ''
  // 새 댓글은 목록 최상단에 붙으므로, 다른 페이지를 보고 있었다면 1페이지로 되돌려 보이게 한다
  currentPage.value = 1
}

async function onAddReply(parentId: number) {
  if (!replyText.value.trim()) {
    await dialog.alert({ title: '입력된 내용이 없습니다. 내용을 입력해 주시기 바랍니다.', btnCancel: '확인' })
    return
  }
  emit('add', replyText.value.trim(), parentId, replyMention.value ?? undefined)
  cancelReply()
}

function cancelReply() {
  replyToId.value = null
  replyText.value = ''
  replyMention.value = null
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

/** 수정 화면의 "취소" 클릭 — 사용자 지정: 컨펌창(화면 정의서 1-2/3-2) */
async function onCancelEditClick() {
  const { confirmed } = await dialog.confirm({
    title: '수정된 내용이 있습니다. 취소하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  cancelEdit()
}

/** 사용자 지정: 저장 컨펌창(화면 정의서 1-4/3-4) — CLAUDE.md §4 기본과 다르지만 요청대로 따름 */
async function onSaveEdit(id: number) {
  if (!editText.value.trim()) {
    await dialog.alert({ title: '댓글 내용을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  const { confirmed } = await dialog.confirm({
    title: '수정된 내용을 저장하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  emit('update', id, editText.value.trim())
  cancelEdit()
}

/**
 * 사용자 지정: 삭제 컨펌창(화면 정의서 1-3) — CLAUDE.md §4 기본(alert만)과 다르지만 요청대로 따름.
 * 답변이 달린 원댓글은 이 함수에 닿기 전에 UI(팝오버·수정 화면)에서 삭제 버튼 자체를 가린다.
 */
async function onRemove(id: number) {
  const { confirmed } = await dialog.confirm({
    title: '삭제된 댓글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  emit('remove', id)
  cancelEdit()
  openMenuId.value = null
}

function onChangePageSize(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
}
</script>
