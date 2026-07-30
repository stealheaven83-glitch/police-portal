import axios from 'axios'
import type { AxiosPromise } from 'axios'
import { useAuthStore } from '@/stores/auth/useAuth'
// import { useLoadingStore } from '@/stores/page/useLoadingStore'

/**
 * Axios HTTP 클라이언트 래퍼
 * API 요청을 처리하고 인증 토큰 관리를 담당하는 유틸리티 모듈
 */
const serviceAxios = {
  /**
   * Axios 요청을 처리하는 공통 프로세스
   * @param axiosFunc - 실행할 Axios Promise 함수
   * @param isLoading - 로딩 상태 표시 여부
   * @returns Promise - 요청 결과
   */
  process(axiosFunc: AxiosPromise, isLoading: boolean) {
    if (isLoading) console.log('loading..')
    return new Promise((resolve, reject) => {
      axiosFunc
        .then((res) => {
          resolve(res.data)
        })
        .catch((error) => {
          reject(error)
        })
        .finally(() => {
          if (isLoading) console.log('loading..')
        })
    })
  },

  /**
   * GET 요청을 수행하는 메서드
   * @param url - 요청 URL
   * @param param - URL 파라미터
   * @param isAuth - 인증 필요 여부
   * @param ext - 추가 설정 옵션
   * @param isLoading - 로딩 상태 표시 여부
   */
  get(url: string, param: Record<string, any> = {}, isAuth: boolean = true, ext: Record<string, any> = {}, isLoading: boolean = false) {
    if (isAuth) {
      this.setAuthTokens()
    } else {
      this.removeAuthTokens()
    }
    return this.process(
      axios.get(url, { params: param, headers: { ...ext.headers }, ...ext }),
      isLoading
    )
  },

  /**
   * POST 요청을 수행하는 메서드
   * @param url - 요청 URL
   * @param param - 요청 본문 데이터
   * @param isAuth - 인증 필요 여부
   * @param ext - 추가 설정 옵션
   */
  post(url: string, param: Record<string, any> = {}, isAuth: boolean = true, ext: Record<string, any> = {}) {
    if (isAuth) {
      this.setAuthTokens()
    } else {
      this.removeAuthTokens()
    }
    return this.process(
      axios.post(url, param, { headers: { ...ext.headers }, ...ext }),
      false
    )
  },

  /**
   * PUT 요청을 수행하는 메서드
   * @param url - 요청 URL
   * @param param - 요청 본문 데이터
   * @param isAuth - 인증 필요 여부
   * @param ext - 추가 설정 옵션
   */
  put(url: string, param: Record<string, any> = {}, isAuth: boolean = true, ext: Record<string, any> = {}) {
    if (isAuth) {
      this.setAuthTokens()
    } else {
      this.removeAuthTokens()
    }
    return this.process(
      axios.put(url, param, { headers: { ...ext.headers }, ...ext }),
      false
    )
  },

  /**
   * PATCH 요청을 수행하는 메서드
   * @param url - 요청 URL
   * @param param - 요청 본문 데이터
   * @param isAuth - 인증 필요 여부
   * @param ext - 추가 설정 옵션
   */
  patch(url: string, param: Record<string, any> = {}, isAuth: boolean = true, ext: Record<string, any> = {}) {
    if (isAuth) {
      this.setAuthTokens()
    } else {
      this.removeAuthTokens()
    }
    return this.process(
      axios.patch(url, param, { headers: { ...ext.headers }, ...ext }),
      false
    )
  },

  /**
   * DELETE 요청을 수행하는 메서드
   * @param url - 요청 URL
   * @param param - URL 파라미터
   * @param isAuth - 인증 필요 여부
   * @param ext - 추가 설정 옵션
   */
  delete(url: string, param: Record<string, any> = {}, isAuth: boolean = true, ext: Record<string, any> = {}) {
    if (isAuth) {
      this.setAuthTokens()
    } else {
      this.removeAuthTokens()
    }
    return this.process(
      axios.delete(url, { params: param, headers: { ...ext.headers }, ...ext }),
      false
    )
  },

  /**
   * 인증 토큰과 리프레시 토큰을 설정하는 메서드
   */
  setAuthTokens() {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.accessToken}`
    } else {
      this.removeAuthTokens()
    }
  },

  /**
   * 인증 토큰을 제거하는 메서드
   */
  removeAuthTokens() {
    delete axios.defaults.headers.common.Authorization
  },
}

export default serviceAxios
