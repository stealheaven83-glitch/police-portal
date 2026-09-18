import type { SideMenuConfig, SideMenuPresetKey } from "./types";

/**
 * 화면마다 반복되는 사이드메뉴 구성을 키 하나로 부를 수 있게 모아둔 곳.
 * 나중에 메뉴를 서버에서 받아오게 되면 loadSideMenuPreset() 안이 API 호출 자리가 된다.
 * (그래서 동기 객체인 지금도 반환 타입을 Promise 로 잡아둔다)
 *
 * 2026-09-17 배치 등록: 항목·순서·라벨은 사이트맵 시안(PC_SiteMap 10531:28348)을 따른다.
 * path 가 있는 항목은 useSideMenuSetup 의 syncActiveByRoute() 가 경로로 활성 항목을 맞추므로
 * 화면 쪽 인라인 activeChild/openIndex 는 덮어써진다(docs/create.md §3).
 * 사이트맵에 없지만 화면이 이미 있는 항목은 "사이트맵 없음" 주석을 달고 남겨 뒀다.
 */

/** 지역경찰 업무 화면 기본 LNB. useSideMenuSetup 을 부르지 않은 화면이 쓰는 값이기도 하다 */
export const localPoliceMenu: SideMenuConfig = {
  title: "지역경찰",
  openIndex: 0,
  activeChild: "메모",
  items: [
    {
      name: "개인수첩",
      children: [
        { name: "메모", path: "/views/lpo/PM-LPO-0101" },
        { name: "알림", path: "/views/lpo/PM-LPO-0106" },
        { name: "근무일정조회", path: "/views/lpo/PM-LPO-0108" },
        { name: "출동수당", path: "/views/lpo/PM-LPO-0109" },
        // 화면 폴더가 아직 없다 — plannedRoutes 에 등록돼 있어 "준비중" 화면이 뜬다
        { name: "개인실적조회", path: "/views/lpo/PC-LPO-0111" },
        // 결재요청자(0120)/결재승인자(0121) 두 화면인데 메뉴는 하나라 요청자 쪽으로 건다
        { name: "결재함", path: "/views/lpo/PM-LPO-0120" },
        { name: "화면설정", path: "/views/lpo/PM-LPO-0122" },
      ],
    },
    {
      name: "근무일지",
      children: [
        {
          name: "근무일지(甲)",
          children: [
            { name: "근무지정표작성", path: "/views/lpo/PC-LPO-0202" },
            { name: "기본주기설정", path: "/views/lpo/PC-LPO-0214" },
            { name: "사고자/자원근무자 월별", path: "/views/lpo/PC-LPO-0215" },
          ],
        },
        {
          name: "근무일지(乙)",
          children: [
            { name: "근무일지(乙) 등록", path: "/views/lpo/PM-LPO-0217" },
            { name: "근무일지(乙) 조회", path: "/views/lpo/PM-LPO-0223" },
          ],
        },
      ],
    },
    {
      name: "인수인계",
      children: [
        { name: "인수인계 작성", path: "/views/lpo/PC-LPO-0301" },
        { name: "월별 인수인계 현황", path: "/views/lpo/PC-LPO-0304" },
      ],
    },
    {
      name: "출동수당",
      children: [
        { name: "출동수당 조회", path: "/views/lpo/PC-LPO-0501" },
        { name: "출동수당 취합(월별)", path: "/views/lpo/PC-LPO-0505" },
        { name: "출동수당 취합(일별)", path: "/views/lpo/PC-LPO-0511" },
        // 사이트맵 없음 — 화면(PC-LPO-0512)이 있어 남겨 둔다
        { name: "출동수당통보", path: "/views/lpo/PC-LPO-0512" },
      ],
    },
    { name: "관내현황", path: "/views/lpo/PC-LPO-0601" },
    { name: "장비관리", path: "/views/lpo/PC-LPO-0701" },
    { name: "인사관리", path: "/views/lpo/PC-LPO-0801" },
    // 화면 폴더가 아직 없다 — plannedRoutes 에 등록돼 있어 "준비중" 화면이 뜬다
    { name: "지역경찰 기초정보 관리", path: "/views/lpo/PC-LPO-0901" },

  ],
};

