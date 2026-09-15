import type { SideMenuConfig, SideMenuPresetKey } from "./types";

/**
 * 화면마다 반복되는 사이드메뉴 구성을 키 하나로 부를 수 있게 모아둔 곳.
 * 나중에 메뉴를 서버에서 받아오게 되면 loadSideMenuPreset() 안이 API 호출 자리가 된다.
 * (그래서 동기 객체인 지금도 반환 타입을 Promise 로 잡아둔다)
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
        { name: "근무일정 조회" },
        { name: "사고자/자원근무 신청" },
        { name: "출동수당" },
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
        { name: "근무일지(乙)" },
        { name: "월간근무표" },
      ],
    },
    {
      name: "인수인계",
      children: [
        { name: "인수인계 작성" },
        { name: "차량점검" },
        { name: "인수인계 현황" },
      ],
    },
    {
      name: "출동수당",
      children: [
        { name: "출동수당 조회" },
        { name: "출동수당 취합(월별)" },
        { name: "출동수당 취합(일별)" },
        { name: "출동수당통보" },
      ],
    },
    { name: "관내현황", path: "/views/lpo/PC-LPO-0601" },
    { name: "개인장비", path: "/views/lpo/PC-LPO-0701" },
    { name: "인사관리", path: "/views/lpo/PC-LPO-0801" },
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
        { name: "CPO 입력 · 관리" },
        { name: "참고사항" },
        { name: "우수시설인증" },
        // 외부 시스템이라 새 창으로 연다
        { name: "Pre-CAS", href: "https://www.police.go.kr" },
      ],
    },
    {
      name: "여성청소년",
      children: [{ name: "통합판단조사표" }, { name: "아동학대" }],
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
    /*
     * 사용자 지정(2026-09-14): 시안(13462-139493) 대로 갱신 — docs/create.md §3 은
     * presets.ts 수정을 ⛔ 로 두지만 요청대로 따랐다. 지우고 들어간 "센터현황" 은 시안에 없고
     * 쓰는 화면도 없었다. 시안에는 "조사예약" · "예약불가 관리" 도 있으나 화면이 아직 없어 뺐다.
     */
    {
      name: "해바라기센터",
      children: [
        { name: "해바라기센터 관리", path: "/views/pub/PM-PUB-0401" },
        { name: "해바라기센터 사용자", path: "/views/pub/PM-PUB-0404" },
      ],
    },
    {
      name: "보호조치 대응팀",
      children: [
        { name: "주취자 센터 병상 현황", path: "/views/pub/PM-PUB-0409" },
        { name: "주취자 센터관리", path: "/views/pub/PM-PUB-0411" },
        { name: "주취자 입퇴소 현황", path: "/views/pub/PC-PUB-0413" },
        { name: "정신 응급 대응팀", path: "/views/pub/PM-PUB-0414" },
      ],
    },
    { name: "보고서", children: [{ name: "보고서 목록" }] },
  ],
};

/** 시스템 관리 LNB */
export const systemAdminMenu: SideMenuConfig = {
  title: "시스템 관리",
  // 시안은 '홈페이지 관리'가 펼쳐진 상태다
  openIndex: 2,
  activeChild: "게시판 관리",
  items: [
    {
      name: "시스템 운영 관리",
      children: [
        { name: "사용자 권한관리", path: "/views/com/PC-COM-2201" },
        { name: "메뉴관리", path: "/views/com/PC-COM-2203" },
        { name: "권한관리", path: "/views/com/PC-COM-2204" },
        { name: "코드관리", path: "/views/com/PC-COM-2206" },
      ],
    },
    // 하위가 없는 1뎁스는 그 자체가 링크다(시안에서도 +/- 표시가 없다)
    { name: "시스템 모니터링", path: "/views/com/PC-COM-2301" },
    {
      name: "홈페이지 관리",
      children: [
        { name: "게시판 관리", path: "/views/com/PC-COM-2401" },
        { name: "팝업 관리", path: "/views/com/PC-COM-2402" },
      ],
    },
    {
      name: "앱 관리",
      children: [{ name: "앱관리", path: "/views/com/PC-COM-2501" }],
    },
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

/** 탄력순찰 LNB */
export const flexiblePatrolMenu: SideMenuConfig = {
  title: "탄력순찰",
  activeChild: "요청관리",
  // 시안의 4개 항목 모두 하위가 없는 1뎁스라 항목 자체가 링크다
  items: [
    { name: "요청관리", path: "/views/flp/PM-FLP-0101" },
    { name: "범죄 안전 지도" },
    { name: "탄력순찰 이행현황" },
    { name: "탄력순찰 이행실적" },
  ],
};

/** 통계 LNB */
export const statisticsMenu: SideMenuConfig = {
  title: "통계",
  // 시안은 '사용이력통계'가 펼쳐진 상태다
  openIndex: 4,
  activeChild: "메뉴사용통계",
  items: [
    // 시안에서 앞 4개는 외부 시스템으로 나가는 ↗ 항목이다. 다만 SideMenu 는 href·↗ 를
    // 2뎁스에서만 처리하고 1뎁스는 <button> 으로 그려서, 여기 href 를 달면 눌러도 안 열린다.
    // 링크 주소도 아직 없어 지금은 라벨만 둔다(flexiblePatrolMenu 의 하위 없는 1뎁스와 같은 형태).
    { name: "112통계 바로가기" },
    { name: "기초통계" },
    { name: "근무현황" },
    { name: "바인더통계" },
    {
      name: "사용이력통계",
      children: [
        { name: "메뉴사용통계", path: "/views/stt/PC-STT-0401" },
        { name: "접속이력조회", path: "/views/stt/PC-STT-0402" },
        { name: "중요정보 변경이력 조회", path: "/views/stt/PC-STT-0403" },
      ],
    },
  ],
};

const PRESETS: Record<SideMenuPresetKey, SideMenuConfig> = {
  localPolice: localPoliceMenu,
  publicSafety: publicSafetyMenu,
  systemAdmin: systemAdminMenu,
  flexiblePatrol: flexiblePatrolMenu,
  menuTabSample: menuTabSampleMenu,
  statistics: statisticsMenu,
};

/** 등록되지 않은 키를 넘기면 undefined 를 돌려주고, 호출부에서 메뉴를 건드리지 않는다 */
export async function loadSideMenuPreset(
  key: string,
): Promise<SideMenuConfig | undefined> {
  return PRESETS[key as SideMenuPresetKey];
}
