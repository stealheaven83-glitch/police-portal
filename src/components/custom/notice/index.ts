/**
 * PrivacyNoticeBar — 개인정보 오남용 경고 문구 한 줄(+ 오른쪽 버튼 슬롯).
 * Figma 별도 컴포넌트 없음: 화면마다 반복되던 `.list-actions > .form-note.end` 마크업을 묶은 것.
 * `custom/infobox`(InfoBox) 와 다름 — InfoBox 는 박스형 안내, 이건 검색영역 아래 한 줄 텍스트.
 */
export { default as PrivacyNoticeBar } from './PrivacyNoticeBar.vue'
