import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as InfoBox } from "./InfoBox.vue"

/**
 * 인포박스(Infobox): 콘텐츠 중간에서 사용자의 이해를 돕는 안내 블록.
 * Alert과 다르다 — Alert은 결과/경고(성공·실패)를 알리고, InfoBox는 설명을 덧붙인다.
 * Figma: infobox (Type=[primary|secondary], Size=[Default|slim])
 * - Default: 아이콘+제목 / 본문 / 구분선 / 목록. 모서리 12px
 * - slim   : 아이콘+한 줄. 모서리 8px
 */
export const infoBoxVariants = cva(
  "flex border p-4 w-full",
  {
    variants: {
      type: {
        // #eef2f7 / #d6e0eb — border는 대응 토큰이 없어 Figma 값을 그대로 쓴다
        primary: "bg-[var(--Surface-secondary)] border-[#d6e0eb]",
        secondary: "bg-[var(--Background-gray01)] border-[var(--Border_gray02)]",
      },
      size: {
        default: "flex-col items-start justify-center rounded-[var(--Radius-xlarge2)]",
        slim: "items-center gap-2 rounded-[var(--Radius-medium3)]",
      },
    },
    compoundVariants: [
      { type: "primary", size: "default", class: "gap-3" },
      { type: "secondary", size: "default", class: "gap-2" },
    ],
    defaultVariants: {
      type: "primary",
      size: "default",
    },
  },
)
export type InfoBoxVariants = VariantProps<typeof infoBoxVariants>

export const infoBoxTitleVariants = cva(
  "flex-1 min-w-0 font-bold text-[1.5rem] leading-[1.5]",
  {
    variants: {
      type: {
        primary: "text-[var(--Base-secondary)]",
        secondary: "text-[var(--Text-body_0)]",
      },
    },
    defaultVariants: { type: "primary" },
  },
)

export const infoBoxBodyVariants = cva(
  "text-[1.5rem] leading-[1.5]",
  {
    variants: {
      type: {
        primary: "text-[var(--Text-body_1)]",
        secondary: "text-[var(--Text-body_1)]",
      },
      size: {
        // Default는 아이콘(20px)+간격(8px)만큼 본문을 들여쓴다
        default: "pl-[2.8rem] w-full",
        slim: "flex-1 min-w-0",
      },
    },
    compoundVariants: [
      { type: "primary", size: "slim", class: "text-[var(--Base-secondary)]" },
      { type: "secondary", size: "slim", class: "text-[var(--Text-body_0)]" },
    ],
    defaultVariants: { type: "primary", size: "default" },
  },
)
