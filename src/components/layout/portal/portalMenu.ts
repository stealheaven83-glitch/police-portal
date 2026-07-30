/**
 * 지역경찰포털 전체메뉴(GNB) 데이터.
 * 퍼블리싱 원본 html/index.html 의 .main-menu 마크업을 데이터로 옮긴 것.
 */

export interface PortalMenuDepth3 {
  title: string
  path?: string
}

export interface PortalMenuDepth2 {
  title: string
  path?: string
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

/** 원본 마크업에서 depth2/depth3 구성이 모든 depth1 에 동일하게 반복되어 있어 공통으로 뽑아둔다. */
const commonDepth2: PortalMenuDepth2[] = [
  {
    title: '개인수첩',
    groupTitle: '인수인계',
    children: [
      { title: '인수인계 작성' },
      { title: '인수인계 현황' },
      { title: '차량점검' },
    ],
  },
]

export const portalMenu: PortalMenuDepth1[] = [
  { title: '지역경찰', groupTitle: '지역경찰', children: commonDepth2 },
  { title: '생활안전', children: commonDepth2 },
  { title: '탄력순찰', children: commonDepth2 },
  { title: '사건대응 시나리오', children: commonDepth2 },
]

/** 헤더 우측 마이페이지 영역 */
export const portalMyInfo = {
  name: '홍길동',
  position: '경위',
  thumbnail: '/portal/asset/images/img/img_myPage.jpg',
  path: '',
}
