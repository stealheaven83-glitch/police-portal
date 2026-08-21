import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as FileUpload } from "./FileUpload.vue"

// Figma: file_upload__atomic__pc / __mo (State=[ongoing|progress_completed|upload|error|download])
export const fileUploadVariants = cva(
  "flex items-center gap-2 w-full h-[4.8rem] px-[1.6rem] rounded-[var(--Radius-medium3)] border bg-white text-left transition-colors " +
  "outline-none focus-visible:border-[var(--Border_primary)] focus-visible:border-2",
  {
    variants: {
      error: {
        true: "border-[var(--Alert-danger-border)] bg-[var(--Alert-danger-surface)]",
        false: "border-[var(--Border_gray02)]",
      },
      disabled: {
        true: "bg-[var(--disabled-input-bg)] border-[var(--disabled-input-border)] pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
      disabled: false,
    },
  },
)

export type FileUploadVariants = VariantProps<typeof fileUploadVariants>
