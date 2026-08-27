import { ref, computed } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'

const SAVED_USER_ID_KEY = 'pm-com-0101-saved-user-id'

/**
 * 로그인 폼(PM-COM-0101) 상태 및 유효성 검사.
 * 실제 인증 API 연동 전까지는 필수값 검사만 수행하고 성공 경로(onSuccess)로 넘긴다.
 * 로그인 실패 문구/잠금 규칙은 기획서 기준으로 만들어 뒀고, 실패 횟수 자체는 서버가
 * 계정별로 관리하는 값이라 API 확정 전까지는 호출부에서 넘겨준 값을 그대로 보여준다.
 */
export function useLogin() {
  const dialog = useDialog()

  const userId = ref('')
  const password = ref('')
  const saveId = ref(false)
  const locked = ref(false)

  const savedId = localStorage.getItem(SAVED_USER_ID_KEY)
  if (savedId) {
    userId.value = savedId
    saveId.value = true
  }

  const canSubmit = computed(
    () => userId.value.trim() !== '' && password.value.trim() !== '' && !locked.value,
  )

  function persistSavedId() {
    if (saveId.value) localStorage.setItem(SAVED_USER_ID_KEY, userId.value)
    else localStorage.removeItem(SAVED_USER_ID_KEY)
  }

  /** * 로그인 실패 회수는 누적되는지 확인 필요(기획서) — API 연동 시 서버가 준 failCount 로 교체 */
  async function notifyLoginFailed(failCount: number) {
    if (failCount >= 5) {
      locked.value = true
      await dialog.alert({
        description:
          '아이디 또는 비밀번호가 올바르지 않습니다. 로그인 실패 5회 / 5회 입니다. 로그인 5회 실패로 계정이 잠기게 됩니다.',
      })
      return
    }
    await dialog.alert({
      description: `아이디 또는 비밀번호가 올바르지 않습니다. 로그인 실패 ${failCount}회 / 5회 입니다. 로그인 5회 실패 시 계정이 잠기게 됩니다.`,
    })
  }

  /** 로그인 버튼 클릭. onSuccess 가 실제 API 연동 지점이다. */
  async function submit(onSuccess: () => void) {
    if (!canSubmit.value) {
      await dialog.alert({ description: '아이디와 비밀번호를 입력해 주세요.' })
      return
    }
    persistSavedId()
    // TODO(API): 실제 로그인 요청으로 교체. 실패 응답을 받으면 notifyLoginFailed(failCount) 호출.
    onSuccess()
  }

  return { userId, password, saveId, locked, canSubmit, submit, notifyLoginFailed }
}

/** 공인인증서 등록 팝업(PM-COM-0102) 상태 및 유효성 검사 */
export function useCertRegister() {
  const dialog = useDialog()

  const userId = ref('')
  const password = ref('')
  const pwVisible = ref(false)

  const canRegister = computed(() => userId.value.trim() !== '' && password.value.trim() !== '')

  function reset() {
    userId.value = ''
    password.value = ''
    pwVisible.value = false
  }

  /** 공인인증서 등록 버튼 클릭. onSuccess 가 실제 등록 API 연동 지점이다. */
  async function register(onSuccess: () => void) {
    if (!canRegister.value) {
      await dialog.alert({
        title: '공인인증서 등록',
        description: '공인인증서 검증에 실패하였습니다. 아이디와 비밀번호를 확인하시기 바랍니다.',
      })
      return
    }
    // TODO(API): 실제 공인인증서 등록 요청으로 교체.
    await dialog.alert({
      title: '공인인증서 등록',
      description: '공인인증서 등록이 완료되었습니다.',
    })
    onSuccess()
  }

  return { userId, password, pwVisible, canRegister, register, reset }
}
