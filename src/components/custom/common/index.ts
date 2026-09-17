/**
 * 화면 여러 곳에서 같은 마크업으로 반복되던 "폼 조각" 을 모아 두는 폴더.
 * (alert·badge 같은 원자 컴포넌트가 아니라, 라벨 + 입력 + 목록이 한 덩어리인 것들)
 */

export { default as AttachmentField } from './AttachmentField.vue'

/**
 * AttachmentField 가 그리는 첨부파일 한 건.
 * 화면 composable 의 NoticeFile / BoardFile(id · name · uploading)과 같은 모양이라 그대로 넘기면 된다.
 */
export interface AttachedFile {
  id: number
  /** 목록에 찍히는 이름 — 화면 쪽에서 용량 등을 붙여 넘긴다(예: "사진.jpg [120KB]") */
  name: string
  /** 업로드 진행 중이면 FileUpload 가 스피너를 보여준다 */
  uploading?: boolean
}
