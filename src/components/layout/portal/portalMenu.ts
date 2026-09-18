/**
 * 지역경찰포털 전체메뉴(GNB) 데이터.
 * 퍼블리싱 원본 html/index.html 의 .main-menu 마크업을 데이터로 옮긴 것.
 *
 * 2026-09-17: 항목·순서·라벨을 사이트맵 시안(PC_SiteMap 10531:28348)에 맞췄다.
 * 시안의 1dep → 2뎁스 → 3뎁스가 그대로 depth1 → depth2 → depth3 이고, 시안의 4뎁스
 * (근무일지(甲)·(乙) 아래 항목)는 이 구조에 자리가 없어 LNB(presets.ts)에만 둔다.
 * depth1.path 는 그 구획의 첫 화면 — GNB 를 눌렀을 때 들어갈 자리다.
 */

export interface PortalMenuDepth3 {
  title: string
  path?: string
  /** 외부 시스템 링크(시안 ↗). 주소가 정해지면 채운다 */
  href?: string
}

export interface PortalMenuDepth2 {
  title: string
  path?: string
  href?: string
  /** gnb-sub-sub 의 제목 (원본 마크업의 strong.tit) */
  groupTitle?: string
  children?: PortalMenuDepth3[]
}

export interface PortalMenuDepth1 {
  title: string
  path?: string
  /** gnb-sub 의 제목 (원본 마크업의 strong.tit) */
  groupTitle?: string
  children?: PortalMenuDepth2[]
}

