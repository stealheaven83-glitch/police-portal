import { cva, type VariantProps } from "class-variance-authority"

export { default as Tabs } from "./Tabs.vue"
export { default as TabsContent } from "./TabsContent.vue"
export { default as TabsList } from "./TabsList.vue"
export { default as TabsTrigger } from "./TabsTrigger.vue"

export const tabsListVariants = cva(
  "flex items-center justify-start transition-all scrollbar-thumb-slate-900 scrollbar-track-slate-200 md:scrollbar-thumb-sky-700",
  {
    variants: {
      variant: {
        fill: "gap-2",
        line: "",
      },
      scrollable: {
        false: "w-full",
        true: "w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap scroll-wrap scrollbar-thin scrollbar-track-[#0054A6] border-none"
      },
    },
    compoundVariants: [
      {
        variant: "line",
        scrollable: false,
        class: "border-[#B1B8BE] border-b"
      },
      {
        variant: "line",
        scrollable: true,
        class: ""
      },
    ],
    defaultVariants: {
      variant: "fill",
      scrollable: false
    },
  }
)

export const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center p-2 whitespace-nowrap text-[15px] text-[#464C53] font-bold transition-all " + 
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 shrink-0",
  {
    variants: {
      variant: {
        fill: "border border-[#CDD1D5] rounded-[6px] text-[#464C53] hover:bg-[#EEF2F7] " +
        "data-[state=active]:bg-[#023F88] data-[state=active]:text-white data-[state=active]:border-[#023F88] data-[state=active]:shadow-xs", 
        line: "rounded-none text-[#464C53] hover:text-slate-900 " +
        "data-[state=active]:border-[#0054A6] data-[state=active]:border-b-2 data-[state=active]:text-[#0054A6] ",
      },
      scrollable: {
        true: "",
        false: "",
      },
      grow: {
        true: "flex-1 w-0 min-w-0",
        false: "flex-none w-auto",
      },
      size: { // 임시로넣음
        default: "h-[44px]",
        sm: "h-[36px] px-3 text-sm",
        lg: "h-[50px] px-5 text-base",
      }
    },
     compoundVariants: [
      {
        variant: "line",
        scrollable: false,
        class: ""
      },
      {
        variant: "line",
        scrollable: true,
        class: "border-[#B1B8BE] border-b"
      },
    ],
    defaultVariants: {
      variant: "fill",
      grow: true,
      size: "default",
    }
  }
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>
export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>