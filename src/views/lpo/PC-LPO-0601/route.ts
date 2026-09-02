import type { RouteRecordRaw } from 'vue-router'

/**
 * PC-LPO-0601 관내현황.
 *
 * router/index.ts 가 `views/**\/route.ts` 를 자동 수집한다 — 이 파일만 만들면 등록이 끝난다.
 * 화면군(한 컴포넌트가 여러 화면ID)이면 배열을 default export 하면 된다.
 */
const route: RouteRecordRaw = {
  path: '/views/lpo/PC-LPO-0601',
  name: 'PC-LPO-0601',
  component: () => import('./PC-LPO-0601.vue'),
  meta: {
    layout: 'WorkLayout',
    title: '관내현황',
  },
}

export default route
