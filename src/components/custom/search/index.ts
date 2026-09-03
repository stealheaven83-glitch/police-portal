import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as SearchBar } from "./SearchBar.vue"
export { default as SearchKeywordPanel } from "./SearchKeywordPanel.vue"
export type { RecommendedKeyword } from "./SearchKeywordPanel.vue"

/**
 * 통합검색 대형 검색바(Figma: Form, 13315:97548 / 13323:105863).
 *
 * SearchWrapper 와 헷갈리지 않는다 — SearchWrapper 는 "그리드 위 조회조건 영역"이고,
 * SearchBar 는 화면 한가운데 놓이는 **검색어 한 줄짜리 대형 입력창**이다.
 * 헤더 우측의 작은 통합검색(Figma: search__pc)은 PortalHeader.vue 가 따로 갖고 있다.
 *
 * 쓰는 화면: PM-COM-0801(통합검색) · PM-COM-0802(통합검색 결과) · PM-IRC-0101(사건대응 시나리오)
 */
export const searchBarVariants = cva(
  "flex w-full items-center gap-4 rounded-full border-2 border-[var(--Base-primary)] bg-white pl-[2rem] pr-[0.8rem]",
  {
    variants: {
      size: {
        // Figma size-height/11(80) — 안쪽 원형 버튼이 size-height/9(64)
        default: "h-[8rem]",
      },
    },
    defaultVariants: { size: "default" },
  },
)

/**
 * 검색바 왼쪽 상태 뱃지(Figma: 사건대응 시나리오 화면의 "검색 원활").
 * 음성인식 서버 상태를 말풍선처럼 붙여 보여주는 자리라, 오른쪽에 꼬리가 달린다.
 */
export const searchBarStatusVariants = cva(
  "relative flex h-[3.6rem] shrink-0 items-center gap-1.5 rounded-full px-4 text-[1.5rem] font-bold text-white " +
    "after:absolute after:top-1/2 after:right-[-0.4rem] after:size-[1.2rem] after:-translate-y-1/2 after:rotate-45 after:rounded-[0.2rem] after:content-['']",
  {
    variants: {
      tone: {
        success: "bg-[var(--success)] after:bg-[var(--success)]",
        danger: "bg-[var(--danger)] after:bg-[var(--danger)]",
      },
    },
    defaultVariants: { tone: "success" },
  },
)

export type SearchBarVariants = VariantProps<typeof searchBarVariants>
export type SearchBarStatusVariants = VariantProps<typeof searchBarStatusVariants>
