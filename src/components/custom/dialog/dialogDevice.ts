/**
 * 알림창(AlertDialog2)·확인창(ConfirmDialog2)을 **어느 화면 기준으로 그리나**.
 *
 *   'pc'         PC 모양 고정 — 폭 400, 제목 2.4rem, 버튼은 내용 폭
 *   'mobile'     모바일 모달 고정 — 폭 320, 제목 1.9rem, 버튼이 폭을 나눠 가진다
 *                (Figma MO 모달 13323:98207)
 *   'responsive' 기본값. 1000px 경계로 자동 — useResponsive.ts 의 BP_MOBILE 과 같은 값이다
 *
 * 실제 값은 `police-override.css` 의 `.lp-dialog-*` 가 CSS 변수로 들고 있다.
 * 미디어쿼리라 JS 폭 감시가 없고, 그래서 첫 프레임 깜빡임도 없다
 * (useResponsive.ts 의 ⚠ 주석 참고).
 */
export type DialogDevice = 'pc' | 'mobile' | 'responsive'

/** 바깥틀에 붙일 클래스. 값이 없거나 이상하면 'responsive' 로 떨어진다 */
export function dialogDeviceClass(device?: DialogDevice): string {
  const name: DialogDevice =
    device === 'pc' || device === 'mobile' || device === 'responsive' ? device : 'responsive'
  return `lp-dialog-${name}`
}
