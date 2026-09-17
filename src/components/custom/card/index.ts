import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Card } from "./Card.vue"

/**
 * 카드(Card): 제목·설명·메타·태그·버튼을 한 덩어리로 묶어 보여주는 컨테이너.
 * Figma: card (Type=[vertical|horizontal], Image=[on|off], 1496:30842)
 *
 * 2026-09-17 껍데기(여백·간격·테두리·모서리)를 **card 12738:50267** 값으로 맞췄다 —
 * 모바일 카드 목록과 외형을 통일하기로 해서다. 안쪽 구조(제목·설명·메타·태그)는 그대로다.
 *   여백 16px / 간격 12px / 테두리 --Border_gray02(#cdd1d5) / 모서리 --Radius-medium3(8px)
 *   루트 폰트가 10px 이라 Tailwind 숫자 스케일(p-8 = 20px)로는 안 맞아 rem 을 직접 적는다(§13)
 * 구성 요소(뱃지/체크박스/보조버튼/태그/메타/버튼)는 전부 선택이라 슬롯으로 열어 뒀다 —
 * Figma의 boolean variant 하나하나를 prop으로 두는 대신 슬롯 유무로 판단한다.
 */
export const cardVariants = cva(
  "flex items-start rounded-[var(--Radius-medium3)] border border-[var(--Border_gray02)] bg-white p-[1.6rem] gap-[1.2rem]",
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
