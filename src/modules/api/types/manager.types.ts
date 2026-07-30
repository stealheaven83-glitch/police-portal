export interface SearchParams {
  page?: number;
  size?: number;
  searchTextCd?: string;
}

export interface Manager {
  adminId?: string;
  adminNm?: string;
  emailAdr?: string;
  telNo?: string;
  useYn?: string;
  regDt?: string;
}

export interface RequestManagerParams {
  adminId?: string;
  password?: string;
  confirmPassword?: string;
  registerAsAdmin?: boolean;
  provider?: string;
  use2fa?: boolean;
  checkIp?: boolean;
  adminName?: string;
  telNo?: string;
  email?: string;
  useYn?: string;
}

export interface RequestManagerInsertParams {
  userId?: string;
  password?: string;
  registerAsAdmin?: boolean;
  provider?: string;
  targetServiceName?: string;
  use2fa?: boolean;
  checkIp?: boolean;
  adminName?: string;
  telNo?: string;
  email?: string;
}

export interface RequestManagerUpdateParams {
  adminId?: string;
  adminName?: string | null;
  telNo?: string | null;
  email?: string | null;
  useYn?: string | null;
  use2fa?: boolean | null;
  checkIp?: boolean | null;
}

export interface ManagerDetailParams {
  adminId?: string;
}

export interface ManagerDeleteParams {
  adminId?: string;
}

export interface ManagerListParams extends SearchParams {
  searchBeginDate?: string;
  searchEndDate?: string;
  searchText?: string;
  searchTargetService?: string;
}

export interface CreateManagerRequest extends RequestManagerParams {
  // RequestManagerParams를 상속받아 사용
}

export interface ChangePasswordParams {
  userId: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface UpdateApplicationRole {
  adminId: string;
  roleIds?: number[] | null;
}

