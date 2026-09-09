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
 * 모양은 SearchBar.vue 가 아니라 police-style.css 의 `.search-wrap .search-bar ...`
 * (693~782행)에 있다 — 포털 원본 마크업을 그대로 쓰기 때문이다. 폭·위치만 호출부에서
 * .lp-search-hero / .scenario-search-center 로 준다.
 *
 * 쓰는 화면: PM-COM-0801(통합검색) · PM-COM-0802(통합검색 결과) · PM-IRC-0101(사건대응 시나리오)
 */
