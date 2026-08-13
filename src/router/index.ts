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
            path: '/lpo/personnel-management',
            name: 'lpo-personnel-management',
            component: () => import('../views/PersonnelManagement.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '인사관리',
            }
        },
        {
            path: '/lpo/jurisdiction-status',
            name: 'lpo-jurisdiction-status',
            component: () => import('../views/JurisdictionStatus.vue'),
            meta: {
                layout: 'WorkLayout',
                title: '관내현황',
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
        // {
        //     path: '/sample',
        //     name: 'sample-home',
        //     component: () => import('../views/SampleHome.vue'),
        //     meta: {
        //         layout: 'MainLayout',
        //         title: '홈 (Scaffolding)'
        //     }
        // },
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
            component: () => import('../components/custom/date-picker/DatePicker.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Date Picker'
            }
        },
        {
            path: '/component/tabulator',
            name: 'tabulator',
            component: () => import('../components/custom/Tabulator/Tabulator.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'Tabulator'
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
            path: '/component/layout-splite',
            name: 'layoutSplit',
            component: () => import('../components/custom/content-layout/layoutSplit.vue'),
            meta: {
                layout: 'MainLayout',
                title: 'layoutSplit'
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