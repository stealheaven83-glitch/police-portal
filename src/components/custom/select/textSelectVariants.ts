import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

/**
 * 텍스트형 셀렉트(select_text): 테두리·배경 없이 "라벨 ⌄"만 있는 드롭다운 트리거.
 * SelectField와 다르다 — SelectField는 테두리 있는 폼 입력이고, 이건 툴바·정렬·지도 위처럼
 * 폼 밖에서 값을 바꿀 때 쓰는 가벼운 형태다. hover는 연회색, pressed는 연파랑 배경만 깔린다.
 * Figma: select_text (Size=[xlarge|medium|small|map], State=[default|hover|pressed|select_text])
 * ⚠ Figma의 State 네 번째 값 이름이 `select_text`(컴포넌트명과 같음)라 의미가 불명확하다 —
 *   선택 완료 상태로 보고 `selected`로 옮겼다. 디자인 확인 필요.
 */
export const textSelectVariants = cva(
  "inline-flex cursor-pointer items-center gap-1 rounded-[var(--Radius-small3)] whitespace-nowrap transition-colors " +
    "text-[var(--Text-body_0)] hover:bg-[var(--Background-gray01)] active:bg-[var(--Surface-primary)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "disabled:pointer-events-none disabled:text-[var(--Text-body_disable)]",
  {
    variants: {
      size: {
        xlarge: "h-10 px-2 text-[1.9rem] font-bold",
        medium: "h-8 px-2 text-[1.5rem]",
        small: "h-6 px-1.5 text-[1.3rem]",
        /** 지도 위에 얹는 형태 — 배경을 깔아 지도 위에서도 읽히게 한다 */
        map: "h-8 rounded-full border border-[var(--Border_gray02)] bg-white px-3 text-[1.5rem] shadow-sm",
      },
      state: {
        default: "",
        selected: "bg-[var(--Surface-primary)] text-[var(--Base-primary)]",
      },
    },
    defaultVariants: {
      size: "medium",
      state: "default",
    },
  },
)
export type TextSelectVariants = VariantProps<typeof textSelectVariants>

/** 화살표 아이콘 크기 — 셀렉트 크기에 맞춘다 */
export const textSelectIconSize = {
  xlarge: "size-5",
  medium: "size-4",
  small: "size-3.5",
  map: "size-4",
} as const
