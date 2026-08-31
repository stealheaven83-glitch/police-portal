import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as ProgressBar } from "./ProgressBar.vue"

/**
 * 진행 바(progress_bar): 작업 진척도를 가로 막대로 보여준다.
 * Figma: progress_bar (Size=[large|medium], State=[active|success|error], Alert=메시지 노출)
 * - active  : value 비율만큼 파란 막대. success/error는 항상 100%로 채운다
 * - 메시지  : active=회색(아이콘 없음), success=초록+아이콘, error=빨강+아이콘
 */
export const progressTrackVariants = cva(
  "w-full bg-[var(--Border_gray02)]",
  {
    variants: {
      size: {
        large: "h-2 rounded-[4px]",
        medium: "h-1 rounded-[2px]",
      },
    },
    defaultVariants: { size: "large" },
  },
)

export const progressBarVariants = cva(
  "transition-[width] duration-300 ease-out",
  {
    variants: {
      size: {
        large: "h-2 rounded-[4px]",
        medium: "h-1 rounded-[2px]",
      },
      state: {
        active: "bg-[var(--Base-primary)]",
        success: "bg-[var(--success)]",
        error: "bg-[var(--danger)]",
      },
    },
    defaultVariants: { size: "large", state: "active" },
  },
)
export type ProgressBarVariants = VariantProps<typeof progressBarVariants>

export const progressMessageVariants = cva(
  "flex-1 min-w-0 text-[1.3rem] leading-[1.5]",
  {
    variants: {
      state: {
        active: "text-[var(--Text-body_1)]",
        success: "text-[var(--Alert-success-text)]",
        error: "text-[var(--Alert-danger-text)]",
      },
    },
    defaultVariants: { state: "active" },
  },
)
