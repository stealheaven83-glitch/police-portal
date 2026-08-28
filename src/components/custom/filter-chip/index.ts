import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as FilterChip } from "./FilterChip.vue"
export { default as FilterChipGroup } from "./FilterChipGroup.vue"
export type { FilterChipItem } from "./FilterChipGroup.vue"

/**
 * 필터 칩(Filter Chip): 버튼도 탭도 아닌, "항목 + 개수를 보여주고 선택하면 목록을 그
 * 값으로 필터링"하는 pill 모양 토글. 테두리/배경만 상태에 따라 바뀌고 텍스트·아이콘
 * 색상은 각 부분(라벨/개수/체크)마다 달라서 컴포넌트 안에서 개별 처리한다 — 이 cva는
 * 칩의 테두리/배경만 담당한다.
 */
export const filterChipVariants = cva(
  "inline-flex items-center gap-2 h-10 shrink-0 rounded-full border bg-white px-5 transition-colors",
  {
    variants: {
      active: {
        true: "border-[var(--Base-primary)] bg-[var(--Surface-primary)]",
        false: "border-[#B1B8BE]",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)
export type FilterChipVariants = VariantProps<typeof filterChipVariants>
