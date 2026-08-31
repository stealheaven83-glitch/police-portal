import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Chip } from "./Chip.vue"
export { default as ChipGroup } from "./ChipGroup.vue"

/**
 * 칩(Chip): 라디오/체크박스를 버튼 모양으로 크게 만든 선택 컨트롤.
 * FilterChip과 다르다 — FilterChip은 목록 위에 얹는 둥근 필터 토글(개수 표시)이고,
 * Chip은 폼 안에서 값 하나를 고르는 입력 컨트롤(체크 시 파란 테두리+체크 아이콘)이다.
 * Tag와도 다르다 — Tag는 키워드 표시/삭제용이다.
 * Figma: chip__single(317:5069) / chip__multi(306:26726)
 * (Size=[large|medium|small], State=[unchecked|checked|disabled])
 * ⚠ Figma의 size 값 철자는 "samll"이지만 코드에서는 "small"로 바로잡았다.
 */
export const chipVariants = cva(
  "inline-flex items-center justify-center overflow-hidden border border-solid transition-colors",
  {
    variants: {
      size: {
        large: "h-14 gap-1 rounded-[var(--Radius-medium3)] px-4 text-[1.9rem]",
        medium: "h-12 gap-1 rounded-[var(--Radius-medium2)] px-3 text-[1.7rem]",
        small: "h-10 gap-2 rounded-[var(--Radius-medium1)] px-3 text-[1.5rem]",
      },
      state: {
        unchecked:
          "cursor-pointer bg-white border-[var(--Border_gray01)] text-[var(--Text-body_0)] hover:bg-[var(--Surface-primary)]",
        checked:
          "cursor-pointer bg-[var(--Surface-primary)] border-[var(--Base-primary)] text-[var(--Base-primary)]",
        disabled:
          "pointer-events-none bg-[var(--Border_gray02)] border-[var(--Border_gray01)] text-[var(--Text-body_2)]",
      },
    },
    defaultVariants: { size: "large", state: "unchecked" },
  },
)
export type ChipVariants = VariantProps<typeof chipVariants>

/** 체크 아이콘 크기 — 칩 크기에 따라 20/16/12px */
export const chipCheckIconSize = { large: 20, medium: 16, small: 12 } as const
