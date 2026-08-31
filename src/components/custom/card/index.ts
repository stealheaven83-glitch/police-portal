import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Card } from "./Card.vue"

/**
 * 카드(Card): 제목·설명·메타·태그·버튼을 한 덩어리로 묶어 보여주는 컨테이너.
 * Figma: card (Type=[vertical|horizontal], Image=[on|off], 1496:30842)
 * 구성 요소(뱃지/체크박스/보조버튼/태그/메타/버튼)는 전부 선택이라 슬롯으로 열어 뒀다 —
 * Figma의 boolean variant 하나하나를 prop으로 두는 대신 슬롯 유무로 판단한다.
 */
export const cardVariants = cva(
  "flex items-start rounded-[var(--Radius-xlarge2)] border border-[var(--Border_gray01)] bg-white p-8 gap-6",
  {
    variants: {
      type: {
        vertical: "flex-col w-full min-w-[24rem]",
        horizontal: "flex-row w-full min-w-[60rem]",
      },
    },
    defaultVariants: { type: "vertical" },
  },
)
export type CardVariants = VariantProps<typeof cardVariants>
