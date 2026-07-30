/**
 * Mock 데이터 사용 여부를 제어하는 설정 파일
 * 
 * 환경변수 또는 이 파일에서 직접 설정 가능
 * - true: Mock 데이터 사용 (백엔드 API 호출 안함)
 * - false: 실제 백엔드 API 호출
 */

// 환경변수로 제어
const envUseMock = import.meta.env.VITE_USE_MOCK === 'true'

// 직접 설정 
const defaultUseMock = true

export const USE_MOCK = envUseMock !== undefined ? envUseMock : defaultUseMock

// Mock 응답 지연 시간 (ms)
export const MOCK_DELAY = 500

// 개별 API별 Mock 사용 여부 
export const MOCK_CONFIG = {
  auth: USE_MOCK,
  manager: USE_MOCK,
  user: USE_MOCK,
  role: USE_MOCK,
}

// Mock 데이터 로깅 여부
export const MOCK_LOGGING = true
