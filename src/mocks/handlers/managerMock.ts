import managersData from '../data/managers.json'
import { MOCK_LOGGING } from '../mockConfig'

/**
 * 관리자 관련 Mock Handler
 */

// Mock 로그 출력
const log = (message: string, data?: any) => {
    if (MOCK_LOGGING) {
        console.log(`[Mock Manager] ${message}`, data || '')
    }
}

// 메모리 상의 관리자 데이터
let managers = [...managersData.managers]

export const managerMock = {
    /**
     * 관리자 목록 조회 Mock
     */
    list: async (params: { page?: number; size?: number; searchTextCd?: string }) => {

        log('Get manager list', params)

        const page = params.page || 0
        const size = params.size || 10

        // 페이지네이션 적용
        const start = page * size
        const end = start + size
        const paginatedManagers = managers.slice(start, end)

        log(`Returning ${paginatedManagers.length} managers (page ${page})`)

        return {
            state: '200',
            message: '조회 성공',
            result: {
                content: paginatedManagers,
                totalElements: managers.length,
                totalPages: Math.ceil(managers.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: end >= managers.length
            }
        }
    },

    /**
     * 관리자 상세 조회 Mock
     */
    detail: async (params: { adminId: string }) => {

        log('Get manager detail', params)

        const manager = managers.find(m => m.adminId === params.adminId)

        if (!manager) {
            log('Manager not found')
            throw {
                response: {
                    data: {
                        state: '404',
                        message: '관리자를 찾을 수 없습니다.'
                    }
                }
            }
        }

        log('Manager detail retrieved', manager)

        return {
            state: '200',
            message: '조회 성공',
            result: manager
        }
    },

    /**
     * 관리자 생성 Mock
     */
    create: async (params: any) => {
        log('Create manager', params)

        // 중복 체크 (userId로 체크)
        const exists = managers.find(m => m.adminId === params.userId)
        if (exists) {
            log('Manager already exists')
            throw {
                response: {
                    data: {
                        state: '409',
                        message: '이미 존재하는 관리자 ID입니다.'
                    }
                }
            }
        }

        // 새 관리자 생성 (RequestManagerInsertParams 타입 사용)
        const newManager = {
            adminId: params.userId,
            adminNm: params.adminName,
            emailAdr: params.email,
            telNo: params.telNo,
            useYn: params.registerAsAdmin ? 'Y' : 'N',
            regDt: new Date().toISOString()
        }

        managers.push(newManager)

        log('Manager created', newManager)

        return {
            state: '200',
            message: '관리자가 생성되었습니다.',
            result: newManager
        }
    },

    /**
     * 관리자 수정 Mock
     */
    modify: async (params: any) => {
        log('Modify manager', params)

        const index = managers.findIndex(m => m.adminId === params.adminId)

        if (index === -1) {
            log('Manager not found')
            throw {
                response: {
                    data: {
                        state: '404',
                        message: '관리자를 찾을 수 없습니다.'
                    }
                }
            }
        }

        // 관리자 정보 업데이트 (RequestManagerUpdateParams 타입 사용)
        const currentManager = managers[index]
        if (!currentManager) {
            throw {
                response: {
                    data: {
                        state: '500',
                        message: '관리자 정보를 업데이트할 수 없습니다.'
                    }
                }
            }
        }

        managers[index] = {
            ...currentManager,
            adminNm: params.adminName ?? currentManager.adminNm,
            emailAdr: params.email ?? currentManager.emailAdr,
            telNo: params.telNo ?? currentManager.telNo,
            useYn: params.useYn ?? currentManager.useYn,
            adminId: currentManager.adminId,
            regDt: currentManager.regDt
        }

        log('Manager modified', managers[index])

        return {
            state: '200',
            message: '관리자가 수정되었습니다.',
            result: managers[index]
        }
    },

    /**
     * 관리자 삭제 Mock
     */
    delete: async (params: { adminId: string }) => {
        log('Delete manager', params)

        const index = managers.findIndex(m => m.adminId === params.adminId)

        if (index === -1) {
            log('Manager not found')
            throw {
                response: {
                    data: {
                        state: '404',
                        message: '관리자를 찾을 수 없습니다.'
                    }
                }
            }
        }

        const deleted = managers.splice(index, 1)[0]

        log('Manager deleted', deleted)

        return {
            state: '200',
            message: '관리자가 삭제되었습니다.',
            result: deleted
        }
    },

    /**
     * 비밀번호 변경 Mock
     */
    changePassword: async (params: any) => {
        log('Change password', params)

        return {
            state: '200',
            message: '비밀번호가 변경되었습니다.'
        }
    }
}
