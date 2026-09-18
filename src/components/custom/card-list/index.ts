import { cva } from "class-variance-authority"

export { default as CardList } from "./CardList.vue"

/**
 * 카드 목록(CardList): 카드를 세로로 쌓는 <ul> 뼈대 + 0건 처리. 그게 전부다.
 * Figma: card (12738:50267) 가 '한 장'이고, 이 컴포넌트는 그 '여러 장'을 담는 그릇이다.
 *
 * 카드 한 장에 무엇이 들어갈지는 **화면이 정한다** — <Card as="li"> 를 넣어도 되고
 * 직접 짠 <li> 를 넣어도 된다. 그래서 이 컴포넌트에는 데이터 prop 이 없다.
 *
 * 이 컴포넌트는 **누가 자기를 쓰는지 모른다** — 모바일 전용 화면이 직접 쓰기도 하고,
 * 반응형에서는 TabulatorGrid 가 좁은 폭일 때 행 데이터를 카드로 바꿔 이 안에 넣는다.
 * 그쪽 사정(컬럼·선택·페이지)이 여기로 새어 들어오지 않게 데이터 prop 을 두지 않는다.
 *
 * 이름이 비슷한 것들과의 차이(§9):
 *  - custom/card/Card.vue      카드 '한 장'. 제목·설명·태그 구조 또는 #custom 슬롯
 *  - TabulatorGrid 의 카드 뷰   이 CardList + Card 로 그린다. 표를 좁은 폭에서 **자동으로**
 *                              바꿔 주는 게 그쪽 가치고(화면이 할 일 없음), 이쪽은 자유가 가치다.
 */
export const cardListVariants = cva("flex flex-col gap-[1.6rem]")
