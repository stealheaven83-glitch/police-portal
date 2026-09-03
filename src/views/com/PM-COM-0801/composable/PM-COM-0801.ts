import { ref } from 'vue'
import type { RecommendedKeyword } from '@/components/custom/search/SearchKeywordPanel.vue'

/**
 * 통합검색 검색창(PM-COM-0801).
 * 최근검색어·추천검색어는 개발팀이 API 로 채운다 — 여기서는 시안 값 그대로의 목업이다.
 */

/** 시안(11722:93550)의 최근검색어 5개 */
const MOCK_RECENT = ['출동수당', '근무일지', '해바라기센터', '생활안전', '탄력순찰']

/** 시안(11722:93570)의 추천검색어 5개 — 순위 변동 포함 */
const MOCK_RECOMMENDED: RecommendedKeyword[] = [
  { keyword: '안전보건교육', trend: 'up', diff: 1 },
  { keyword: '산업재해조사표', trend: 'none' },
  { keyword: '퇴직금계산기', trend: 'up', diff: 3 },
  { keyword: '육아휴직급여', trend: 'down', diff: 1 },
  { keyword: '실업인정신청', trend: 'none' },
]

export function useIntegratedSearch() {
  const keyword = ref('')
  const recentKeywords = ref<string[]>([...MOCK_RECENT])
  const recommendedKeywords = ref<RecommendedKeyword[]>([...MOCK_RECOMMENDED])

  /** 배열은 재할당한다 — 제자리 수정(splice)은 얕은 비교를 하는 watch 가 놓친다(CLAUDE.md §3) */
  function removeRecent(target: string) {
    recentKeywords.value = recentKeywords.value.filter((item) => item !== target)
  }

  function clearRecent() {
    recentKeywords.value = []
  }

  return {
    keyword,
    recentKeywords,
    recommendedKeywords,
    removeRecent,
    clearRecent,
  }
}
