import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Checkbox } from "./Checkbox.vue"

export const checkboxVariants = cva(
  "peer shrink-0 self-start rounded-[4px] border border-[#58616A] shadow-xs transition-colors outline-none " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "disabled:cursor-not-allowed disabled:bg-[#CDD1D5] disabled:border-[#B1B8BE] disabled:text-[#8A949E] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-[#0054A6] data-[state=checked]:text-white data-[state=checked]:border-[#0054A6] " +
          "disabled:data-[state=checked]:bg-[#CDD1D5] disabled:data-[state=checked]:border-[#B1B8BE] disabled:data-[state=checked]:text-[#B1B8BE]",
          minus:
          "data-[state=checked]:bg-[#0054A6] data-[state=checked]:text-white data-[state=checked]:border-[#0054A6] " +
          "disabled:data-[state=checked]:bg-[#CDD1D5] disabled:data-[state=checked]:border-[#B1B8BE] disabled:data-[state=checked]:text-[#B1B8BE]",
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