/** 생활안전 LNB */
export const publicSafetyMenu: SideMenuConfig = {
  title: "생활안전",
  openIndex: 0,
  activeChild: "간이 범죄예방진단",
  items: [
    {
      name: "범죄예방진단",
      children: [
        { name: "간이 범죄예방진단", path: "/views/pub/PM-PUB-0101" },
        { name: "CPO 입력·관리", path: "/views/pub/PM-PUB-0103" },
        { name: "참고사항", path: "/views/pub/PM-PUB-0111" },
        { name: "우수시설인증", path: "/views/pub/PM-PUB-0113" },
        // 외부 시스템이라 새 창으로 연다
        { name: "Pre-CAS", href: "https://www.police.go.kr" },
      ],
    },
    {
      name: "여성청소년",
      children: [
        { name: "통합판단조사표", path: "/views/pub/PM-PUB-0201" },
        { name: "아동학대", path: "/views/pub/PM-PUB-0202" },
        // 사이트맵에서 외부 링크(↗)인데 주소가 아직 없어 라벨만 둔다
        { name: "맞춤형 순찰 현황" },
        { name: "(구) 자료 조회", path: "/views/pub/PC-PUB-0208" },
      ],
    },
    {
      name: "방범협력단체",
      children: [
        { name: "단체정보리스트", path: "/views/pub/PC-PUB-0301" },
        { name: "단체활동기록", path: "/views/pub/PM-PUB-0304" },
        { name: "단체현황", path: "/views/pub/PC-PUB-0306" },
        { name: "활동현황", path: "/views/pub/PC-PUB-0307" },
      ],
    },
    {
      name: "해바라기센터",
      children: [
        { name: "해바라기센터 관리", path: "/views/pub/PM-PUB-0401" },
        // 사이트맵 없음 — 화면 LNB 시안(13462-139493)에는 있고 화면(PM-PUB-0404)도 있어 남겨 둔다
        { name: "해바라기센터 사용자", path: "/views/pub/PM-PUB-0404" },
        { name: "조사예약", path: "/views/pub/PM-PUB-0405" },
        // 사이트맵 없음 — 화면 LNB 시안(15093-131379)에 있고 화면(PC-PUB-0419)도 있어 남겨 둔다
        { name: "예약불가 관리", path: "/views/pub/PC-PUB-0419" },
      ],
    },
    {
      name: "보호조치대응팀",
      children: [
        { name: "주취자 센터 병상 현황", path: "/views/pub/PM-PUB-0409" },
        { name: "주취자 센터관리", path: "/views/pub/PM-PUB-0411" },
        { name: "주취자입퇴소현황", path: "/views/pub/PC-PUB-0413" },
        { name: "정신 응급 대응팀", path: "/views/pub/PM-PUB-0414" },
      ],
    },
    {
      name: "보고서",
      children: [
        { name: "물리력 보고서", path: "/views/pub/PM-PUB-0701" },
        { name: "기타 영상기기 사용 보고서", path: "/views/pub/PM-PUB-0702" },
      ],
    },
  ],
};

/** 탄력순찰 LNB */
export const flexiblePatrolMenu: SideMenuConfig = {
  title: "탄력순찰",
  activeChild: "요청관리",
  // 시안의 4개 항목 모두 하위가 없는 1뎁스라 항목 자체가 링크다
  items: [
    { name: "요청관리", path: "/views/flp/PM-FLP-0101" },
    { name: "범죄 안전 지도" },
    { name: "탄력순찰 이행현황", path: "/views/flp/PM-FLP-0301" },
    { name: "탄력순찰 이행실적" },
  ],
};

/** 통계 LNB */
export const statisticsMenu: SideMenuConfig = {
  title: "통계",
  openIndex: 4,
  activeChild: "메뉴사용통계",
  items: [
    // 시안에서 앞 4개는 외부 시스템으로 나가는 ↗ 항목이다. 다만 SideMenu 는 href·↗ 를
    // 2뎁스에서만 처리하고 1뎁스는 <button> 으로 그려서, 여기 href 를 달면 눌러도 안 열린다.
    // 링크 주소도 아직 없어 지금은 라벨만 둔다(flexiblePatrolMenu 의 하위 없는 1뎁스와 같은 형태).
    { name: "112 통계 바로가기" },
    { name: "기초통계" },
    { name: "근무현황" },
    { name: "바인더통계" },
    {
      // 사이트맵에는 하위가 안 그려져 있지만 화면 3개가 있어 남겨 둔다
      name: "사용이력통계",
      children: [
        { name: "메뉴사용통계", path: "/views/stt/PC-STT-0401" },
        { name: "접속이력조회", path: "/views/stt/PC-STT-0402" },
        { name: "중요정보 변경이력 조회", path: "/views/stt/PC-STT-0403" },
      ],
    },
  ],
};

