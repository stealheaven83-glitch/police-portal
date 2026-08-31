import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"
export { default as HelpButton } from "./HelpButton.vue"
export { default as ButtonGroup } from "./ButtonGroup.vue"
export type { ButtonCaseItem } from "./ButtonGroup.vue"


export const buttonVariants = cva(
  "inline-flex items-center justify-center min-w-25 gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:bg-[var(--Border_gray0)] disabled:border-none disabled:pointer-events-none disabled:text-[var(--Text-body_2)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // secondary:
        //   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",


        //컴포넌트 커스텀
        primary: "bg-[var(--Button-primary-fill)] text-white hover:bg-[var(--Button-primary-fill-hover)] active:bg-[var(--Button-primary-fill-pressed)]",
        secondary: "bg-[var(--Button-secondary-fill)] text-white hover:bg-[var(--Button-secondary-fill-hover)] active:bg-[var(--Button-secondary-fill-pressed)]",
        tertiary: "border border-[var(--Button-tertiary-pm-border)] text-[var(--Base-primary)] bg-[var(--Button-tertiary-pm-fill)] hover:bg-[var(--Button-tertiary-pm-fill-hover)] active:bg-[var(--Button-tertiary-pm-fill-pressed)]",
        tertiary2: "border border-[var(--Button-tertiary-bk-border)] text-[var(--Text-body_0)] bg-[var(--Button-tertiary-bk-fill)] hover:bg-[var(--Button-tertiary-bk-fill-hover)] active:bg-[var(--Button-tertiary-bk-fill-pressed)]",
        text: "gap-2 text-[var(--Text-body_0)] hover:bg-[var(--Surface-secondary)] active:bg-[#D6E0EB] disabled:text-[var(--Text-body_disable)]"
      },
      size: {
        "default": "h-9 px-4 py-2 has-[>svg]:px-3",
        // "xs": "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        // "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // "lg": "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon": "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",

        // Figma size-height/radius 스케일: lg=8px, md/sm=6px, xs/xxs=4px
        lg: `h-14 px-5 text-[1.9rem] rounded-[var(--Radius-medium3)]`,
        md: `h-12 px-4 text-[1.7rem] rounded-[var(--Radius-medium2)]`,
        sm: `h-10 px-4 text-[1.5rem] rounded-[var(--Radius-medium1)]`,
        xs: `h-8 px-3 text-[1.5rem] rounded-[var(--Radius-small3)]`,
        xxs: `h-6 px-2 text-[1.5rem] rounded-[var(--Radius-small3)]`,
      },
    },
    compoundVariants: [
      {
        // size 클래스(px-*)보다 뒤에 병합되어야 twMerge가 이걸 우선시함
        variant: "text",
        class: "px-0.5",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
