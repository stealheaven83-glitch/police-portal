import { ref } from 'vue'

export interface MemoDetailAttachment {
  id: number
  name: string
}

export interface MemoDetail {
  id: number
  /** 보낸 사람 (내 메모는 비어 있음) */
  sender: string
  /** 받은 일시 / 작성 일시 */
  receivedAt: string
  title: string
  content: string
  summary: string
  important: boolean
  attachments: MemoDetailAttachment[]
}

const mockContent = [
  '입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다.',
  '입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다.',
  '입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다. 입력한 내용이 표시됩니다.',
  '입력한 내용이 표시됩니다.',
].join('\n')

export function useMemoDetail() {
  /** 목록(PM-LPO-0101)에서 id 를 넘겨받지만, 목업이라 한 건을 그대로 보여준다 */
  const memo = ref<MemoDetail>({
    id: 1,
    sender: '홍길동',
    receivedAt: '2026.07.01.  22:40',
    title: '2월 6일 밤 22시 38분 순찰 중 유흥거리 00주점에서 신고전화',
    content: mockContent,
    summary:
      '요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다.',
    important: false,
    attachments: [
      { id: 1, name: '전입신고서 [주민등록법 시행령 : 별지서식 15, 15호의2호] [hwp, 17KB]' },
      { id: 2, name: '위임장(주민등록법 시행령 별지 제15호의2호서식) [hwp, 17KB]' },
    ],
  })

  function toggleImportant() {
    memo.value = { ...memo.value, important: !memo.value.important }
  }

  return { memo, toggleImportant }
}