/**
 * 게시판 LNB.
 * 게시판 화면들은 아직 views/com/composable/board.ts(boardMenu) · notice.ts(bulletinMenu) 의 인라인 구성을
 * 쓰고 있다 — 그쪽 openIndex 가 항목 순서를 가리키고 있어 여기로 갈아타는 건 별도 배치로 남겨 둔다.
 * path 는 실제로 만들어진 화면 폴더 기준이다(2026-09-17: 공지사항 1001 · Q&A 1101 · 지역경찰 시책 1201 로 폴더가 바뀜. 현장조치는 아직 0601 폴더).
 */
export const boardMenu: SideMenuConfig = {
  title: "게시판",
  openIndex: 0,
  activeChild: "공지사항",
  items: [
    { name: "공지사항", path: "/views/com/PM-COM-1001" },
    { name: "Q&A", path: "/views/com/PM-COM-1101" },
    { name: "지역경찰 시책 우수사례", path: "/views/com/PM-COM-1201" },
    { name: "현장조치 우수사례", path: "/views/com/PM-COM-0601" },
    {
      name: "교육자료 나눔터",
      children: [
        { name: "교육훈련 우수사례", path: "/views/com/PM-COM-1401" },
        { name: "상시학습자료", path: "/views/com/PM-COM-1501" },
        { name: "법령 · 지침 · 매뉴얼", path: "/views/com/PM-COM-1601" },
        { name: "현장대응팁", path: "/views/com/PM-COM-1701" },
      ],
    },
    {
      name: "자료실",
      children: [{ name: "범죄예방진단", path: "/views/com/PM-COM-1901" }],
    },
    {
      name: "현장공감 Talk Talk",
      children: [
        { name: "경찰청 주요 정책", path: "/views/com/PM-COM-2001" },
        { name: "정책 제안 및 건의사항", path: "/views/com/PM-COM-2101" },
      ],
    },
  ],
};

/** 시스템 관리 LNB */
export const systemAdminMenu: SideMenuConfig = {
  title: "시스템 관리",
  // 시안은 '홈페이지 관리'가 펼쳐진 상태다
  openIndex: 3,
  activeChild: "게시판 관리",
  items: [
    {
      name: "시스템 운영관리",
      children: [
        { name: "사용자 권한관리", path: "/views/com/PC-COM-2201" },
        { name: "메뉴 관리", path: "/views/com/PC-COM-2203" },
        { name: "권한 관리", path: "/views/com/PC-COM-2204" },
        { name: "코드 관리", path: "/views/com/PC-COM-2206" },
      ],
    },
    { name: "시스템 모니터링", path: "/views/com/PC-COM-2301" },
    { name: "시스템 모니터링 관리" },
    {
      name: "홈페이지 관리",
      children: [
        { name: "게시판 관리", path: "/views/com/PC-COM-2401" },
        { name: "팝업 관리", path: "/views/com/PC-COM-2402" },
      ],
    },
    { name: "앱관리", path: "/views/com/PC-COM-2501" },
    { name: "도움말 관리기능" },
  ],
};

/** 메뉴 · 탭 연동 확인용 샘플 (menu-tab-guide.md 3.2) */
export const menuTabSampleMenu: SideMenuConfig = {
  title: "지역경찰",
  openIndex: 0,
  activeChild: "장비관리",
  items: [
    {
      name: "메뉴 탭 샘플",
      children: [
        { name: "장비관리", path: "/views/lpo/PC-LPO-0701" },
        { name: "관내현황", path: "/views/lpo/PC-LPO-0601" },
      ],
    },
  ],
};

const PRESETS: Record<SideMenuPresetKey, SideMenuConfig> = {
  localPolice: localPoliceMenu,
  publicSafety: publicSafetyMenu,
  flexiblePatrol: flexiblePatrolMenu,
  statistics: statisticsMenu,
  board: boardMenu,
  systemAdmin: systemAdminMenu,
  menuTabSample: menuTabSampleMenu,
};

/** 등록되지 않은 키를 넘기면 undefined 를 돌려주고, 호출부에서 메뉴를 건드리지 않는다 */
export async function loadSideMenuPreset(
  key: string,
): Promise<SideMenuConfig | undefined> {
  return PRESETS[key as SideMenuPresetKey];
}
