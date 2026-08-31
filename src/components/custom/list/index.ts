import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as List } from "./List.vue"
export { default as ListGroup } from "./ListGroup.vue"

/**
 * 텍스트 목록(List): 안내 문구를 불릿과 함께 여러 줄로 나열할 때 쓴다.
 * 레벨마다 불릿 모양이 다르다 — 1=채운 원, 2=짧은 막대, 3=빈 사각.
 * Figma: list (Level=[1|2|3], Type=[unordered|ordered]) / list_group
 */
export const listVariants = cva(
  "flex w-full items-start",
  {
    variants: {
      level: {
        1: "gap-2",
        2: "gap-1",
        3: "gap-1",
      },
    },
    defaultVariants: { level: 1 },
  },
)
export type ListVariants = VariantProps<typeof listVariants>

/** 불릿을 감싸는 고정 폭 영역 — 텍스트 첫 줄과 세로 중앙을 맞춘다 */
export const listBulletBoxVariants = cva(
  "flex w-4 shrink-0 items-center pl-2",
  {
    variants: {
      level: {
        1: "h-[2.6rem]",
        2: "h-[2.6rem]",
        3: "h-[2.3rem]",
      },
    },
    defaultVariants: { level: 1 },
  },
)

export const listBulletVariants = cva(
  "shrink-0",
  {
    variants: {
      level: {
        1: "size-1 rounded-[4px] bg-[var(--Text-body_1)]",
        2: "h-[1.2px] w-1.5 bg-[var(--Text-body_1)]",
        // #58616a 는 police-style.css 에 --Button-tertiary-bk-border 로만 있다.
        // 버튼 전용 이름이라 불릿에 쓰면 의미가 어긋나서 Figma 값을 그대로 둔다.
        3: "size-1 rounded-[4px] border border-solid border-[#58616a]",
      },
    },
    defaultVariants: { level: 1 },
  },
)
