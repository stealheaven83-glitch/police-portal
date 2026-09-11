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
        text: "gap-2 text-[var(--Text-body_0)] hover:bg-[var(--Surface-secondary)] active:bg-[#D6E0EB] disabled:text-[var(--Text-body_disable)]",

        // 2026-09-11 아이콘 전용 — 배경·테두리·hover 없이 자리만 차지한다(구 .lp-icon-btn).
        // size 를 생략하면 버튼이 아이콘 크기에 저절로 맞는다(아래 compoundVariants).
        // 크기의 주인은 <Icon :size> 다 — size 는 클릭 영역을 아이콘보다 키울 때만 준다.
        icon: "min-w-0 p-0 bg-transparent border-0 shadow-none hover:bg-transparent active:bg-transparent disabled:bg-transparent disabled:opacity-40",
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

        // 2026-09-11 아이콘 버튼의 클릭 영역(px). variant="icon" 과 함께 쓴다.
        // 버튼 박스만 잡고 내부 아이콘 크기는 건드리지 않는다 — 그건 <Icon :size> 가 정한다.
        // 둘이 같으면 적지 않는다(생략하면 아이콘 크기에 맞는다). 아이콘보다 클릭 영역을
        // 키울 때만 쓴다: <Button variant="icon" size="24"><Icon :size="20" /></Button>
        "20": "size-5",
        "24": "size-6",
        "32": "size-8",

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
        // 2026-09-11 variant="icon" 인데 size 를 안 주면 버튼이 아이콘 크기에 저절로 맞는다.
        // size 기본값("default")의 h-9·px-4 를 여기서 되돌린다(compound 가 가장 뒤에 병합된다).
        variant: "icon",
        size: "default",
        class: "size-auto p-0 has-[>svg]:p-0",
      },
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
