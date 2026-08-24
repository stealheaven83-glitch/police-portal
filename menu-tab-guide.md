# 메뉴 & 바텀 탭 (Menu & BottomTab) 연동 및 적용 가이드

본 가이드는 지역경찰 포털 시스템의 **사이드 메뉴(SideMenu)**, **하단 동적 탭(BottomTab)**, **업무 레이아웃(WorkLayout)** 및 **Vue KeepAlive 연동** 메커니즘 분석 내용과 신규 화면 적용 방법을 설명합니다.

---

## 1. 시스템 개요 및 아키텍처

전체 시스템은 **Layout 레벨의 동적 렌더링 및 캐싱**, **사이드 메뉴(LNB) 상태 관리**, **동적 바텀 탭 관리**가 상호 연동되어 동작합니다.

```mermaid
graph TD
    Router[Vue Router] --> Layout[Layout.vue]
    Layout -->|KeepAlive :include="cachedTabNames"| WorkLayout[WorkLayout.vue]
    WorkLayout -->|Left Slot| SideMenu[SideMenu.vue]
    WorkLayout -->|Main Slot| PageComponent[Page View Component]
    WorkLayout -->|Bottom Slot| BottomTab[BottomTab.vue]

    PageComponent -->|useSideMenuSetup| SideMenuStore[useSideMenuStore]
    PageComponent -->|useBottomTabSetup| BottomTabStore[useBottomTabStore]

    SideMenuStore -->|State| SideMenu
    BottomTabStore -->|State & cachedTabNames| BottomTab
    BottomTabStore -->|cachedTabNames| Layout
```

---

## 2. 레이아웃 구조 (`WorkLayout.vue` & `Layout.vue`)

