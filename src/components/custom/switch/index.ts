import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Switch } from "./Switch.vue"

export const switchVariants = cva(
  "group peer inline-flex shrink-0 items-center rounded-full border-transparent transition-all outline-none " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed " +
  "data-[state=checked]:bg-[#0054A6] data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 " +
  "disabled:data-[state=checked]:bg-[#CDD1D5] disabled:data-[state=unchecked]:bg-[#CDD1D5]",
  {
    variants: {
      variant: {
        default: "",
        none: "", // 아이콘 없음
      },
      size: {
        default: "w-[32px] h-[20px] border-3",
        lg: "w-[40px] h-[24px] border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// 동그라미
export const switchThumbVariants = cva(
  "group pointer-events-none flex items-center justify-center rounded-full bg-[#fff] shadow-xs transition-transform duration-300 data-[state=unchecked]:translate-x-0 data-[disabled]:bg-[#8A949E]",
  {
    variants: {
      size: {
        default: "size-4 data-[state=checked]:translate-x-[10px]",
        lg: "size-5 data-[state=checked]:translate-x-[12px]",
      },
    },
    defaultVariants: {
      size: "default"
    }
  }
)

// 동그라미 안 아이콘
export const switchIconVariants = cva(
  "shrink-0 text-[#B1B8BE] transition-all duration-300 stroke-[3] group-data-[disabled]:text-[#CDD1D5]",
  {
    variants: {
      size: {
        default: "size-2.5",
        lg: "size-3"
      },
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export type SwitchVariants = VariantProps<typeof switchVariants>