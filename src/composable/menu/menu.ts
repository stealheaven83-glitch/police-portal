// 필요한 Vue 컴포넌트와 아이콘들을 임포트
import type { Component } from 'vue';
import {
  HomeIcon,
  LayoutDashboardIcon,
  //UsersIcon,
  //SettingsIcon,
  //ShieldIcon,
  MenuIcon,
  FileTextIcon,
  ComponentIcon,
  //MessageSquareIcon,
  //LockIcon,
  TableIcon,
  FormIcon,
  Layers2,
  Square,
  MousePointer2Icon,
  SmileIcon,
  BarChart3Icon,
  CalendarIcon,
  PanelBottomIcon,
  PenSquareIcon,
  FolderTreeIcon,
  TextCursorInputIcon,
  MessageCircleQuestionIcon,
  Check,
  CircleDot,
  ToggleLeft,
  Heading,
  PanelTop
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth/useAuth';
import { toast } from 'vue-sonner';

// 메뉴 아이템의 구조를 정의하는 인터페이스
export interface MenuItem {
  path?: string; // 메뉴 아이템의 라우팅 경로 (optional for parent items)
  title: string; // 메뉴 아이템에 표시될 제목
  icon: Component; // 메뉴 아이템에 표시될 아이콘 컴포넌트
  children?: MenuItem[]; // 하위 메뉴 아이템 목록
  menuCode?: string; // 메뉴 코드
}

// 레이아웃 설정을 정의하는 인터페이스
export interface UserInfo {
  name: string;
  email?: string;
  role?: string;
  logout: () => void;
  viewProfile: () => void;
}

export interface LayoutConfig {
  headerTitle: string; // 헤더에 표시될 제목
  menuItems: MenuItem[]; // 메뉴 아이템 목록
  userInfo?: UserInfo; // 사용자 정보
}

// 메인 레이아웃의 설정값을 정의
export const mainLayoutConfig: LayoutConfig = {
  headerTitle: 'vue starter 샘플',
  menuItems: [
    {
      path: '/sample',
      title: '홈',
      icon: HomeIcon,
    },
    {
      title: '샘플 레이아웃',
      icon: LayoutDashboardIcon,
      children: [
        {
          path: '/single-layout',
          title: '싱글 레이아웃 샘플',
          icon: Square,
        },
        {
          path: '/double-layout',
          title: '더블 레이아웃 샘플',
          icon: Layers2,
        },
        {
          path: '/layout-sample',
          title: '데이터 샘플',
          icon: FileTextIcon,
        },
      ]
    },
    {
      title: '샘플 컴포넌트',
      icon: MenuIcon,
      children: [
        {
          path: '/component/table',
          title: 'TableWrapper',
          icon: TableIcon,
        },
        {
          path: '/component/autoform',
          title: 'Autoform',
          icon: FormIcon,
        },
        {
          path: '/component/dialog-select',
          title: 'Dialog & Select',
          icon: ComponentIcon,
        },
        {
          path: '/component/buttons',
          title: 'Buttons',
          icon: MousePointer2Icon,
        },
        {
          path: '/component/icons',
          title: 'Icons',
          icon: SmileIcon,
        },
        {
          path: '/component/chart',
          title: 'Chart',
          icon: BarChart3Icon,
        },
        {
          path: '/component/date-picker',
          title: 'Date Picker',
          icon: CalendarIcon,
        },
        {
          path: '/component/tabulator',
          title: 'Tabulator Grid',
          icon: TableIcon,
        },
        {
          path: '/component/bottom-sheet',
          title: 'Bottom Sheet',
          icon: PanelBottomIcon,
        },
        {
          path: '/component/editor',
          title: 'Editor',
          icon: PenSquareIcon,
        },
        {
          path: '/component/tree',
          title: 'Tree',
          icon: FolderTreeIcon,
        },
        {
          path: '/component/input',
          title: 'Text Input',
          icon: TextCursorInputIcon,
        },
        {
          path: '/component/checkbox',
          title: 'Checkbox',
          icon: Check,
        },
        {
          path: '/component/radiogroup',
          title: 'Radio Group',
          icon: CircleDot,
        },
        {
          path: '/component/switch',
          title: 'Switch',
          icon: ToggleLeft,
        },
        {
          path: '/component/tabs',
          title: 'Tabs',
          icon: PanelTop,
        },
        {
          path: '/component/tooltip',
          title: 'Tooltip',
          icon: MessageCircleQuestionIcon,
        },
        {
          path: '/component/PageHeader',
          title: 'Title',
          icon: Heading,
        },
        {
          path: '/component/pagination',
          title: 'Pagination',
          icon: MessageCircleQuestionIcon,
        },
      ]
    }
  ],
};

export const getMenuConfig = () => {
  //사용하는 사용자 정보에 맞게 설정
  const authStore = useAuthStore();
  const userInfo = authStore.user
    ? {
      name: authStore.user.adminNm,
      email: authStore.user.adminEmail,
      role: authStore.user.adminRole,
      logout: () => {
        toast('로그아웃', { description: '로그아웃 되었습니다.' })
      },
      viewProfile: () => {
        // 프로필 페이지로 이동하는 로직
        toast('프로필', { description: '프로필 페이지로 이동합니다.' })
      },
    }
    : undefined;

  mainLayoutConfig.userInfo = userInfo || undefined;
  return mainLayoutConfig;
};