export const portalMenu: PortalMenuDepth1[] = [
  {
    title: '지역경찰',
    groupTitle: '지역경찰',
    path: '/views/lpo/PM-LPO-0101',
    children: [
      {
        title: '개인수첩',
        groupTitle: '개인수첩',
        children: [
          { title: '메모', path: '/views/lpo/PM-LPO-0101' },
          { title: '알림', path: '/views/lpo/PM-LPO-0106' },
          { title: '근무일정조회', path: '/views/lpo/PM-LPO-0108' },
          { title: '출동수당', path: '/views/lpo/PM-LPO-0109' },
          { title: '개인실적조회', path: '/views/lpo/PC-LPO-0111' },
          { title: '결재함', path: '/views/lpo/PM-LPO-0120' },
          { title: '화면설정', path: '/views/lpo/PM-LPO-0122' },
        ],
      },
      {
        title: '근무일지',
        groupTitle: '근무일지',
        children: [
          { title: '근무일지(甲)', path: '/views/lpo/PC-LPO-0202' },
          { title: '근무일지(乙)', path: '/views/lpo/PM-LPO-0217' },
        ],
      },
      {
        title: '인수인계',
        groupTitle: '인수인계',
        children: [
          { title: '인수인계 작성', path: '/views/lpo/PC-LPO-0301' },
          { title: '월별 인수인계 현황', path: '/views/lpo/PC-LPO-0304' },
        ],
      },
      {
        title: '출동수당',
        groupTitle: '출동수당',
        children: [
          { title: '출동수당 조회', path: '/views/lpo/PC-LPO-0501' },
          { title: '출동수당 취합(월별)', path: '/views/lpo/PC-LPO-0505' },
          { title: '출동수당 취합(일별)', path: '/views/lpo/PC-LPO-0511' },
        ],
      },
      { title: '관내현황', path: '/views/lpo/PC-LPO-0601' },
      { title: '장비관리', path: '/views/lpo/PC-LPO-0701' },
      { title: '인사관리', path: '/views/lpo/PC-LPO-0801' },
      { title: '지역경찰 기초정보 관리' },
    ],
  },
  {
    title: '생활안전',
    groupTitle: '생활안전',
    path: '/views/pub/PM-PUB-0101',
    children: [
      {
        title: '범죄예방진단',
        groupTitle: '범죄예방진단',
        children: [
          { title: '간이 범죄예방진단', path: '/views/pub/PM-PUB-0101' },
          { title: 'CPO 입력·관리', path: '/views/pub/PM-PUB-0103' },
          { title: '참고사항', path: '/views/pub/PM-PUB-0111' },
          { title: '우수시설인증', path: '/views/pub/PM-PUB-0113' },
          { title: 'Pre-CAS', href: 'https://www.police.go.kr' },
        ],
      },
      {
        title: '여성청소년',
        groupTitle: '여성청소년',
        children: [
          { title: '통합판단조사표', path: '/views/pub/PM-PUB-0201' },
          { title: '아동학대', path: '/views/pub/PM-PUB-0202' },
          { title: '맞춤형 순찰 현황' },
          { title: '(구) 자료 조회', path: '/views/pub/PC-PUB-0208' },
        ],
      },
      {
        title: '방범협력단체',
        groupTitle: '방범협력단체',
        children: [
          { title: '단체정보리스트', path: '/views/pub/PC-PUB-0301' },
          { title: '단체활동기록', path: '/views/pub/PM-PUB-0304' },
          { title: '단체현황', path: '/views/pub/PC-PUB-0306' },
          { title: '활동현황', path: '/views/pub/PC-PUB-0307' },
        ],
      },
      {
        title: '해바라기센터',
        groupTitle: '해바라기센터',
        children: [
          { title: '해바라기센터 관리', path: '/views/pub/PM-PUB-0401' },
          { title: '조사예약', path: '/views/pub/PM-PUB-0405' },
        ],
      },
      {
        title: '보호조치대응팀',
        groupTitle: '보호조치대응팀',
        children: [
          { title: '주취자 센터 병상 현황', path: '/views/pub/PM-PUB-0409' },
          { title: '주취자 센터관리', path: '/views/pub/PM-PUB-0411' },
          { title: '주취자입퇴소현황', path: '/views/pub/PC-PUB-0413' },
          { title: '정신 응급 대응팀', path: '/views/pub/PM-PUB-0414' },
        ],
      },
      {
        title: '보고서',
        groupTitle: '보고서',
        children: [
          { title: '물리력 보고서', path: '/views/pub/PM-PUB-0701' },
          { title: '기타 영상기기 사용 보고서', path: '/views/pub/PM-PUB-0702' },
        ],
      },
    ],
  },
  {
    title: '탄력순찰',
    groupTitle: '탄력순찰',
    path: '/views/flp/PM-FLP-0101',
    children: [
      { title: '요청관리', path: '/views/flp/PM-FLP-0101' },
      { title: '범죄 안전 지도' },
      { title: '탄력순찰 이행현황', path: '/views/flp/PM-FLP-0301' },
      { title: '탄력순찰 이행실적' },
    ],
  },
  {
    title: '사건대응 시나리오',
    groupTitle: '사건대응 시나리오',
    path: '/views/irc/PM-IRC-0101',
  },
  {
    title: '통계',
    groupTitle: '통계',
    path: '/views/stt/PC-STT-0401',
    children: [
      // 앞 4개는 시안에서 외부 시스템으로 나가는 ↗ 항목 — 주소가 정해지면 href 를 채운다
      { title: '112 통계 바로가기' },
      { title: '기초통계' },
      { title: '근무현황' },
      { title: '바인더통계' },
      {
        title: '사용이력통계',
        groupTitle: '사용이력통계',
        children: [
          { title: '메뉴사용통계', path: '/views/stt/PC-STT-0401' },
          { title: '접속이력조회', path: '/views/stt/PC-STT-0402' },
          { title: '중요정보 변경이력 조회', path: '/views/stt/PC-STT-0403' },
        ],
      },
    ],
  },
  {
    title: '게시판',
    groupTitle: '게시판',
    path: '/views/com/PM-COM-1001',
    children: [
      { title: '공지사항', path: '/views/com/PM-COM-1001' },
      { title: 'Q&A', path: '/views/com/PM-COM-1101' },
      { title: '지역경찰 시책 우수사례', path: '/views/com/PM-COM-1201' },
      { title: '현장조치 우수사례', path: '/views/com/PM-COM-0601' },
      {
        title: '교육자료 나눔터',
        groupTitle: '교육자료 나눔터',
        children: [
          { title: '교육훈련 우수사례', path: '/views/com/PM-COM-1401' },
          { title: '상시학습자료', path: '/views/com/PM-COM-1501' },
          { title: '법령 · 지침 · 매뉴얼', path: '/views/com/PM-COM-1601' },
          { title: '현장대응팁', path: '/views/com/PM-COM-1701' },
        ],
      },
      {
        title: '자료실',
        groupTitle: '자료실',
        children: [{ title: '범죄예방진단', path: '/views/com/PM-COM-1901' }],
      },
      {
        title: '현장공감 Talk Talk',
        groupTitle: '현장공감 Talk Talk',
        children: [
          { title: '경찰청 주요 정책', path: '/views/com/PM-COM-2001' },
          { title: '정책 제안 및 건의사항', path: '/views/com/PM-COM-2101' },
        ],
      },
    ],
  },
  {
    title: '시스템 관리',
    groupTitle: '시스템 관리',
    path: '/views/com/PC-COM-2201',
    children: [
      {
        title: '시스템 운영관리',
        groupTitle: '시스템 운영관리',
        children: [
          { title: '사용자 권한관리', path: '/views/com/PC-COM-2201' },
          { title: '메뉴 관리', path: '/views/com/PC-COM-2203' },
          { title: '권한 관리', path: '/views/com/PC-COM-2204' },
          { title: '코드 관리', path: '/views/com/PC-COM-2206' },
        ],
      },
      { title: '시스템 모니터링', path: '/views/com/PC-COM-2301' },
      { title: '시스템 모니터링 관리' },
      {
        title: '홈페이지 관리',
        groupTitle: '홈페이지 관리',
        children: [
          { title: '게시판 관리', path: '/views/com/PC-COM-2401' },
          { title: '팝업 관리', path: '/views/com/PC-COM-2402' },
        ],
      },
      { title: '앱관리', path: '/views/com/PC-COM-2501' },
      { title: '도움말 관리기능' },
    ],
  },
]

/** 헤더 우측 마이페이지 영역 */
export const portalMyInfo = {
  name: '홍길동',
  position: '경위',
  thumbnail: '/portal/asset/images/img/img_myPage.jpg',
  path: '',
}