### 2.1 [`Layout.vue`](file:///c:/workspace/police/20260823/police/src/components/layout/Layout.vue)
- 라우트 메타 정보(`route.meta.layout`)에 따라 `WorkLayout`, `MainLayout`, `DefaultLayout`, `PortalLayout`을 동적으로 전환합니다.
- `RouterView` 하위에 Vue [`KeepAlive`](file:///c:/workspace/police/20260823/police/src/components/layout/Layout.vue#L8)를 두고, [`useBottomTabStore.cachedTabNames`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts#L113)를 `:include` 속성으로 수신합니다.
- `:key="currentRoute.fullPath"`를 통해 라우트 경로 기반 탭 인스턴스를 보장합니다.

### 2.2 [`WorkLayout.vue`](file:///c:/workspace/police/20260823/police/src/components/layout/layouts/WorkLayout.vue)
- **독립 스크롤 구조**: 전체 껍데기(`.wrap`)의 높이를 `100vh` / `100dvh`로 고정(`overflow: hidden`)합니다. 문서 전체가 아닌 본문 래퍼(`div.overflow-y-auto`)와 사이드메뉴가 각자 독립 스크롤을 수행합니다.
- **고정 레이아웃**:
  - 좌측: [`SideMenu.vue`](file:///c:/workspace/police/20260823/police/src/components/custom/sidemenu/SideMenu.vue) ([`sideMenuStore.visible`](file:///c:/workspace/police/20260823/police/src/stores/menu/useSideMenu.ts#L18) 시 노출)
  - 중앙/본문: `#main` 슬롯
  - 하단: [`BottomTab.vue`](file:///c:/workspace/police/20260823/police/src/components/custom/bottom-tab/BottomTab.vue) ([`bottomTabStore.visible`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts#L14) 시 노출)

---

## 3. 사이드메뉴 시스템 (`SideMenu.vue`)

### 3.1 구성 컴포넌트 & 스토어
- **UI 컴포넌트**: [`SideMenu.vue`](file:///c:/workspace/police/20260823/police/src/components/custom/sidemenu/SideMenu.vue)
  - 1뎁스 아코디언 메뉴와 2뎁스 서브 메뉴 렌더링.
  - 메뉴 영역 자체 스크롤(`overflow-y: auto`, `scrollbar-gutter: stable`, `overscroll-behavior: contain`) 적용.
- **상태 관리**: [`useSideMenuStore`](file:///c:/workspace/police/20260823/police/src/stores/menu/useSideMenu.ts)
  - `visible`, `title`, `items`, `openIndex`, `activeChild`, `loading` 상태를 보관.
  - **소유권 관리 (`ownerId`, `claim()`, `release()`)**: 빠른 화면 전환이나 비동기 로딩 시 이전 화면과 다음 화면 간 상태 충돌(race condition)을 방지.

### 3.2 View 컴포넌트 적용 (`useSideMenuSetup`)
화면(View) 컴포넌트의 `setup` 영역에서 [`useSideMenuSetup`](file:///c:/workspace/police/20260823/police/src/composable/menu/useSideMenuSetup.ts)을 호출하여 해당 화면의 사이드메뉴를 등록합니다.

```typescript
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'

// 1) 등록된 메뉴 키로 지연 로딩 (예: 'menuTabSample', 'work' 등)
useSideMenuSetup('menuTabSample')

// 2) 인라인 Custom Config 설정
useSideMenuSetup({
  title: '지역경찰',
  openIndex: 0,
  activeChild: '장비관리',
  items: [
    {
      name: '메뉴 탭 샘플',
      children: [
        { name: '장비관리', path: '/sample/menu-tab-sample/submenu1' },
        { name: '관내현황', path: '/sample/menu-tab-sample/submenu2' }
      ]
    }
  ]
})

// 3) 사이드메뉴가 없는 화면인 경우
useSideMenuSetup(false)
```

---

## 4. 하단 동적 탭 시스템 (`BottomTab.vue`)

### 4.1 구성 컴포넌트 & 스토어
- **UI 컴포넌트**: [`BottomTab.vue`](file:///c:/workspace/police/20260823/police/src/components/custom/bottom-tab/BottomTab.vue)
  - 스토어의 탭 목록을 표시하고, 탭 클릭 전환(`router.push`) 및 탭 닫기(`closeTab`) 처리.
  - 키보드 접근성 지원 (`Enter`/`Space`로 선택, `Delete` 키로 탭 닫기).
- **상태 관리**: [`useBottomTabStore`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts)
  - 열린 탭 목록(`tabs`), 현재 활성 탭(`activeTab`), 최대 탭 개수 제한(`maxTabs`, 기본 10개) 제어.
  - `openTab()`, `closeTab()`, `closeOthers()`, `closeAll()` 등 탭 조작 메서드 제공.

### 4.2 View 컴포넌트 적용 (`useBottomTabSetup`)
화면 마운트 시점에 [`useBottomTabSetup`](file:///c:/workspace/police/20260823/police/src/composable/tab/useBottomTabSetup.ts)을 통해 바텀 탭 항목을 추가하고 활성화합니다.

```typescript
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-LPO-0701',                 // Unique Identifier (기본 컴포넌트 이름 매핑)
  label: '장비관리',                     // 탭 표시 명칭
  path: '/views/lpo/PC-LPO-0701',       // 클릭 시 이동할 라우트 경로
  componentName: 'PcLpo0701',           // KeepAlive 캐싱 대상 컴포넌트 이름 (필수)
  closable: true                        // 닫기 가능 여부 (기본값 true)
})

// 바텀 탭을 사용하지 않는 화면인 경우
useBottomTabSetup(false)
```

---

## 5. KeepAlive 상태 유지 & 연동 메커니즘

### 5.1 KeepAlive 동작 방식
1. [`useBottomTabStore`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts)는 등록된 탭 목록을 기반으로 [`cachedTabNames`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts#L113) (`computed<string[]>`)를 생성합니다.
   ```typescript
   const cachedTabNames = computed<string[]>(() => {
     return tabs.value
       .map(tab => tab.componentName || tab.value)
       .filter((name): name is string => Boolean(name))
   })
   ```
2. [`Layout.vue`](file:///c:/workspace/police/20260823/police/src/components/layout/Layout.vue)의 `<KeepAlive :include="bottomTabStore.cachedTabNames">`에 전달되어 해당 컴포넌트의 DOM과 Vue 인스턴스 상태가 메모리에 보존됩니다.

### 5.2 **[중요] View 컴포넌트 `name` 지정 필수 규칙**
Vue [`KeepAlive`](file:///c:/workspace/police/20260823/police/src/components/layout/Layout.vue#L8)가 정상적으로 캐싱 대상을 식별하려면 **View 컴포넌트의 `name`과 `BottomTabItem`의 `componentName`(또는 `value`)이 완벽히 일치**해야 합니다.

```vue
<script setup lang="ts">
import { defineOptions } from 'vue'

// KeepAlive 캐싱을 위한 컴포넌트 이름 선언 (BottomTabItem.componentName 과 일치)
defineOptions({
  name: 'PcLpo0701'
})
</script>
```

### 5.3 KeepAlive 탭 전환 시 사이드메뉴 자동 복원
- `KeepAlive`로 캐싱된 화면으로 다시 이동(재활성화)할 경우, `onMounted` 생명주기는 실행되지 않습니다.
- 이를 해결하기 위해 [`useSideMenuSetup`](file:///c:/workspace/police/20260823/police/src/composable/menu/useSideMenuSetup.ts#L36) 내부에서 [`onActivated`](file:///c:/workspace/police/20260823/police/src/composable/menu/useSideMenuSetup.ts#L36) 생명주기를 구독하여, 탭을 전환하더라도 해당 탭에 맞는 사이드메뉴 상태가 자동으로 복원됩니다.

### 5.4 탭 닫기 시 메모리 해제 (Eviction)
- 사용자가 하단 탭의 `닫기(X)` 버튼을 누르면 [`closeTab()`](file:///c:/workspace/police/20260823/police/src/stores/tab/useBottomTab.ts#L63)이 실행됩니다.
- 탭 배열에서 삭제됨에 따라 `cachedTabNames` 배열에서도 컴포넌트 이름이 자동 제거되며, Vue `KeepAlive`에 의해 해당 컴포넌트 인스턴스가 메모리에서 정상적으로 해제(unmount/destroy)됩니다.

---

## 6. 신규 화면 적용 가이드 (Step-by-Step)

### Step 1: Router 등록 ([`src/router/index.ts`](file:///c:/workspace/police/20260823/police/src/router/index.ts))
라우트 메타 정보에 `layout: 'WorkLayout'`을 지정합니다.

```typescript
{
  path: '/views/lpo/PC-LPO-0701',
  name: 'PcLpo0701',
  component: () => import('@/views/lpo/PC-LPO-0701.vue'),
  meta: {
    title: '장비관리',
    layout: 'WorkLayout'
  }
}
```

### Step 2: View 컴포넌트 작성 ([`PC-LPO-0701.vue`](file:///c:/workspace/police/20260823/police/src/views/lpo/PC-LPO-0701.vue))

```vue
<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">장비관리 화면</h1>
    <input v-model="searchText" type="text" placeholder="검색어 입력 (KeepAlive 상태 테스트)" class="border p-2 rounded" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// 1. KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PcLpo0701'
})

// 2. 입력 폼 상태 (KeepAlive 캐시 동작 확인용)
const searchText = ref('')

// 3. 사이드메뉴 설정 (미리 정의된 키 지정 또는 Custom Config)
useSideMenuSetup('menuTabSample')

// 4. 바텀 탭 설정 (현재 화면을 탭에 추가 및 활성화)
useBottomTabSetup({
  value: 'PC-LPO-0701',
  label: '장비관리',
  path: '/views/lpo/PC-LPO-0701',
  componentName: 'PcLpo0701',
  closable: true
})
</script>
```

---

## 7. 주요 APIs & Interfaces 참고

### `BottomTabItem` Interface ([`types.ts`](file:///c:/workspace/police/20260823/police/src/components/custom/bottom-tab/types.ts))
| 프로퍼티 | 타입 | 설명 |
| :--- | :--- | :--- |
| `value` | `string` | 탭의 고유 식별자 |
| `label` | `string` | 탭에 표시되는 명칭 |
| `path` | `string` (optional) | 탭 클릭 시 이동할 라우트 경로 |
| `componentName` | `string` (optional) | KeepAlive 캐싱 대상 컴포넌트 `name` |
| `closable` | `boolean` (optional) | 탭 닫기 버튼 표시 여부 (기본값 `true`) |
| `disabled` | `boolean` (optional) | 비활성화 여부 |
| `icon` | `Component` (optional) | 탭 아이콘 컴포넌트 |

### `SideMenuConfig` Interface ([`types.ts`](file:///c:/workspace/police/20260823/police/src/composable/menu/sidemenu/types.ts))
| 프로퍼티 | 타입 | 설명 |
| :--- | :--- | :--- |
| `title` | `string` (optional) | 사이드메뉴 최상단 타이틀 (기본값: '지역경찰') |
| `openIndex` | `number` (optional) | 기본으로 펼쳐둘 1뎁스 항목 인덱스 |
| `activeChild` | `string` (optional) | 기본 활성화 표시할 2뎁스 메뉴명 |
| `items` | `SideMenuItem[]` | 메뉴 목록 배열 |
