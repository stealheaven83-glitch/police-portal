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

/**
 * 레이어 팝업(`GenericDialog2`)이 모바일에서 **어떤 모양**이 되나.
 *
 *   'full'    전체화면 팝업 — 상단바(제목+X) + 본문 꽉 참 (Figma MO 14958:133267)
 *   'bottom'  바텀시트 **모양** — 아래에 붙고 위 모서리가 둥글다
 *
 * 안 주면 언제나 가운데 팝업이다(지금까지와 같다).
 *
 * ⚠ 'bottom' 은 **모양만**이다. 드래그로 내려 닫기·스냅은 없다 — 그건 `vaul-vue`
 * Drawer 를 쓰는 `custom/bottom-sheet/BottomSheet.vue` 의 몫이고, 기반 라이브러리가
 * 달라서 이 컴포넌트(reka-ui Dialog)로는 못 한다. 드래그가 필요하면 그쪽을 쓴다.
 */
export type DialogShape = 'full' | 'bottom'

/**
 * 모양 + 적용 범위를 클래스 두 개로 바꾼다. 실제 값은 `police-override.css` 의
 * `.lp-popup-*` 가 들고 있다 — Alert/Confirm 의 `.lp-dialog-*` 와는 **다른 네임스페이스**다
 * (그쪽은 폭 40rem 같은 자기 토큰을 물고 있어 같이 쓰면 딸려온다).
 *
 *   device 'mobile'     → 폭과 무관하게 **항상** 그 모양   (.lp-popup-always)
 *   device 'responsive' → 모바일 폭(<1000px)에서만        (.lp-popup-mo)
 *   device 'pc'         → 언제나 가운데 팝업 (클래스 없음)
 *
 * `shape` 가 없으면 빈 배열이라 아무 규칙도 안 걸린다.
 */
export function dialogShapeClass(shape?: DialogShape, device?: DialogDevice): string[] {
  if (!shape || device === 'pc') return []
  const scope = device === 'mobile' ? 'lp-popup-always' : 'lp-popup-mo'
  return [scope, `lp-popup-${shape}`]
}
