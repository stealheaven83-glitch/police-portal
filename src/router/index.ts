import { createRouter, createWebHistory } from 'vue-router'
import Error404 from '../views/error/error404.vue'
import { buildPlannedRoutes } from './plannedRoutes'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/samplework',
            name: 'samplework',
            component: () => import('../views/SampleWork.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '지역 경찰 포털',
            }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/Login.vue'),
        },
        {
            // 메모 화면군(0101 목록 · 0102 상세/수정 · 0104 등록)은 컴포넌트 하나가
            // useAutoTrigger 로 URL↔화면 상태를 동기화한다. screenGroup 이 같아야
            // Layout.vue 의 :key 가 안 바뀌어 화면 이동에도 리마운트되지 않는다.
            path: '/views/lpo/PM-LPO-0101',
            name: 'PM-LPO-0101',
            component: () => import('../views/lpo/PM-LPO-0101/PM-LPO-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '메모',
                screenGroup: 'PM-LPO-0101',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0102',
            name: 'PM-LPO-0102',
            component: () => import('../views/lpo/PM-LPO-0101/PM-LPO-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '메모 상세/수정',
                screenGroup: 'PM-LPO-0101',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0104',
            name: 'PM-LPO-0104',
            component: () => import('../views/lpo/PM-LPO-0101/PM-LPO-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '메모 등록',
                screenGroup: 'PM-LPO-0101',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0106',
            name: 'PM-LPO-0106',
            component: () => import('../views/lpo/PM-LPO-0106/PM-LPO-0106.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '알림',
                screenGroup: 'PM-LPO-0106',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0107',
            name: 'PM-LPO-0107',
            component: () => import('../views/lpo/PM-LPO-0106/PM-LPO-0106.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '알림 상세',
                screenGroup: 'PM-LPO-0106',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0701',
            name: 'PC-LPO-0701',
            component: () => import('../views/lpo/PC-LPO-0701/PC-LPO-0701.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '장비관리',
                // Layout.vue 가 <component :key="route.meta.screenGroup ?? route.fullPath">로 렌더링한다.
                // 이 화면군(0701~0714)은 전부 같은 컴포넌트가 useAutoTrigger 로 URL↔탭/팝업 상태를
                // 동기화하는데, key 가 화면ID마다 바뀌면 그때마다 리마운트되어 상태가 날아간다.
                // screenGroup 을 공통으로 줘서 이 화면군 안에서 이동할 땐 key 가 안 바뀌게 한다.
                screenGroup: 'PC-LPO-0701',
            }
        },
        ...([
            'PC-LPO-0702', 'PC-LPO-0703', 'PC-LPO-0704', 'PC-LPO-0705', 'PC-LPO-0706', 'PC-LPO-0707',
            'PC-LPO-0708', 'PC-LPO-0709', 'PC-LPO-0710', 'PC-LPO-0711', 'PC-LPO-0712', 'PC-LPO-0713', 'PC-LPO-0714',
        ] as const).map((name) => ({
            path: `/views/lpo/${name}`,
            name,
            component: () => import('../views/lpo/PC-LPO-0701/PC-LPO-0701.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '장비관리',
                screenGroup: 'PC-LPO-0701',
            }
        })),
        {
            path: '/views/lpo/PC-LPO-0801',
            name: 'PC-LPO-0801',
            component: () => import('../views/lpo/PC-LPO-0801/PC-LPO-0801.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '인사관리',
                screenGroup: 'PC-LPO-0801',
            }
        },
        {
            path: '/views/flp/PM-FLP-0101',
            name: 'PM-FLP-0101',
            component: () => import('../views/flp/PM-FLP-0101/PM-FLP-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '요청관리',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0202',
            name: 'PC-LPO-0202',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무지정표작성',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0215',
            name: 'PC-LPO-0215',
            component: () => import('../views/lpo/PC-LPO-0215/PC-LPO-0215.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사고자/자원근무자현황',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0301',
            name: 'PC-LPO-0301',
            component: () => import('../views/lpo/PC-LPO-0301/PC-LPO-0301.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '월별인수인계현황',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0501',
            name: 'PC-LPO-0501',
            component: () => import('../views/lpo/PC-LPO-0501/PC-LPO-0501.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동수당조회',
                // Layout.vue 가 <component :key="route.meta.screenGroup ?? route.fullPath">로 렌더링한다.
                // PC-LPO-0502(임의등록 팝업)가 같은 컴포넌트를 useAutoTrigger 로 공유하므로
                // screenGroup 을 공통으로 줘서 이동할 때 리마운트되지 않게 한다.
                screenGroup: 'PC-LPO-0501',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0502',
            name: 'PC-LPO-0502',
            component: () => import('../views/lpo/PC-LPO-0501/PC-LPO-0501.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동수당조회',
                screenGroup: 'PC-LPO-0501',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0505',
            name: 'PC-LPO-0505',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동수당취합(월별)',
                screenGroup: 'PC-LPO-0505',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0511',
            name: 'PC-LPO-0511',
            component: () => import('../views/lpo/PC-LPO-0511/PC-LPO-0511.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동수당취합(일별)',
            }
        },
        {
            path: '/views/com/PC-COM-2204',
            name: 'PC-COM-2204',
            component: () => import('../views/com/PC-COM-2204/PC-COM-2204.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '권한 관리',
                // PC-COM-2205(부서조회)/2207(전체 사용자)은 이 컴포넌트 안의 팝업이라 같은 파일을
                // 가리킨다 — screenGroup 을 공통으로 줘서 팝업 오픈/URL 동기화 시 리마운트되지
                // 않게 한다(PC-LPO-0701~0714, PM-COM-0101/0102 와 동일 패턴, Layout.vue 참고).
                screenGroup: 'PC-COM-2204',
            }
        },
        {
            // PC-COM-2204 와 같은 파일을 가리킨다 — useAutoTrigger 로 이 화면ID에 진입하면
            // "부서조회" 팝업이 바로 열린 상태로 보인다. 어느 권한 행에 대한 조회인지는 URL만으로
            // 알 수 없어(비대칭 팝업, docs/create/tab-popup.md §4 참고) 특정 행을 물지 않고 그냥 팝업만 연다 —
            // 퍼블리싱 검수 단계에서 화면ID 단위로 직접 열어볼 수 있게 하는 용도.
            path: '/views/com/PC-COM-2205',
            name: 'PC-COM-2205',
            component: () => import('../views/com/PC-COM-2204/PC-COM-2204.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '부서조회',
                screenGroup: 'PC-COM-2204',
            }
        },
        {
            // PC-COM-2204 와 같은 파일을 가리킨다 — "전체 사용자" 팝업만 독립적으로 연다
            // (실제로는 부서조회 팝업 안에서 여는 하위 팝업이지만, GenericDialog2 는 각자 open
            // prop 으로 따로 열리므로 부서조회를 같이 열 필요는 없다).
            path: '/views/com/PC-COM-2207',
            name: 'PC-COM-2207',
            component: () => import('../views/com/PC-COM-2204/PC-COM-2204.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '전체 사용자',
                screenGroup: 'PC-COM-2204',
            }
        },
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Main.vue'),
            meta: {
                layout: 'PortalLayout',
                title: '지역 경찰 포털'
            }
        },
        {
            path: '/lpo/notebook',
            name: 'lpo-notebook',
            component: () => import('../views/lpo/notebook/NotebookMain.vue'),
            meta: {
                layout: 'PortalLayout',
                title: '개인수첩'
            }
        },
        {
            path: '/component/pub-list',
            name: 'pub-list',
            component: () => import('../views/component-sample/PubList.vue'),
            meta: {
                layout: 'MainLayout',
                title: '퍼블 목록'
            }
        },
        {
            path: '/layout-sample',
            name: 'layout-sample',
            component: () => import('../views/layout-sample/LayoutSample.vue'),
            meta: {
                layout: 'MainLayout',
                title: '데이터 샘플'
            }
        },
        {
            path: '/single-layout',
            name: 'single-layout',
            component: () => import('../views/layout-sample/SingleLayout.vue'),
            meta: {
                layout: 'MainLayout',
                title: '싱글 레이아웃 샘플'
            }
        },
        {
            path: '/double-layout',
            name: 'double-layout',
            component: () => import('../views/layout-sample/DoubleLayout.vue'),
            meta: {
                layout: 'MainLayout',
                title: '더블 레이아웃 샘플'
            }
        },
        {
            path: '/component/table',
            name: 'tablewrapper',
            component: () => import('../components/ui/TableWrapper/Tablewrapper.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Tablewrapper'
            }
        },
        {
            path: '/component/autoform',
            name: 'autoform',
            component: () => import('../views/component-sample/Autoform.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Autoform'
            }
        },
        {
            path: '/component/dialog-select',
            name: 'dialog-select',
            component: () => import('../views/component-sample/DialogSelect.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Dialog & Select'
            }
        },
        {
            path: '/component/buttons',
            name: 'buttons',
            component: () => import('../views/component-sample/Buttons.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Buttons'
            }
        },
        {
            path: '/component/icons',
            name: 'icons',
            component: () => import('../views/component-sample/Icons.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Icons'
            }
        },
        {
            path: '/component/chart',
            name: 'chart',
            component: () => import('../views/component-sample/Chart.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Chart'
            }
        },
        {
            path: '/component/date-picker',
            name: 'date-picker',
            component: () => import('../views/component-sample/DatePicker.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Date Picker'
            }
        },
        {
            path: '/component/tabulator-grid',
            name: 'tabulator-grid',
            component: () => import('../views/component-sample/TabulatorGrid.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Tabulator Grid'
            }
        },
        {
            path: '/component/bottom-sheet',
            name: 'bottom-sheet',
            component: () => import('../views/component-sample/BottomSheet.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Bottom Sheet'
            }
        },
        {
            path: '/component/editor',
            name: 'editor',
            component: () => import('../views/component-sample/Editor.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Editor'
            }
        },
        {
            path: '/component/tree-view',
            name: 'tree-view',
            component: () => import('../views/component-sample/treeView.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'TreeView 가이드'
            }
        },
        {
            path: '/component/tree',
            name: 'tree',
            component: () => import('../views/component-sample/Tree.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Tree'
            }
        },
        {
            path: '/component/input',
            name: 'input',
            component: () => import('../views/component-sample/InputSample.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Text Input'
            }
        },
        {
            path: '/component/select',
            name: 'select',
            component: () => import('../views/component-sample/SelectSample.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Select'
            }
        },
        {
            path: '/component/checkbox',
            name: 'checkbox',
            component: () => import('../views/component-sample/Checkbox.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Checkbox'
            }
        },
        {
          path: '/component/radiogroup',
          name: 'Radio-group',
          component: () => import('../views/component-sample/RadioGroup.vue'),
            meta: {
              layout: 'MainLayout',
              title: 'Radio Group'
            }
          },
          {
              path: '/component/switch',
              name: 'switch',
              component: () => import('../views/component-sample/Switch.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Switch'
              }
          },
          {
              path: '/component/tabs',
              name: 'tabs',
              component: () => import('../views/component-sample/Tabs.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Tabs'
              }
          },
          {
              path: '/component/badge',
              name: 'badge',
              component: () => import('../views/component-sample/Badge.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Badge'
              }
          },
          {
              path: '/component/alert',
              name: 'alert',
              component: () => import('../views/component-sample/Alert.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Alert'
              }
          },
          {
              path: '/component/grid-title',
              name: 'grid-title',
              component: () => import('../views/component-sample/GridTitle.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Grid Title'
              }
          },
          {
              path: '/component/file-upload',
              name: 'file-upload',
              component: () => import('../views/component-sample/FileUpload.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'File Upload'
              }
          },
          {
              path: '/component/checklist-item',
              name: 'checklist-item',
              component: () => import('../views/component-sample/ChecklistItem.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Checklist Item'
              }
          },
          {
              path: '/component/accordion',
              name: 'custom-accordion',
              component: () => import('../views/component-sample/Accordion.vue'),
              meta: {
                  layout: 'MainLayout',
                  title: 'Accordion'
              }
          },
        {
            path: '/component/PageHeader',
            name: 'pageheader',
            component: () => import('../components/custom/title/Title.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Title'
            }
        },
        {
            path: '/component/tooltip',
            name: 'tooltip',
            component: () => import('../views/component-sample/TooltipSample.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Tooltip'
            }
        },
        {
            path: '/component/textarea',
            name: 'Textarea',
            component: () => import('../views/component-sample/TextareaSample.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Textarea'
            }
        },
        {
            path: '/component/icon',
            name: 'Icon',
            component: () => import('../views/component-sample/Icons.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Icon'
            }
        },
        {
            path: '/component/pagination',
            name: 'Pagination',
            component: () => import('../views/component-sample/Pagination.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Pagination'
            }
        },
        {
            path: '/component/calendar',
            name: 'calendar',
            component: () => import('../components/custom/calendar/calendar.vue'),
            meta: {
                layout: 'MainLayout',
                title: '캘린더'
            }
        },
        {
            path: '/component/layout-splite',
            name: 'layoutSplit',
            component: () => import('../components/custom/content-layout/layoutSplit.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'layoutSplit'
            }
        },
        /* LPO */
        /*
         * 근무지정표작성(PC-LPO-0202) 안의 팝업들 — 각자 화면ID 는 있지만 별도 화면이 없고
         * 같은 컴포넌트를 가리킨다. screenGroup 을 공통으로 줘서 이 화면군 안에서 이동할 때
         * Layout.vue 의 :key 가 안 바뀌게 한다(PC-LPO-0701~0714 와 동일 패턴).
         */
        {
            path: '/views/lpo/PC-LPO-0205',
            name: 'PC-LPO-0205',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '자원근무자 관리 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0206',
            name: 'PC-LPO-0206',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사고자 관리 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0207',
            name: 'PC-LPO-0207',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무관리 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0208',
            name: 'PC-LPO-0208',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '시간관리 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0209',
            name: 'PC-LPO-0209',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '순찰구역 관리',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0210',
            name: 'PC-LPO-0210',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '순찰구역 상세 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0211',
            name: 'PC-LPO-0211',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '甲지 일괄출력 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0212',
            name: 'PC-LPO-0212',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무 사용자 선택 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0213',
            name: 'PC-LPO-0213',
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '중점사항 입력 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        /*
         * 근무현황(PC-LPO-0216) 안의 신청 팝업.
         */
        {
            path: '/views/lpo/PC-LPO-0225',
            name: 'PC-LPO-0225',
            component: () => import('../views/lpo/PC-LPO-0216/PC-LPO-0216.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사고신청 팝업',
                screenGroup: 'PC-LPO-0216',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0226',
            name: 'PC-LPO-0226',
            component: () => import('../views/lpo/PC-LPO-0216/PC-LPO-0216.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '자원근무 신청 팝업',
                screenGroup: 'PC-LPO-0216',
            }
        },
        /*
         * 근무일지(乙) 등록(PM-LPO-0217) 안의 팝업들.
         */
        {
            path: '/views/lpo/PM-LPO-0219',
            name: 'PM-LPO-0219',
            component: () => import('../views/lpo/PM-LPO-0217/PM-LPO-0217.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '112누락정보 팝업',
                screenGroup: 'PM-LPO-0217',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0220',
            name: 'PM-LPO-0220',
            component: () => import('../views/lpo/PM-LPO-0217/PM-LPO-0217.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '112신고 내역 상세 팝업',
                screenGroup: 'PM-LPO-0217',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0221',
            name: 'PM-LPO-0221',
            component: () => import('../views/lpo/PM-LPO-0217/PM-LPO-0217.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '처리자 관리 팝업',
                screenGroup: 'PM-LPO-0217',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0222',
            name: 'PM-LPO-0222',
            component: () => import('../views/lpo/PM-LPO-0217/PM-LPO-0217.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '파일 업로드 팝업',
                screenGroup: 'PM-LPO-0217',
            }
        },
        /*
         * 출동수당 조회(PC-LPO-0501) 안의 팝업 — 0502(임의등록)는 이미 등록돼 있다.
         */
        {
            path: '/views/lpo/PC-LPO-0504',
            name: 'PC-LPO-0504',
            component: () => import('../views/lpo/PC-LPO-0501/PC-LPO-0501.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동사건상세 팝업',
                screenGroup: 'PC-LPO-0501',
            }
        },
        /*
         * 출동수당 취합(월별)(PC-LPO-0505) 안의 팝업들.
         */
        {
            path: '/views/lpo/PC-LPO-0506',
            name: 'PC-LPO-0506',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '승인관리 팝업',
                screenGroup: 'PC-LPO-0505',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0507',
            name: 'PC-LPO-0507',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사용자 찾기 팝업',
                screenGroup: 'PC-LPO-0505',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0508',
            name: 'PC-LPO-0508',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '승인취소관리 팝업',
                screenGroup: 'PC-LPO-0505',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0509',
            name: 'PC-LPO-0509',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '타직원 출동수당 신청 팝업',
                screenGroup: 'PC-LPO-0505',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0510',
            name: 'PC-LPO-0510',
            component: () => import('../views/lpo/PC-LPO-0505/PC-LPO-0505.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '출동사건정보 팝업',
                screenGroup: 'PC-LPO-0505',
            }
        },
        /*
         * 관내현황(PC-LPO-0601) 안의 팝업들.
         */
        {
            path: '/views/lpo/PC-LPO-0602',
            name: 'PC-LPO-0602',
            component: () => import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '순찰차별 상세구역 팝업',
                screenGroup: 'PC-LPO-0601',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0603',
            name: 'PC-LPO-0603',
            component: () => import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '행정동 검색 팝업',
                screenGroup: 'PC-LPO-0601',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0604',
            name: 'PC-LPO-0604',
            component: () => import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '순찰구역 상세 팝업',
                screenGroup: 'PC-LPO-0601',
            }
        },
        /*
         * 인사관리(PC-LPO-0801) 안의 팝업.
         */
        {
            path: '/views/lpo/PC-LPO-0802',
            name: 'PC-LPO-0802',
            component: () => import('../views/lpo/PC-LPO-0801/PC-LPO-0801.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '전/출입 부서찾기 팝업',
                screenGroup: 'PC-LPO-0801',
            }
        },
        /*
         * 화면군의 대표 화면 — 팝업 화면ID 들과 screenGroup 을 맞춰야 그 사이를 오갈 때
         * Layout.vue 의 :key 가 안 바뀐다. 그래서 plannedRoutes 대신 여기에 직접 적는다.
         */
        {
            path: '/views/lpo/PC-LPO-0601',
            name: 'PC-LPO-0601',
            component: () => import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '관내현황 상세내역',
                screenGroup: 'PC-LPO-0601',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0216',
            name: 'PC-LPO-0216',
            component: () => import('../views/lpo/PC-LPO-0216/PC-LPO-0216.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무현황',
                screenGroup: 'PC-LPO-0216',
            }
        },
        {
            path: '/views/lpo/PM-LPO-0217',
            name: 'PM-LPO-0217',
            component: () => import('../views/lpo/PM-LPO-0217/PM-LPO-0217.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무일지(乙)등록',
                screenGroup: 'PM-LPO-0217',
            }
        },
        {
            path: '/views/lpo/PC-LPO-0204',
            name: 'PC-LPO-0204',
            // 근무자 추가관리 팝업(PC-LPO-0204)은 아직 별도 화면이 없고, PC-LPO-0202(근무지정표작성)
            // 안의 팝업으로만 존재한다. PC-LPO-0701~0714 가 한 컴포넌트를 여러 화면ID 라우트로
            // 공유하는 것과 같은 방식으로, 이 라우트도 PC-LPO-0202.vue 를 그대로 가리킨다.
            component: () => import('../views/lpo/PC-LPO-0202/PC-LPO-0202.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '근무자 추가관리 팝업',
                screenGroup: 'PC-LPO-0202',
            }
        },
        {
            path: '/views/com/PM-COM-0101',
            name: 'PM-COM-0101',
            component: () => import('../views/com/PM-COM-0101/PM-COM-0101.vue'),
            meta: {
                layout: 'DefaultLayout',
                title: '로그인',
                // PM-COM-0101(로그인) ↔ PM-COM-0102(공인인증서 등록 팝업) 은 같은 컴포넌트라
                // screenGroup 을 공통으로 줘서 팝업 오픈/URL 동기화 시 리마운트되지 않게 한다.
                // (PC-LPO-0701~0714 와 동일 패턴, Layout.vue 참고)
                screenGroup: 'PM-COM-0101',
            }
        },
        {
            // PM-COM-0101 과 같은 파일을 가리킨다 — useAutoTrigger 로 이 화면ID에 진입하면
            // "공인인증서 등록" 팝업이 바로 열린 상태로 보인다.
            path: '/views/com/PM-COM-0102',
            name: 'PM-COM-0102',
            component: () => import('../views/com/PM-COM-0101/PM-COM-0101.vue'),
            meta: {
                layout: 'DefaultLayout',
                title: '공인인증서 등록',
                screenGroup: 'PM-COM-0101',
            }
        },
        {
            path: '/views/com/PC-COM-2203',
            name: 'PC-COM-2203',
            component: () => import('../views/com/PC-COM-2203/PC-COM-2203.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '메뉴 관리'
            }
        },
        {
            path: '/views/com/PC-COM-2201',
            name: 'PC-COM-2201',
            component: () => import('../views/com/PC-COM-2201/PC-COM-2201.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사용자 권한관리',
                // PC-COM-2202(사용자정보 팝업)는 이 컴포넌트 안의 팝업이라 같은 파일을 가리킨다 —
                // screenGroup 을 공통으로 줘서 두 화면ID 사이를 오갈 때 리마운트되지 않게 한다
                // (PC-COM-2204/2205/2207 과 동일 패턴, Layout.vue 참고).
                screenGroup: 'PC-COM-2201',
            }
        },
        {
            // PC-COM-2201 과 같은 파일을 가리킨다 — 사용자정보 팝업(PC-COM-2202)은 사용자목록에서
            // 아이디를 눌러야 그 행 값으로 채워지는 비대칭 팝업이라(docs/create/tab-popup.md §4) URL 만으로는 열지
            // 않는다. 이 경로로 들어오면 사용자 권한관리 목록이 뜨고, 아이디를 누르면 팝업이 열린다.
            path: '/views/com/PC-COM-2202',
            name: 'PC-COM-2202',
            component: () => import('../views/com/PC-COM-2201/PC-COM-2201.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사용자 정보',
                screenGroup: 'PC-COM-2201',
            }
        },
        {
            path: '/views/com/PC-COM-2206',
            name: 'PC-COM-2206',
            component: () => import('../views/com/PC-COM-2206/PC-COM-2206.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '코드 관리'
            }
        },
        {
            path: '/views/com/PC-COM-2301',
            name: 'PC-COM-2301',
            component: () => import('../views/com/PC-COM-2301/PC-COM-2301.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '시스템모니터링 관리'
            }
        },
        {
            path: '/views/com/PC-COM-2402',
            name: 'PC-COM-2402',
            component: () => import('../views/com/PC-COM-2402/PC-COM-2402.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '팝업공지 관리'
            }
        },
        {
            path: '/views/com/PC-COM-2401',
            name: 'PC-COM-2401',
            component: () => import('../views/com/PC-COM-2401/PC-COM-2401.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '게시판 관리'
            }
        },
        {
            path: '/views/com/PC-COM-2501',
            name: 'PC-COM-2501',
            component: () => import('../views/com/PC-COM-2501/PC-COM-2501.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '앱관리'
            }
        },
        {
            path: '/views/com/PM-COM-1001',
            name: 'PM-COM-1001',
            component: () => import('../views/com/PM-COM-1001/PM-COM-1001.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '공지사항'
            }
        },
        {
            path: '/views/pub/PM-PUB-0101',
            name: 'PM-PUB-0101',
            component: () => import('../views/pub/PM-PUB-0101/PM-PUB-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '간이 범죄예방진단'
            }
        },
        {
            path: '/views/pub/PM-PUB-0103',
            name: 'PM-PUB-0103',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: {
                layout: 'WorkLayout',
                title: 'CPO 입력 · 관리',
                // Layout.vue 가 <component :key="route.meta.screenGroup ?? route.fullPath">로 렌더링한다.
                // 0103(목록)과 0104~0115 관련 팝업은 같은 컴포넌트가 useAutoTrigger 로 URL↔팝업 상태를
                // 동기화하는데, key 가 화면ID마다 바뀌면 이동할 때마다 KeepAlive 가 비활성/재활성되어
                // 팝업 닫기가 중간에 끊긴다. screenGroup 을 공통으로 줘서 key 가 안 바뀌게 한다
                // (PC-LPO-0701·PC-COM-2204·PM-COM-0101 과 동일 패턴).
                screenGroup: 'PM-PUB-0103',
            }
         },
        {
            path: '/views/pub/PM-PUB-0104',
            alias: '/views/pub/PC-PUB-0104',
            name: 'PM-PUB-0104',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '범죄예방진단결과 (보관용)', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0105',
            alias: '/views/pub/PC-PUB-0105',
            name: 'PM-PUB-0105',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '범죄예방진단결과 (CPO확인용)', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0106',
            name: 'PM-PUB-0106',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '범죄예방진단 이력 신규', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0107',
            name: 'PM-PUB-0107',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '범죄예방진단 상세', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0108',
            name: 'PM-PUB-0108',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '사진자료', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0109',
            name: 'PM-PUB-0109',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '간이진단통보자료', screenGroup: 'PM-PUB-0103' }
        },
        {
            path: '/views/pub/PM-PUB-0110',
            name: 'PM-PUB-0110',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '범죄예방진단 이력보기', screenGroup: 'PM-PUB-0103' }
        },
        {
            // PM-PUB-0103 과 같은 파일을 가리킨다 — useAutoTrigger 로 이 화면ID에 진입하면
            // "범죄예방진단 현황 신규" 팝업이 바로 열린 상태로 보인다(PC-LPO-0701/0702 와 동일 패턴).
            path: '/views/pub/PM-PUB-0114',
            name: 'PM-PUB-0114',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '범죄예방진단 현황 신규',
                screenGroup: 'PM-PUB-0103',
            }
        },
        {
            path: '/views/pub/PC-PUB-0301',
            name: 'PC-PUB-0301',
            component: () => import('../views/pub/PC-PUB-0301/PC-PUB-0301.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '단체정보리스트'
            }
        },
        {
            path: '/views/pub/PC-PUB-0302',
            name: 'PC-PUB-0302',
            component: () => import('../views/pub/PC-PUB-0302/PC-PUB-0302.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '단체정보상세'
            }
        },
        {
            path: '/views/pub/PC-PUB-0303',
            name: 'PC-PUB-0303',
            component: () => import('../views/pub/PC-PUB-0303/PC-PUB-0303.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '단체정보등록'
            }
        },
        {
            path: '/views/pub/PM-PUB-0304',
            name: 'PM-PUB-0304',
            component: () => import('../views/pub/PM-PUB-0304/PM-PUB-0304.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '단체활동기록'
            }
        },
        {
            path: '/views/pub/PC-PUB-0306',
            name: 'PC-PUB-0306',
            component: () => import('../views/pub/PC-PUB-0306/PC-PUB-0306.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '단체현황'
            }
        },
        {
            path: '/views/pub/PC-PUB-0307',
            name: 'PC-PUB-0307',
            component: () => import('../views/pub/PC-PUB-0307/PC-PUB-0307.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '활동현황'
            }
        },
        {
            path: '/views/pub/PM-PUB-0115',
            name: 'PM-PUB-0115',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: { layout: 'WorkLayout', title: '진단통보(우편 발송)', screenGroup: 'PM-PUB-0103' }
        },
        {
            // 기획서(주취자.pptx)에는 화면ID가 PC-PUB-0409 로 적혀 있으나 screen-id-map.md 기준은 PM-PUB-0409.
            path: '/views/pub/PM-PUB-0409',
            alias: '/views/pub/PC-PUB-0409',
            name: 'PM-PUB-0409',
            component: () => import('../views/pub/PM-PUB-0409/PM-PUB-0409.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '주취자 센터 병상 현황'
            }
        },
        {
            path: '/views/pub/PM-PUB-0411',
            name: 'PM-PUB-0411',
            component: () => import('../views/pub/PM-PUB-0411/PM-PUB-0411.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '주취자 센터관리'
            }
        },
        {
            // 목록 화면(PM-PUB-0411)의 '등록' 버튼으로 들어간다 — LNB 항목은 따로 없다.
            path: '/views/pub/PC-PUB-0412',
            name: 'PC-PUB-0412',
            component: () => import('../views/pub/PC-PUB-0412/PC-PUB-0412.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '주취자센터 등록'
            }
        },
        {
            path: '/views/pub/PC-PUB-0413',
            name: 'PC-PUB-0413',
            component: () => import('../views/pub/PC-PUB-0413/PC-PUB-0413.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '주취자 입퇴소 현황'
            }
        },
        {
            path: '/views/pub/PM-PUB-0414',
            name: 'PM-PUB-0414',
            component: () => import('../views/pub/PM-PUB-0414/PM-PUB-0414.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '정신응급대응팀'
            }
        },
        {
            // 목록 화면(PM-PUB-0414)의 '신규' 버튼으로 들어간다 — LNB 항목은 따로 없다.
            path: '/views/pub/PC-PUB-0415',
            name: 'PC-PUB-0415',
            component: () => import('../views/pub/PC-PUB-0415/PC-PUB-0415.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '정신응급대응팀 등록'
            }
        },
        /*
         * 아래 넷은 화면군이다 — 한 컴포넌트가 여러 화면ID를 가진다(docs/create/tab-popup.md §1).
         * screenGroup 을 공통으로 주지 않으면 Layout.vue 의 :key 때문에 이동할 때마다 리마운트된다.
         * plannedRoutes 는 여기 적힌 name 을 taken 으로 걸러 중복 등록하지 않는다.
         */

        /* (구) 자료조회 — 가정폭력 / 아동학대 / 스토킹 탭 */
        {
            path: '/views/pub/PC-PUB-0208',
            name: 'PC-PUB-0208',
            component: () => import('../views/pub/PC-PUB-0208/PC-PUB-0208.vue'),
            meta: { layout: 'WorkLayout', title: '(구) 자료조회 - 가정폭력', screenGroup: 'PC-PUB-0208' }
        },
        {
            path: '/views/pub/PC-PUB-0209',
            name: 'PC-PUB-0209',
            component: () => import('../views/pub/PC-PUB-0208/PC-PUB-0208.vue'),
            meta: { layout: 'WorkLayout', title: '(구) 자료조회 - 아동학대', screenGroup: 'PC-PUB-0208' }
        },
        {
            path: '/views/pub/PC-PUB-0210',
            name: 'PC-PUB-0210',
            component: () => import('../views/pub/PC-PUB-0208/PC-PUB-0208.vue'),
            meta: { layout: 'WorkLayout', title: '(구) 자료조회 - 스토킹', screenGroup: 'PC-PUB-0208' }
        },

        /* 해바라기센터 관리 — 상세 · 등록은 목록 위에 뜨는 팝업이다 */
        {
            path: '/views/pub/PM-PUB-0401',
            name: 'PM-PUB-0401',
            component: () => import('../views/pub/PM-PUB-0401/PM-PUB-0401.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 관리', screenGroup: 'PM-PUB-0401' }
        },
        {
            path: '/views/pub/PC-PUB-0402',
            name: 'PC-PUB-0402',
            component: () => import('../views/pub/PM-PUB-0401/PM-PUB-0401.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 상세', screenGroup: 'PM-PUB-0401' }
        },
        {
            path: '/views/pub/PC-PUB-0403',
            name: 'PC-PUB-0403',
            component: () => import('../views/pub/PM-PUB-0401/PM-PUB-0401.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 등록', screenGroup: 'PM-PUB-0401' }
        },

        /* 해바라기센터 사용자 — 사용자 상세 · 등록도 팝업이다 */
        {
            path: '/views/pub/PM-PUB-0404',
            name: 'PM-PUB-0404',
            component: () => import('../views/pub/PM-PUB-0404/PM-PUB-0404.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 사용자', screenGroup: 'PM-PUB-0404' }
        },
        {
            path: '/views/pub/PC-PUB-0417',
            name: 'PC-PUB-0417',
            component: () => import('../views/pub/PM-PUB-0404/PM-PUB-0404.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 사용자 상세/수정', screenGroup: 'PM-PUB-0404' }
        },
        {
            path: '/views/pub/PC-PUB-0418',
            name: 'PC-PUB-0418',
            component: () => import('../views/pub/PM-PUB-0404/PM-PUB-0404.vue'),
            meta: { layout: 'WorkLayout', title: '해바라기센터 사용자 등록', screenGroup: 'PM-PUB-0404' }
        },

        /* 조사예약 — 월간/주간은 달력 안의 토글이고, 상세 · 등록은 팝업이다 */
        {
            path: '/views/pub/PM-PUB-0405',
            name: 'PM-PUB-0405',
            component: () => import('../views/pub/PM-PUB-0405/PM-PUB-0405.vue'),
            meta: { layout: 'WorkLayout', title: '조사예약 목록(월별)', screenGroup: 'PM-PUB-0405' }
        },
        {
            path: '/views/pub/PC-PUB-0406',
            name: 'PC-PUB-0406',
            component: () => import('../views/pub/PM-PUB-0405/PM-PUB-0405.vue'),
            meta: { layout: 'WorkLayout', title: '조사예약 목록(주간별)', screenGroup: 'PM-PUB-0405' }
        },
        {
            path: '/views/pub/PC-PUB-0407',
            name: 'PC-PUB-0407',
            component: () => import('../views/pub/PM-PUB-0405/PM-PUB-0405.vue'),
            meta: { layout: 'WorkLayout', title: '조사예약 상세', screenGroup: 'PM-PUB-0405' }
        },
        {
            path: '/views/pub/PC-PUB-0408',
            name: 'PC-PUB-0408',
            component: () => import('../views/pub/PM-PUB-0405/PM-PUB-0405.vue'),
            meta: { layout: 'WorkLayout', title: '조사예약 등록', screenGroup: 'PM-PUB-0405' }
        },

        {
            path: '/views/stt/PC-STT-0103',
            name: 'PC-STT-0103',
            component: () => import('../views/stt/PC-STT-0103/PC-STT-0103.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '인사관리'
            }
        },
        {
            path: '/worklist',
            name: 'worklist',
            component: () => import('../views/worklist/WorkIndex.vue'),
            meta: {
                layout: '',
                title: '인사관리'
            }
        },
        {
            path: '/infoTable',
            name: 'info-table',
            component: () => import('../views/component-sample/info-table.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Info Table'
            }
        },
        {
            path: '/treeView',
            name: 'treeView',
            component: () => import('../views/component-sample/treeView.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Info Table'
            }
        },
        {
            path: '/component/flex-grid',
            name: 'flex-grid',
            component: () => import('../views/component-sample/flex-grid.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Flex Grid'
            }
        },
        {
            path: '/component/filter-chip',
            name: 'filter-chip',
            component: () => import('../views/component-sample/FilterChip.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Filter Chip'
            }
        },
        {
            path: '/component/new-components',
            name: 'newComponents',
            component: () => import('../views/component-sample/NewComponents.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Figma 신규 컴포넌트'
            }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notFound',
            component: Error404
        },
    ]
})

/**
 * 아직 안 만든 화면까지 미리 등록한다(views/worklist 의 화면ID 목록 기준).
 *
 * 위 배열을 건드리지 않고 addRoute 로 붙이는 이유: 이 파일은 셋이 동시에 고쳐 충돌이 잦아서
 * diff 를 최소로 두려는 것이다. vue-router 4 는 등록 순서가 아니라 경로 점수로 매칭하므로
 * 나중에 붙여도 위의 notFound(catch-all)보다 구체적인 경로가 항상 먼저 잡힌다.
 *
 * 이미 등록된 화면ID(위 배열)는 buildPlannedRoutes 가 건너뛴다 — 규약을 벗어나는 화면(화면군·
 * 다른 layout·다른 path)만 위 배열에 직접 적고, 나머지 화면은 전부 plannedRoutes 가 맡는다.
 */
const registeredNames = new Set(
    router.getRoutes().map((r) => r.name).filter(Boolean) as string[],
)
buildPlannedRoutes(registeredNames).forEach((route) => router.addRoute(route))

export default router
