import { computed, reactive, ref } from 'vue'

/** 첨부파일 한 건 — 실제 업로드는 개발팀 몫이라 이름/상태만 들고 있는다 */
export interface MemoAttachment {
  id: number
  name: string
  /** 업로드 진행 중이면 스피너로 표시 */
  uploading: boolean
}

/** Figma: 첨부파일 최대 3개 (jpg, jpeg, png, pdf, mp4) */
export const MAX_ATTACHMENTS = 3
export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.pdf,.mp4'
/** Figma: 내용 글자수 카운터가 '80/100' 로 그려져 있다 */
export const CONTENT_MAX_LENGTH = 100

export interface MemoForm {
  title: string
  content: string
}

const mockContent =
  '입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다.'

const mockSummary =
  '요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다.'

export function useMemoWrite() {
  const form = reactive<MemoForm>({
    title: '입력한 제목이 표시됩니다.',
    content: mockContent,
  })

  /** 작성 시각 — 실제로는 저장 시점에 서버가 찍는다 */
  const writtenAt = ref('2026.07.01.  22:40')
  const important = ref(false)

  /** AI 요약: idle(비어 있음) / loading(요약 중) / done(요약 결과 있음) */
  const summaryState = ref<'idle' | 'loading' | 'done'>('done')
  const summaryProgress = ref(60)
  const summary = ref(mockSummary)

  const attachments = ref<MemoAttachment[]>([
    { id: 1, name: '전입신고서 [주민등록법 시행령 : 별지서식 15, 15호의2호] [hwp, 17KB]', uploading: false },
    { id: 2, name: '위임장(주민등록법 시행령 별지 제15호의2호서식) [hwp, 17KB]', uploading: false },
  ])

  const attachmentCount = computed(() => attachments.value.length)
  const canAddAttachment = computed(() => attachmentCount.value < MAX_ATTACHMENTS)

  function toggleImportant() {
    important.value = !important.value
  }

  function addAttachment(file: File) {
    if (!canAddAttachment.value) return
    attachments.value = [
      ...attachments.value,
      { id: Date.now(), name: `${file.name} [${Math.ceil(file.size / 1024)}KB]`, uploading: false },
    ]
  }

  function removeAttachment(id: number) {
    attachments.value = attachments.value.filter((f) => f.id !== id)
  }

  /** 다시 요약 — 실제 요약은 개발팀 몫이라 화면 상태만 loading → done 으로 돌린다 */
  function requestSummary() {
    summaryState.value = 'loading'
    summaryProgress.value = 60
    window.setTimeout(() => {
      summary.value = mockSummary
      summaryState.value = 'done'
    }, 800)
  }

  return {
    form,
    writtenAt,
    important,
    summary,
    summaryState,
    summaryProgress,
    attachments,
    attachmentCount,
    canAddAttachment,
    toggleImportant,
    addAttachment,
    removeAttachment,
    requestSummary,
  }
}
