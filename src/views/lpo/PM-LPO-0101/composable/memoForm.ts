import { computed, reactive, ref } from 'vue'
import type { MemoFormPayload, MemoItem } from './PM-LPO-0101'

/** 첨부파일 1건 (퍼블: 실제 업로드는 개발팀) */
export interface MemoAttachment {
  id: number
  name: string
  /** 업로드 진행 중이면 true — 파일 박스 오른쪽에 스피너 */
  uploading: boolean
}

/** 요약 영역 상태 — Figma 3개 프레임(빈 / 진행 / 완료)에 대응 */
export type SummaryState = 'idle' | 'loading' | 'done'

export const MAX_CONTENT = 100
export const MAX_FILES = 3

interface MemoFormFields {
  title: string
  content: string
}

/**
 * 메모 등록(PM-LPO-0104) · 상세/수정(PM-LPO-0102) 이 공유하는 폼 상태.
 * 기획서상 두 화면의 항목별 입력 방법이 동일해서 컴포저블 하나로 둔다.
 * `memo` 가 있으면 그 내용으로 채우고(상세/수정), 없으면 빈 폼(등록)이다.
 */
export function useMemoForm(memo?: MemoItem | null) {
  /** 상단에 표시하는 일시 — 상세는 메모의 저장 시각, 등록은 지금 시각 */
  const createdAt = ref(memo ? `${memo.date}  ${memo.time}` : nowLabel())

  const form = reactive<MemoFormFields>({
    title: memo?.title ?? '',
    content: memo?.content ?? '',
  })

  const important = ref(memo?.important ?? false)

  // ── 요약 ────────────────────────────────────────────────
  const summaryState = ref<SummaryState>(memo?.summary ? 'done' : 'idle')
  const summaryText = ref(memo?.summary ?? '')
  const summaryProgress = ref(0)

  /**
   * 요약 가능 = 내용이 비어있지 않음.
   * 기획서는 "내용 100자 이하면 비활성"이라 하지만 내용 maxlength 도 100이라 충돌 —
   * 내용 최대 길이 확정 후 조건 재검토 필요.
   */
  const canSummarize = computed(() => form.content.trim().length > 0)

  let progressTimer: ReturnType<typeof setInterval> | null = null

  /** 퍼블 목업: 실제 AI 요약은 개발팀. 진행률만 흉내내고 고정 문구를 채운다 */
  function runSummary() {
    if (!canSummarize.value) return
    summaryState.value = 'loading'
    summaryProgress.value = 0
    progressTimer && clearInterval(progressTimer)
    progressTimer = setInterval(() => {
      summaryProgress.value = Math.min(100, summaryProgress.value + 20)
      if (summaryProgress.value >= 100) {
        progressTimer && clearInterval(progressTimer)
        progressTimer = null
        summaryText.value =
          '요약한 내용이 표시됩니다. 글자수는 100자로 표시됩니다.'
        summaryState.value = 'done'
      }
    }, 400)
  }

  // ── 첨부파일 ─────────────────────────────────────────────
  let fileSeq = 0
  const attachments = ref<MemoAttachment[]>(
    (memo?.files ?? []).map((name) => ({ id: ++fileSeq, name, uploading: false })),
  )
  const canAddFile = computed(() => attachments.value.length < MAX_FILES)

  /** 퍼블 목업: 파일 선택/드롭 시 목록에 한 줄 추가하고 잠시 뒤 업로드 완료 처리 */
  function addFiles(names: string[]) {
    for (const name of names) {
      if (!canAddFile.value) break
      const id = ++fileSeq
      attachments.value = [...attachments.value, { id, name, uploading: true }]
      setTimeout(() => {
        attachments.value = attachments.value.map((f) =>
          f.id === id ? { ...f, uploading: false } : f,
        )
      }, 1200)
    }
  }

  function removeFile(id: number) {
    attachments.value = attachments.value.filter((f) => f.id !== id)
  }

  // ── 유효성 ──────────────────────────────────────────────
  /** 기획서 5: 공백 포함 입력이 하나라도 있으면 "입력된 내용이 있음" */
  const hasInput = computed(
    () => form.title.length > 0 || form.content.length > 0 || attachments.value.length > 0,
  )

  /** 저장 시 상위(화면군)로 올려보내는 값 */
  function toPayload(): MemoFormPayload {
    return {
      title: form.title,
      content: form.content,
      summary: summaryState.value === 'done' ? summaryText.value : '',
      files: attachments.value.map((f) => f.name),
      important: important.value,
    }
  }

  return {
    createdAt,
    form,
    important,

    summaryState,
    summaryText,
    summaryProgress,
    canSummarize,
    runSummary,

    attachments,
    canAddFile,
    addFiles,
    removeFile,

    hasInput,
    toPayload,
  }
}

function nowLabel() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.  ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
