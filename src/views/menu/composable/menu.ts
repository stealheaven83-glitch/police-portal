// 전체메뉴(사이트맵) 목업 데이터 — Figma PC_SiteMap(10531:28348) 의 트리를 그대로 옮긴 것.
// 실제 메뉴 권한·노출 제어와 링크 연결은 개발팀이 이어받는다(CLAUDE.md 범위).

/** 3뎁스 항목. children 이 있으면 4뎁스를 가진 접기/펼치기 항목이다 */
export interface MenuLink {
  label: string
  /** 라우트 경로. 아직 안 정해진 메뉴가 대부분이라 optional — 있으면 RouterLink, 없으면 버튼 */
  path?: string
  /** 외부 사이트로 나가는 링크 — 새 창 아이콘을 붙인다 */
  external?: boolean
  children?: MenuLink[]
}

/** 2뎁스 — 파란 헤더 하나와 그 아래 3뎁스 목록. 한 칸(컬럼)을 이룬다 */
export interface MenuGroup {
  label: string
  path?: string
  /** 외부 사이트로 나가는 링크 — 헤더 자체에 새 창 아이콘을 붙인다 */
  external?: boolean
  items?: MenuLink[]
}

/** 1뎁스 — 상단 탭 하나 = 본문 구역 하나 */
export interface MenuSection {
  /** 탭 value 이자 본문 구역의 anchor id */
  id: string
  label: string
  groups: MenuGroup[]
}

export const menuSections: MenuSection[] = [
  {
    id: 'lpo',
    label: '지역경찰',
    groups: [
      {
        label: '개인수첩',
        items: [
          { label: '메모' },
          { label: '알림' },
          { label: '근무일정조회' },
          { label: '출동수당' },
          { label: '개인실적조회' },
          { label: '결재함' },
          { label: '화면설정' },
        ],
      },
      {
        label: '근무일지',
        items: [
          {
            label: '근무일지(甲)',
            children: [
              { label: '근무지정표작성' },
              { label: '기본주기설정' },
              { label: '사고자/자원근무자 월별' },
            ],
          },
          {
            label: '근무일지(乙)',
            children: [
              { label: '근무일지(乙) 등록' },
              { label: '근무일지(乙) 조회' },
            ],
          },
        ],
      },
      {
        label: '인수인계',
        items: [
          { label: '인수인계 작성' },
          { label: '월별 인수인계 현황' },
        ],
      },
      {
        label: '출동수당',
        items: [
          { label: '출동수당 조회' },
          { label: '출동수당 취합(월별)' },
          { label: '출동수당 취합(일별)' },
        ],
      },
      { label: '관내현황' },
      { label: '장비관리' },
      { label: '인사관리' },
      { label: '지역경찰 기초정보 관리' },
    ],
  },
  {
    id: 'pub',
    label: '생활안전',
    groups: [
      {
        label: '범죄예방진단',
        items: [
          { label: '간이 범죄예방진단' },
          { label: 'CPO 입력·관리' },
          { label: '참고사항' },
          { label: '우수시설인증' },
          { label: 'Pre-CAS', external: true },
        ],
      },
      {
        label: '여성청소년',
        items: [
          { label: '통합판단조사표' },
          { label: '아동학대' },
          { label: '맞춤형 순찰 현황', external: true },
          { label: '(구) 자료 조회' },
        ],
      },
      {
        label: '방범협력단체',
        items: [
          { label: '단체정보리스트' },
          { label: '단체활동기록' },
          { label: '단체현황' },
          { label: '활동현황' },
        ],
      },
      {
        label: '해바라기센터',
        items: [
          { label: '해바라기센터 관리' },
          { label: '조사예약' },
        ],
      },
      {
        label: '보호조치대응팀',
        items: [
          { label: '주취자 센터 병상 현황' },
          { label: '주취자 센터관리' },
          { label: '주취자입퇴소현황' },
          { label: '정신 응급 대응팀' },
        ],
      },
      {
        label: '보고서',
        items: [
          { label: '물리력 보고서' },
          { label: '기타 영상기기 사용 보고서' },
        ],
      },
    ],
  },
  {
    id: 'irc',
    label: '탄력순찰',
    groups: [
      { label: '요청관리' },
      { label: '범죄 안전 지도' },
      { label: '탄력순찰 이행현황' },
      { label: '탄력순찰 이행실적' },
    ],
  },
  {
    // Figma 에 1뎁스 제목만 있고 하위가 hidden 이다 — 제목만 렌더한다
    id: 'scenario',
    label: '사건대응 시나리오',
    groups: [],
  },
  {
    id: 'stt',
    label: '통계',
    groups: [
      { label: '112 통계 바로가기', external: true },
      { label: '기초통계', external: true },
      { label: '근무현황', external: true },
      { label: '바인더통계', external: true },
      { label: '사용이력통계' },
    ],
  },
  {
    id: 'board',
    label: '게시판',
    groups: [
      { label: '공지사항' },
      { label: 'Ｑ＆Ａ' },
      { label: '지역경찰 시책 우수사례' },
      { label: '현장조치 우수사례' },
      {
        label: '교육자료 나눔터',
        items: [
          { label: '교육훈련 우수사례' },
          { label: '상시학습자료' },
          { label: '법령 · 지침 · 매뉴얼' },
          { label: '현장대응팀' },
        ],
      },
      {
        label: '자료실',
        items: [{ label: '범죄예방진단' }],
      },
      {
        label: '현장공감 Talk Talk',
        items: [
          { label: '경찰청 주요 정책' },
          { label: '정책 제안 및 건의사항' },
        ],
      },
    ],
  },
  {
    id: 'com',
    label: '시스템 관리',
    groups: [
      {
        label: '시스템 운영관리',
        items: [
          { label: '사용자 권한관리' },
          { label: '메뉴 관리' },
          { label: '권한 관리' },
          { label: '코드 관리' },
        ],
      },
      { label: '시스템 모니터링' },
      { label: '시스템 모니터링 관리' },
      {
        label: '홈페이지 관리',
        items: [
          { label: '게시판 관리' },
          { label: '팝업 관리' },
        ],
      },
      { label: '앱관리' },
      { label: '도움말 관리기능' },
    ],
  },
]

/** 모바일 상단 '최근 메뉴' 칩. 실제로는 사용자별 이력이라 개발팀이 채운다 — 화면용 목업 */
export const recentMenus: string[] = [
  '메모',
  '근무일지(乙)',
  '미성년자 조회',
  '사고자/자원근무 신청',
  'Q&A',
]
