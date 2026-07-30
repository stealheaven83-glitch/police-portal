import serviceAxios from '../axiosHelper'
import type {
  ManagerListParams,
  Manager,
  RequestManagerInsertParams,
  ChangePasswordParams,
  RequestManagerUpdateParams,
  ManagerDeleteParams
} from './types/manager.types'

const path = '/api/v1/admin'
const manager = {
  /** 사용자 목록 조회 */
  list(params: ManagerListParams) {
    return serviceAxios.get(path + '/list', params, true, {})
  },
  create(params: RequestManagerInsertParams) {
    return serviceAxios.post(path + '/register', params, true, {})
  },
  modify(params: RequestManagerUpdateParams) {
    return serviceAxios.post(path + '/modify', params, true, {})
  },
  detail(params: Manager) {
    return serviceAxios.get(path + '/getInfo', params, true, {})
  },
  delete(params: ManagerDeleteParams) {
    return serviceAxios.delete(path + '/delete', params, true, {})
  },
  updatePassword(params: ChangePasswordParams) {
    return serviceAxios.post(path + '/password/update', params, true, {})
  },
}

export const managerApi = { manager }
export default managerApi