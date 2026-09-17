/**
 * 화면 여러 곳에서 같은 마크업으로 반복되던 "폼 조각" 과 전 화면 공용 팝업을 모아 두는 폴더.
 * (alert·badge 같은 원자 컴포넌트가 아니라, 라벨 + 입력 + 목록이 한 덩어리인 것들과
 *  어느 화면에서든 같은 모양으로 뜨는 공통 팝업)
 */

/* ── 첨부파일 필드 ─────────────────────────────────────────────── */
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

/* ── 사용자 찾기 팝업 ──────────────────────────────────────────── */
/**
 * 사용자 찾기 팝업 — 전 화면 공용. (2026-09-17 custom/user-find 에서 여기로 이동)
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 12875:101668 (공통 > 사용자 찾기, PC-COM-0701)
 *
 * 형제와의 차이:
 * - `custom/address/AddressSearchDialog.vue` — 주소를 고른다. 이건 부서 트리에서 사람을 고른다.
 * - `custom/select/DepartmentCascadeSelect.vue` — 부서만 셀렉트로 고른다(팝업 아님).
 */
export { default as UserFindDialog } from './UserFindDialog.vue'
export type { UserFindDeptNode, UserFindUser } from './UserFindDialog.vue'
