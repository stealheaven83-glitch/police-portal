import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Tag } from "./Tag.vue"
export { default as TagList } from "./TagList.vue"

/**
 * 태그(Tag): 콘텐츠에 붙은 키워드를 pill 모양으로 보여준다. Badge와 다르다 —
 * Badge는 상태 표시(읽기 전용)이고 Tag는 누르거나 지울 수 있는 조작 대상이다.
 * FilterChip과도 다르다 — FilterChip은 "선택하면 목록이 걸러지는" 토글이다.
 * Figma: tag (Type=[sorting|button], Size=[large|medium|small], State=[default|hover|pressed])
 * - sorting: 라벨 + 삭제(x) 버튼
 * - button : 링크형(#태그). hover/pressed에서 밑줄
 */
export const tagVariants = cva(
  "inline-flex items-center justify-center gap-0.5 rounded-full whitespace-nowrap border border-transparent transition-colors text-[var(--Text-body_0)]",
  {
    variants: {
      size: {
        large: "h-10 px-3 py-2 text-[1.7rem]",
        medium: "h-8 px-3 py-2 text-[1.5rem]",
        small: "h-6 p-2 text-[1.3rem]",
      },
      state: {
        default: "bg-white border-[var(--Border_gray02)]",
        // #eef2f7 / #d6e0eb — pressed 색은 대응 토큰이 없어 Figma 값을 그대로 쓴다
        hover: "bg-[var(--Surface-secondary)]",
        pressed: "bg-[#d6e0eb]",
      },
      interactive: {
        true: "cursor-pointer hover:bg-[var(--Surface-secondary)] hover:border-transparent active:bg-[#d6e0eb] active:border-transparent",
        false: "",
      },
    },
    defaultVariants: {
      size: "large",
      state: "default",
      interactive: false,
    },
  },
)
export type TagVariants = VariantProps<typeof tagVariants>
