import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Checkbox } from "./Checkbox.vue"

export const checkboxVariants = cva(
  "shrink-0 self-start rounded-[4px] border border-[#58616A] shadow-xs transition-colors outline-none " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "disabled:cursor-not-allowed disabled:bg-[#cdd1d5] disabled:border-[#b1b8be] disabled:text-[#8a949e] " +
  "disabled:data-[state=checked]:bg-[#cdd1d5] disabled:data-[state=checked]:border-[#b1b8be] disabled:data-[state=checked]:text-[#8a949e] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-[#0054a6] data-[state=checked]:text-white data-[state=checked]:border-[#0054a6]",
          minus:
          "data-[state=checked]:bg-[#0054a6] data-[state=checked]:text-white data-[state=checked]:border-[#0054a6]",
      },
      size: {
        default: "size-5", // 20px
        lg: "size-6", // 24px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type CheckboxVariants = VariantProps<typeof checkboxVariants>