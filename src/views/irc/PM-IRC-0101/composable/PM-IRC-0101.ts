import { ref } from 'vue'
import type { RecommendedKeyword } from '@/components/custom/search/SearchKeywordPanel.vue'

/**
 * 사건대응 시나리오 검색(PM-IRC-0101).
 * 한 화면이 '검색 전'(최근·추천검색어)과 '검색 후'(AI 생성 답변) 두 상태를 갖는다
 * — 시안 프레임 이름이 둘 다 PM-IRC-0101 이다(11708:84256 / 11775:98106).
 *
 * AI 답변은 실제로는 서버가 만들어 준다. 여기서는 시안 문구를 그대로 둔 목업이다.
 */

/**
 * 음성검색 버튼을 눌렀을 때 뜨는 '대기시간 초과' 확인창 문구.
 * Figma: MO_사건대응시나리오_대기시간 초과 (13323:98196 / 모달 본체 13323:98207).
 *
 * - `title` 은 태그를 받는다 — 시안 맨 위 느낌표 아이콘(icon/fill/exclamation)을 여기 넣는다
 * - `device: 'mobile'` — 이 확인창을 여는 음성검색 버튼 자체가 모바일 폭에서만 보인다
 *   (police-style.css 의 `@media (max-width: 1000px)`)
 * - '음식인식' 오타도 시안 그대로 옮겼다 — Figma 가 기준이다(docs/create.md §4)
 */
export const voiceWaitTimeoutDialog = {
  title:
    '<img src="/portal/asset/images/icon/ico_exclamation_32.svg" alt="" width="32" height="32">대기시간이 초과되었습니다.',
  description:
    '대기자가 많아 음식인식이 종료되었습니다. 아래의 [음성인식 시작] 버튼을 선택하여 음성인식을 시작합니다.',
  btnOk: '음성인식 시작',
  btnCancel: '취소',
  device: 'mobile' as const,
}

/** 답변 본문 한 단락 — 소제목이 있으면 heading, 목록이면 bullets */
export interface AnswerBlock {
  heading?: string
  paragraphs?: string[]
  bullets?: string[]
}

/** 우측 '참고자료' 아코디언 한 칸 — 펼치면 설명과 문서 링크가 나온다 */
export interface ReferenceCard {
  title: string
  description: string
  /** 설명 아래 붙는 문서 링크 문구. 실제 연결은 개발팀이 잇는다 */
  link?: string
}

export interface ScenarioAnswer {
  /** 도입 단락 */
  intro: string
  blocks: AnswerBlock[]
  references: ReferenceCard[]
}

const MOCK_RECENT = ['출동수당', '근무일지', '해바라기센터', '생활안전', '탄력순찰']

const MOCK_RECOMMENDED: RecommendedKeyword[] = [
  { keyword: '안전보건교육', trend: 'up', diff: 1 },
  { keyword: '산업재해조사표', trend: 'none' },
  { keyword: '퇴직금계산기', trend: 'up', diff: 3 },
  { keyword: '육아휴직급여', trend: 'down', diff: 1 },
  { keyword: '실업인정신청', trend: 'none' },
]

const REFERENCE_DESCRIPTION =
  '아동학대와 가정폭력 정황이 포착된 경우 즉시 신고가 법적으로 정당하고, 피해아동의 안전 확보가 최우선이라는 결론이 도출됩니다. 긴급성이 인정되는 경우 경찰의 현장 출동과 분리 보호조치가 가능하며, 신고자는 법에 따라 신원과 권리가 보호됩니다.'

const REFERENCE_LINK = '근거 및 참고가 되는 문서의 화면명'

/** 시안에서 처음부터 펼쳐져 있는 칸 */
const DEFAULT_OPEN_REFERENCE = '판례'

/** 시안의 답변 본문 한 덩어리 — 소제목·문단·목록 두 줄이 한 벌이다 */
const ANSWER_BLOCK: AnswerBlock = {
  heading: '임시조치와 증거 확보',
  paragraphs: [
    '임시조치는 유·무죄를 확정하는 것이 아니라, 재판과 별개로 피해자 안전을 위해 단기간 적용되는 잠정조치입니다.',
  ],
  bullets: [
    '증거는 사진(상처·파손), 진단서, CCTV, 문자·메신저, 통화녹음 등 객관 자료를 빠르게 확보·백업해 두시는 것이 도움이 됩니다.',
    '임시조치 결정문이 나오면 접근·통신 제한 범위와 기간을 정확히 확인하고, 위반 시 즉시 재신고하셔야 합니다.',
  ],
}

const MOCK_ANSWER: ScenarioAnswer = {
  intro:
    '가정폭력 신고 후에는 보통 112 신고 → 경찰 현장조사 및 분리 → 긴급임시조치(필요 시) → 검찰 송치 또는 피해자 신청을 통한 법원 임시조치 결정 순으로 진행됩니다. 이후 사건은 검사 판단에 따라 가정보호사건(가정법원 보호처분) 또는 일반 형사사건(기소·재판)으로 갈라질 수 있어, 단계별로 보호조치와 증거 확보를 병행하시는 것이 중요합니다.',
  // 시안(11775:98106)은 같은 덩어리가 두 번 쌓여 있다 — 목업이라 같은 내용을 두 번 둔다
  blocks: [ANSWER_BLOCK, ANSWER_BLOCK],
  references: [
    { title: '근거 및 참고 문서', description: REFERENCE_DESCRIPTION, link: REFERENCE_LINK },
    { title: '관련법령', description: REFERENCE_DESCRIPTION, link: REFERENCE_LINK },
    { title: '판례', description: REFERENCE_DESCRIPTION, link: REFERENCE_LINK },
    { title: '서식', description: REFERENCE_DESCRIPTION, link: REFERENCE_LINK },
    { title: '행정규칙', description: REFERENCE_DESCRIPTION, link: REFERENCE_LINK },
  ],
}

export function useIncidentScenarioSearch() {
  const keyword = ref('')
  /** 검색을 한 번이라도 실행했는지 — 검색 전/후 화면을 가른다 */
  const searched = ref(false)
  const answer = ref<ScenarioAnswer>(MOCK_ANSWER)

  /** 펼쳐진 참고자료 칸 제목. 한 번에 하나만 펼친다(Accordion type="single") */
  const openReference = ref(DEFAULT_OPEN_REFERENCE)

  const recentKeywords = ref<string[]>([...MOCK_RECENT])
  const recommendedKeywords = ref<RecommendedKeyword[]>([...MOCK_RECOMMENDED])

  /** 배열은 재할당한다(CLAUDE.md §3) */
  function removeRecent(target: string) {
    recentKeywords.value = recentKeywords.value.filter((item) => item !== target)
  }

  function clearRecent() {
    recentKeywords.value = []
  }

  /** 검색한 말은 최근검색어 맨 앞으로 올린다 */
  function pushRecent(target: string) {
    recentKeywords.value = [target, ...recentKeywords.value.filter((item) => item !== target)]
  }

  return {
    keyword,
    searched,
    answer,
    openReference,
    recentKeywords,
    recommendedKeywords,
    removeRecent,
    clearRecent,
    pushRecent,
  }
}
