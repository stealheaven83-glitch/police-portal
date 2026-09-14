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
        // Figma chip(11220:71184): chip__single 을 가로로 늘어놓은 탭 — 칩 사이 16px
        chip: "gap-4",
        // Figma category tab(14374:123334): pill 모양 카테고리 탭 — 탭 사이 8px
        category: "gap-2",
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
<<<<<<< Updated upstream
        line: "rounded-none border-b-4 border-transparent text-[var(--Text-body_1)] hover:text-slate-900 " +
        "data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)] px-6 ",
=======
        line: "rounded-none border-b-2 border-transparent text-[var(--Text-body_1)] hover:text-slate-900 " +
        "data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)] ",
        /**
         * chip: Figma chip__single(medium) 을 탭으로 쓰는 것(11220:71184 — Q&A 등록의 분류 선택 등).
         * custom/chip/Chip 의 medium·checked 와 같은 모양(48px, 17px regular, 연파랑 배경 + 파란 테두리/글자,
         * 활성 탭 앞에 체크 아이콘). Chip 은 폼 값(라디오/체크박스) 이고, 이건 아래 내용이 바뀌는 탭이라 여기 둔다.
         * tone 은 영향 없다(칩은 primary 파랑 하나).
         */
        chip: "group gap-1 px-3 rounded-[var(--Radius-medium2)] text-[1.7rem] font-normal " +
        "border border-[var(--Border_gray01)] bg-white text-[var(--Text-body_0)] hover:bg-[var(--Surface-primary)] " +
        "data-[state=active]:bg-[var(--Surface-primary)] data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)]",
        /**
         * category: Figma category tab(14374:123334) — 목록 위 카테고리 pill 탭(40px, 15px, 좌우 20px, 완전 둥근 모서리).
         * 활성은 연파랑 배경 + 파란 테두리/글자 + bold. 체크 아이콘 없음. 항상 내용 폭(grow 무시 — compoundVariants 참고).
         * FilterChip 과 다르다 — FilterChip 은 개수를 달고 목록을 거르는 토글이고, 이건 아래 내용이 바뀌는 탭이다.
         */
        category: "px-5 rounded-full text-[1.5rem] font-normal " +
        "border border-[var(--Border_gray01)] bg-white text-[var(--Text-body_0)] hover:bg-[var(--Surface-primary)] " +
        "data-[state=active]:bg-[var(--Surface-primary)] data-[state=active]:border-[var(--Base-primary)] data-[state=active]:text-[var(--Base-primary)] data-[state=active]:font-bold",
>>>>>>> Stashed changes
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
      // chip 은 size 와 무관하게 Figma 높이 48 — size 의 h-[44px] 보다 뒤에 와야 이긴다
      {
        variant: "chip",
        class: "h-12",
      },
      // category 는 높이 40 고정, 폭은 항상 내용에 맞춘다(grow 의 flex-1/w-0 를 덮는다)
      {
        variant: "category",
        class: "h-10 flex-none w-auto",
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
