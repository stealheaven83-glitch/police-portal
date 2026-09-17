import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * 그 엘리먼트에 **지금 세로 스크롤이 생겼는지**를 담은 boolean Ref 를 돌려준다.
 *
 * ```ts
 * const bodyRef = ref<HTMLElement | null>(null)
 * const isScrollable = useIsScrollable(bodyRef)
 * ```
 * ```html
 * <div ref="bodyRef" class="lp-page-scroll" :data-scrollable="isScrollable">
 * ```
 * ```css
 * .lp-page-scroll[data-scrollable="true"] { width: calc(100% + 4rem); padding-right: 2.6rem; }
 * ```
 *
 * ## 왜 필요한가
 *
 * 스크롤바를 본문 바깥 여백으로 빼려면 그만큼 폭을 넓혀야 하는데, **스크롤이 없을 때도
 * 넓히면 내용이 그만큼 삐져나간다.** "스크롤이 생겼는가"를 묻는 CSS 선택자는 없으므로
 * 이것만 JS 가 재고, **실제 수치는 CSS 가 갖는다**(CLAUDE.md §2). 부르는 자리마다 값이
 * 다르기 때문이다(페이지 본문 · 패널 본문 · 팝업 본문).
 *
 * ## ⚠ computed 로는 못 만든다
 *
 * `scrollHeight`·`clientHeight` 는 DOM 을 재는 값이라 Vue 의 반응성 추적 대상이 아니다.
 * `computed(() => el.scrollHeight > el.clientHeight)` 는 의존성이 하나도 없어서 **처음 한 번
 * 계산되고 다시는 안 바뀐다.** 내용이 늘어도, 창을 줄여도 그대로다. 그래서 바뀌는 순간을
 * 감시자로 직접 잡아 ref 에 넣는다.
 *
 * 감시자가 둘인 이유 — 잡는 사건이 다르다:
 *   · ResizeObserver   컨테이너가 작아지는 경우(창·패널이 줄어 남는 높이가 준다)
 *   · MutationObserver 내용이 늘거나 주는 경우(조회 결과, 탭 전환 — 컨테이너는 그대로다)
 *
 * ## 쓰는 자리
 *
 * **스크롤하는 엘리먼트는 화면마다 다르다** — `ScrollWrapper` 일 때도 있고, `LayoutPanel` 의
 * 본문(`.layoutPanelBody`)일 때도 있고, 화면이 직접 만든 `.lp-page-scroll` 일 때도 있다.
 * 그래서 특정 컴포넌트에 넣지 않고 함수로 둔다 — 스크롤하는 그 엘리먼트에 붙이면 된다.
 *
 * 스크롤바 **모양**(색·모서리·여백)은 여기서 다루지 않는다. 그건 전 화면 공통이라
 * `police-override.css` 가 전역으로 갖는다. 여기서 정하는 건 **폭을 넓힐지 말지**뿐이다.
 */
export function useIsScrollable(target: Ref<HTMLElement | null>): Ref<boolean> {
  const isScrollable = ref(false)

  let resizeObserver: ResizeObserver | null = null
  let mutationObserver: MutationObserver | null = null
  let rafId = 0

  function measure() {
    const el = target.value
    if (!el) return
    // 소수점 반올림 오차로 1px 차이가 나는 경우가 있어 여유를 둔다
    isScrollable.value = el.scrollHeight - el.clientHeight > 1
  }

  /** 레이아웃이 확정된 뒤에 한 번만 재도록 프레임 단위로 묶는다 */
  function scheduleMeasure() {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      rafId = 0
      measure()
    })
  }

  function disconnect() {
    resizeObserver?.disconnect()
    resizeObserver = null
    mutationObserver?.disconnect()
    mutationObserver = null
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  function observe(el: HTMLElement | null) {
    disconnect()
    if (!el) {
      isScrollable.value = false
      return
    }
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(el)
    mutationObserver = new MutationObserver(scheduleMeasure)
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })
    scheduleMeasure()
  }

  // v-if 로 사라졌다 다시 생기는 경우가 있어 ref 를 지켜본다
  watch(target, (el) => observe(el), { immediate: true })
  onBeforeUnmount(disconnect)

  return isScrollable
}
