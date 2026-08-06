import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as RadioGroup } from "./RadioGroup.vue"
export { default as RadioGroupItem } from "./RadioGroupItem.vue"

export const radioItemVariants = cva(
 "aspect-square rounded-full border border-[#58616A] text-[#0054a6] shadow-xs outline-none " +
 "dark:border-[#0069CB] dark:text-[#E6E8EA] " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "disabled:cursor-not-allowed disabled:bg-[#cdd1d5] disabled:border-[#b1b8be] disabled:text-[#8a949e] " +
  "disabled:data-[state=checked]:cursor-not-allowed disabled:data-[state=checked]:bg-[#cdd1d5] disabled:data-[state=checked]:border-[#b1b8be] disabled:data-[state=checked]:text-[#8a949e] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
      variant: {
        default: "data-[state=checked]:border-[#0054a6]"
      },
      size: {
        default: "size-5", // 20px
        lg: "size-6" // 24px
      },
    },
    defaultVariants: {
      // variant: "default",
      size: "default"
    }
  }
)

export type RadioItemVariants = VariantProps<typeof radioItemVariants>