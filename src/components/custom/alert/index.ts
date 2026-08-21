import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Alert } from "./Alert.vue"

// Figma: alert 컴포넌트 (State=[danger|warning|success|infromation], Size=[+title|slim])
export const alertVariants = cva(
  "flex items-start gap-2 rounded-[var(--Radius-medium3)] border",
  {
    variants: {
      state: {
        danger: "bg-[var(--Alert-danger-surface)] border-[var(--Alert-danger-border)]",
        warning: "bg-[var(--Alert-warning-surface)] border-[var(--Alert-warning-border)]",
        success: "bg-[var(--Alert-success-surface)] border-[var(--Alert-success-border)]",
        info: "bg-[var(--Alert-info-surface)] border-[var(--Alert-info-border)]",
      },
      size: {
        title: "p-4",
        slim: "items-center py-2 px-4",
      },
    },
    defaultVariants: {
      state: "info",
      size: "title",
    },
  },
)

export const alertIconVariants = cva(
  "shrink-0",
  {
    variants: {
      state: {
        danger: "text-[var(--Alert-danger-icon)]",
        warning: "text-[var(--Alert-warning-icon)]",
        success: "text-[var(--Alert-success-icon)]",
        info: "text-[var(--Alert-info-icon)]",
      },
      size: {
        title: "size-5",
        slim: "size-[1.8rem]",
      },
    },
    defaultVariants: {
      state: "info",
      size: "title",
    },
  },
)

export const alertTitleVariants = cva(
  "text-[1.7rem] font-bold leading-[1.5]",
  {
    variants: {
      state: {
        danger: "text-[var(--Alert-danger-text)]",
        warning: "text-[var(--Alert-warning-text)]",
        success: "text-[var(--Alert-success-text)]",
        info: "text-[var(--Alert-info-text)]",
      },
    },
    defaultVariants: {
      state: "info",
    },
  },
)

export type AlertVariants = VariantProps<typeof alertVariants>
