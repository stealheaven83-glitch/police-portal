import { createRouter, createWebHistory } from 'vue-router'
import Error404 from '../views/error/error404.vue'

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
            path: '/views/lpo/PM-LPO-0101',
            name: 'PM-LPO-0101',
            component: () => import('../views/lpo/PM-LPO-0101/PM-LPO-0101.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '메모',
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
            }
        },
        {
            path: '/views/lpo/PC-LPO-0601',
            name: 'PC-LPO-0601',
            component: () => import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '관내현황',
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
        {
            path: '/views/lpo/PC-LPO-0204',
            name: 'PC-LPO-0204',
            component: () => import('../views/lpo/PC-LPO-0204/PC-LPO-0204.vue'),
            meta: {
                layout: 'MainLayout',
                title: '근무자 추가관리 팝업'
            }
        },
        {
            path: '/views/com/PC-COM-2201',
            name: 'PC-COM-2201',
            component: () => import('../views/com/PC-COM-2201/PC-COM-2201.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '사용자 권한관리'
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
            name: 'PM-PUB-0101',
            component: () => import('../views/pub/PM-PUB-0103/PM-PUB-0103.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '간이 범죄예방진단'
            }
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
            path: '/:pathMatch(.*)*',
            name: 'notFound',
            component: Error404
        },
    ]
})

export default router