import type { Ref } from 'vue'
import type TabulatorGrid from '@/components/custom/tabulator/TabulatorGrid.vue'

/**
 * 팝업(GenericDialog2) 안에 넣은 TabulatorGrid 의 "오른쪽 빈칸" 방지.
 *
 * ui/dialog 의 DialogContent 는 열릴 때 `data-[state=open]:zoom-in-95` + `duration-200`
 * 으로 scale 애니메이션이 걸린다. Tabulator 의 fitColumns 는 컬럼 폭을
 * getBoundingClientRect() 로 재는데 이 값은 CSS transform 의 영향을 그대로 받아서,
 * scale(0.95) 인 동안 재면 실제보다 5% 좁게 잡힌다 — 애니메이션이 끝난 뒤에도
 * 그만큼 오른쪽에 빈 칸이 남는다.
 *
 * 애니메이션이 끝나는 시점(animationend)에 한 번 더 그려서 폭을 맞춘다.
 * 애니메이션이 없는 환경(prefers-reduced-motion 등) 대비로 타임아웃도 같이 걸어둔다.
 *
 * 사용:
 *   const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
 *   const { onTableBuilt } = useDialogGridRedraw(gridRef)
 *   <TabulatorGrid ref="gridRef" @table-built="onTableBuilt" />
 */
export function useDialogGridRedraw(gridRef: Ref<InstanceType<typeof TabulatorGrid> | null>) {
  function onTableBuilt() {
    let done = false
    const redraw = () => {
      if (done) return
      done = true
      gridRef.value?.redraw(true)
    }
    const dialogEl = (gridRef.value?.$el as HTMLElement | undefined)?.closest('[role="dialog"]')
    dialogEl?.addEventListener('animationend', redraw, { once: true })
    setTimeout(redraw, 250)
  }

  return { onTableBuilt }
}
