import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { Accordion, AccordionItem } from "@/components/ui/accordion"
export { default as AccordionTrigger } from "./AccordionTrigger.vue"
export { default as AccordionContent } from "./AccordionContent.vue"

// Figma: accordion / accordion__mo (Size=[large|medium], State=[open|close], Type=[line|default])
export const accordionTriggerVariants = cva(
  "group flex flex-1 items-center justify-between gap-4 text-left font-bold transition-colors data-[state=open]:text-[var(--Base-secondary)]",
  {
    variants: {
      type: {
        line: "border-b border-[var(--Border_gray02)]",
        default: "rounded-[var(--Radius-medium3)] px-[1.6rem] data-[state=open]:bg-[var(--Base-secondary-lighter)]",
      },
      size: {
        large: "h-[5.6rem] text-[1.9rem]",
        medium: "h-[4.8rem] text-[1.7rem]",
      },
    },
    defaultVariants: {
      type: "line",
      size: "large",
    },
  },
)

export const accordionContentVariants = cva(
  "text-[var(--Text-body_0)] leading-[1.5]",
  {
    variants: {
      type: {
        line: "py-[1.2rem]",
        default: "px-[1.6rem] py-[1.2rem]",
      },
      size: {
        large: "text-[1.7rem]",
        medium: "text-[1.5rem]",
      },
    },
    defaultVariants: {
      type: "line",
      size: "large",
    },
  },
)

export type AccordionTriggerVariants = VariantProps<typeof accordionTriggerVariants>
export type AccordionContentVariants = VariantProps<typeof accordionContentVariants>
