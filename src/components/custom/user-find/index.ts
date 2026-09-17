/**
 * 사용자 찾기 팝업 — 전 화면 공용.
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 12875:101668 (공통 > 사용자 찾기, PC-COM-0701)
 *
 * 형제와의 차이:
 * - `custom/address/AddressSearchDialog.vue` — 주소를 고른다. 이건 부서 트리에서 사람을 고른다.
 * - `custom/select/DepartmentCascadeSelect.vue` — 부서만 셀렉트로 고른다(팝업 아님).
 */
export { default as UserFindDialog } from './UserFindDialog.vue'
export type { UserFindDeptNode, UserFindUser } from './UserFindDialog.vue'
