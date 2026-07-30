import { ref } from 'vue'
import { defineStore } from 'pinia'

interface MenuAuth {
  menuCd: string;
}

interface User {
  adminNm: string;
  adminEmail?: string;
  adminRole?: string;
}

export const useAuthStore = defineStore(
  'useAuth',
  () => {
    const user = ref<User | null>(null)
    const menuAuthInfo = ref<MenuAuth[]>([])
    const deviceInfo = ref(null)
    const accessToken = ref('')
    const refreshToken = ref('')

    /** 토큰 저장 */
    function setTokens(_access: string, _refresh: string) {
      accessToken.value = _access
      refreshToken.value = _refresh
    }

    function setUserInfo(_user: any) {
      user.value = _user
    }

    function setDeviceInfo(_deviceInfo: any) {
      deviceInfo.value = _deviceInfo
    }

    /** 로그아웃 처리 */
    function logout() {
      user.value = null
      menuAuthInfo.value = []
      deviceInfo.value = null
      accessToken.value = ''
      refreshToken.value = ''
      sessionStorage.clear()
      window.location.href = '/login'
    }

    /** 사용자 메뉴 권한 체크 */
    function isAuthMenuCheck(menuCd: string) {
      return menuAuthInfo.value?.find((menuAuth: { menuCd: string }) => menuAuth.menuCd === menuCd);
    }

    /** 리프레시 토큰 조회 */
    function getRefreshToken() {
      return refreshToken.value
    }

    return {
      user,
      menuAuthInfo,
      accessToken,
      refreshToken,
      deviceInfo,
      setTokens,
      setUserInfo,
      setDeviceInfo,
      isAuthMenuCheck,
      logout,
      getRefreshToken,
    }
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
)

export default useAuthStore