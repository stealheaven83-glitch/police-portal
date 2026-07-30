import axios from 'axios'
import { MOCK_CONFIG, MOCK_LOGGING } from '@/mocks/mockConfig'
// import { authMock } from '@/mocks/handlers/authMock'
import { managerMock } from '@/mocks/handlers/managerMock'

/**
 * Mock 인터셉터
 * API 요청을 가로채서 Mock 데이터로 응답
 */

// Mock 로그 출력
const log = (message: string, data?: any) => {
    if (MOCK_LOGGING) {
        console.log(`[Mock Interceptor] ${message}`, data || '')
    }
}

// URL과 메서드에 따라 적절한 Mock 핸들러 찾기
const getMockHandler = (url: string, method: string, data?: any, params?: any) => {
    log(`Intercepting ${method.toUpperCase()} ${url}`, { data, params })

    // // 인증 API
    // if (MOCK_CONFIG.auth) {
    //     if (url.includes('/api/v2/jwt/login') && method === 'post') {
    //         return authMock.login(data)
    //     }
    //     if (url.includes('/api/v1/admin/getInfo') && method === 'get') {
    //         return authMock.getUser(params)
    //     }
    //     if (url.includes('/api/v1/user/logout') && method === 'post') {
    //         return authMock.logout()
    //     }
    //     if (url.includes('/api/v1/2fa/auth') && method === 'post') {
    //         return authMock.registerOtp(data)
    //     }
    //     if (url.includes('/api/menu-auth/list') && method === 'get') {
    //         return Promise.resolve({ state: '200', result: [] })
    //     }
    // }

    // 관리자 API
    if (MOCK_CONFIG.manager) {
        if (url.includes('/api/v1/admin/list') && method === 'get') {
            return managerMock.list(params)
        }
        if (url.includes('/api/v1/admin/register') && method === 'post') {
            return managerMock.create(data)
        }
        if (url.includes('/api/v1/admin/modify') && method === 'post') {
            return managerMock.modify(data)
        }
        if (url.includes('/api/v1/admin/getInfo') && method === 'get') {
            return managerMock.detail(params)
        }
        if (url.includes('/api/v1/admin/delete') && method === 'delete') {
            return managerMock.delete(params)
        }
        if (url.includes('/api/v1/admin/changePassword') && method === 'post') {
            return managerMock.changePassword(data)
        }
    }

    return null
}

/**
 * Mock 인터셉터 설정
 */
export const setupMockInterceptor = () => {
    // Request Interceptor
    axios.interceptors.request.use(
        async (config) => {
            const mockHandler = getMockHandler(
                config.url || '',
                config.method || 'get',
                config.data,
                config.params
            )

            if (mockHandler) {
                // Mock 응답을 사용하는 경우, 요청을 취소하고 Mock 데이터 반환
                const mockResponse = await mockHandler

                // Axios 요청 취소 및 Mock 응답 반환을 위한 특수 처리
                config.adapter = () => {
                    return Promise.resolve({
                        data: mockResponse,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                    })
                }
            }

            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    log('Mock interceptor initialized')
}
