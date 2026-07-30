import axios, { type AxiosResponse } from 'axios'
import { toast } from 'vue-sonner'
import { setupMockInterceptor } from './mock-interceptors'

/**
 * Axios 인터셉터 설정
 * HTTP 요청/응답에 대한 공통 처리를 담당
 */
const setupInterceptor = () => {
  setupMockInterceptor()

  // 요청 타임아웃 설정 (40초)
  axios.defaults.timeout = 40000

  // 응답 인터셉터 설정
  axios.interceptors.response.use(
    (res: AxiosResponse) => {
      // 성공 응답은 그대로 반환
      return res
    },
    (error) => {
      console.error('HTTP Error:', error)

      // 네트워크 에러 (서버 응답 없음)
      if (!error.response) {
        toast.error('네트워크 오류', {
          description: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
        })
        return Promise.reject(error)
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status

      switch (status) {
        case 400:
          toast.error('잘못된 요청', {
            description: error.response.data?.message || '요청 데이터를 확인해주세요.'
          })
          break

        case 404:
          toast.error('리소스를 찾을 수 없음', {
            description: '요청한 리소스가 존재하지 않습니다.'
          })
          break

        case 500:
          toast.error('서버 오류', {
            description: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          })
          break

        default:
          // 기타 에러는 콘솔에만 로깅
          console.error(`HTTP ${status} Error:`, error.response.data)
      }

      return Promise.reject(error)
    }
  )
}

export default { setupInterceptor, axios }
