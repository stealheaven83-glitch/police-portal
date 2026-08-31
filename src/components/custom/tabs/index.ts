import { cva, type VariantProps } from "class-variance-authority"

export { default as Tabs } from "./Tabs.vue"
export { default as TabsContent } from "./TabsContent.vue"
export { default as TabsList } from "./TabsList.vue"
export { default as TabsTrigger } from "./TabsTrigger.vue"

export const tabsListVariants = cva(
  "flex items-center justify-start transition-all",
  {
    variants: {
      variant: {
        fill: "gap-2",
        line: "border-[var(--Border_gray01)] border-b",
      },
      scrollable: {
        false: "w-full",
        true: "w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap scrollTest"
      },
    },
    defaultVariants: {
      variant: "fill",
      scrollable: false
    }
  }
)

export const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center p-2 whitespace-nowrap text-[15px] text-[var(--Text-body_1)] font-bold transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 shrink-0",
  {
    variants: {
      // Figma: tab > Style
      variant: {
        fill: "border border-[var(--Border_gray02)] rounded-[6px] text-[var(--Text-body_1)] hover:bg-[var(--Surface-secondary)] " +
        "data-[state=active]:bg-[var(--Base-secondary)] data-[state=active]:text-white data-[state=active]:border-[var(--Base-secondary)] data-[state=active]:shadow-xs",
        line: "rounded-none border-b-2 border-transparent text-[var(--Text-body_1)] hover:text-slate-900 " +
        "data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)] ",
      },
      /**
       * Figma: tab > Type (primary | secondary) — 코드에서는 tone — 활성 탭의 파랑 계열을 바꾼다.
       * 기본값 `inherit`는 아무것도 덮어쓰지 않아 기존 화면의 렌더 결과가 그대로 유지된다
       * (fill=secondary 남색, line=primary 파랑이 원래 동작). 새로 만드는 화면에서만
       * tone="primary" / tone="secondary"로 명시해 쓴다.
       */
      tone: {
        inherit: "",
        primary: "",
        secondary: "",
      },
      grow: {
        true: "flex-1 w-0 min-w-0",
        false: "flex-none w-auto",
      },
      size: { // Figma: tab > Size (Default | Large | Medium)
        default: "h-[44px]",
        sm: "h-[36px] px-3 text-sm",
        lg: "h-[50px] px-5 text-base",
      }
    },
    compoundVariants: [
      {
        variant: "fill",
        tone: "primary",
        class: "data-[state=active]:bg-[var(--Base-primary)] data-[state=active]:border-[var(--Base-primary)]",
      },
      {
        variant: "fill",
        tone: "secondary",
        class: "data-[state=active]:bg-[var(--Base-secondary)] data-[state=active]:border-[var(--Base-secondary)]",
      },
      {
        variant: "line",
        tone: "primary",
        class: "data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)]",
      },
      {
        variant: "line",
        tone: "secondary",
        class: "data-[state=active]:border-[var(--Base-secondary)] data-[state=active]:text-[var(--Base-secondary)]",
      },
    ],
    defaultVariants: {
      variant: "fill",
      tone: "inherit",
      grow: true,
      size: "default",
    }
  }
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>
export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>
