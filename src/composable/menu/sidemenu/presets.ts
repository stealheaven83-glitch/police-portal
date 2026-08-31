import type { SideMenuConfig, SideMenuPresetKey } from './types'

/**
 * 화면마다 반복되는 사이드메뉴 구성을 키 하나로 부를 수 있게 모아둔 곳.
 * 나중에 메뉴를 서버에서 받아오게 되면 loadSideMenuPreset() 안이 API 호출 자리가 된다.
 * (그래서 동기 객체인 지금도 반환 타입을 Promise 로 잡아둔다)
 */

/** 지역경찰 업무 화면 기본 LNB. useSideMenuSetup 을 부르지 않은 화면이 쓰는 값이기도 하다 */
export const localPoliceMenu: SideMenuConfig = {
  title: '지역경찰',
  openIndex: 0,
  activeChild: '메모',
  items: [
    {
      name: '개인수첩',
      children: [
        { name: '메모', path: '/views/lpo/PM-LPO-0101' },
        { name: '근무일정 조회' },
        { name: '사고자/자원근무 신청' },
        { name: '출동수당' },
      ],
    },
    {
      name: '근무일지',
      children: [
        { name: '근무일지(甲)' },
        { name: '근무일지(乙)' },
        { name: '월간근무표' },
      ],
    },
    {
      name: '인수인계',
      children: [
        { name: '인수인계 작성' },
        { name: '차량점검' },
        { name: '인수인계 현황' },
      ],
    },
    {
      name: '출동수당',
      children: [
        { name: '출동수당 조회' },
        { name: '승인관리' },
      ],
    },
    { name: '관내현황', path: '/views/lpo/PC-LPO-0601' },
    { name: '개인장비', path: '/views/lpo/PC-LPO-0701' },
    { name: '인사관리', path: '/views/lpo/PC-LPO-0801' },
  ],
}

/** 생활안전 LNB */
export const publicSafetyMenu: SideMenuConfig = {
  title: '생활안전',
  openIndex: 0,
  activeChild: '간이 범죄예방진단',
  items: [
    {
      name: '범죄예방진단',
      children: [
        { name: '간이 범죄예방진단', path: '/views/pub/PM-PUB-0101' },
        { name: 'CPO 입력 · 관리' },
        { name: '참고사항' },
        { name: '우수시설인증' },
        // 외부 시스템이라 새 창으로 연다
        { name: 'Pre-CAS', href: 'https://www.police.go.kr' },
      ],
    },
    { name: '여성청소년', children: [{ name: '통합판단조사표' }, { name: '아동학대' }] },
    {
      name: '방범협력단체',
      children: [
        { name: '단체정보리스트', path: '/views/pub/PC-PUB-0301' },
        { name: '단체활동기록', path: '/views/pub/PM-PUB-0304' },
        { name: '단체현황', path: '/views/pub/PC-PUB-0306' },
        { name: '활동현황', path: '/views/pub/PC-PUB-0307' },
      ],
    },
    { name: '해바라기센터', children: [{ name: '센터현황' }] },
    { name: '보호조치 대응팀', children: [{ name: '대응팀 현황' }] },
    { name: '보고서', children: [{ name: '보고서 목록' }] },
  ],
}

/** 시스템 관리 LNB */
export const systemAdminMenu: SideMenuConfig = {
  title: '시스템 관리',
  // 시안은 '홈페이지 관리'가 펼쳐진 상태다
  openIndex: 2,
  activeChild: '게시판 관리',
  items: [
    {
      name: '시스템 운영 관리',
      children: [
        { name: '사용자 권한관리', path: '/views/com/PC-COM-2201' },
        { name: '메뉴관리', path: '/views/com/PC-COM-2203' },
        { name: '권한관리', path: '/views/com/PC-COM-2204' },
        { name: '코드관리' },
      ],
    },
    // 하위가 없는 1뎁스는 그 자체가 링크다(시안에서도 +/- 표시가 없다)
    { name: '시스템 모니터링', path: '/views/com/PC-COM-2301' },
    {
      name: '홈페이지 관리',
      children: [
        { name: '게시판 관리', path: '/views/com/PC-COM-2401' },
        { name: '팝업 관리', path: '/views/com/PC-COM-2402' },
      ],
    },
    { name: '앱 관리', children: [{ name: '앱관리', path: '/views/com/PC-COM-2501' }] },
  ],
}

/** 메뉴 · 탭 연동 확인용 샘플 (menu-tab-guide.md 3.2) */
export const menuTabSampleMenu: SideMenuConfig = {
  title: '지역경찰',
  openIndex: 0,
  activeChild: '장비관리',
  items: [
    {
      name: '메뉴 탭 샘플',
      children: [
        { name: '장비관리', path: '/views/lpo/PC-LPO-0701' },
        { name: '관내현황', path: '/views/lpo/PC-LPO-0601' },
      ],
    },
  ],
}

/** 탄력순찰 LNB */
export const flexiblePatrolMenu: SideMenuConfig = {
  title: '탄력순찰',
  activeChild: '요청관리',
  // 시안의 4개 항목 모두 하위가 없는 1뎁스라 항목 자체가 링크다
  items: [
    { name: '요청관리', path: '/views/flp/PM-FLP-0101' },
    { name: '범죄 안전 지도' },
    { name: '탄력순찰 이행현황' },
    { name: '탄력순찰 이행실적' },
  ],
}

const PRESETS: Record<SideMenuPresetKey, SideMenuConfig> = {
  localPolice: localPoliceMenu,
  publicSafety: publicSafetyMenu,
  systemAdmin: systemAdminMenu,
  flexiblePatrol: flexiblePatrolMenu,
  menuTabSample: menuTabSampleMenu,
}

/** 등록되지 않은 키를 넘기면 undefined 를 돌려주고, 호출부에서 메뉴를 건드리지 않는다 */
export async function loadSideMenuPreset(key: string): Promise<SideMenuConfig | undefined> {
  return PRESETS[key as SideMenuPresetKey]
}
