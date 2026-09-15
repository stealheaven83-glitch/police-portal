<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand" aria-label="지역경찰포털 안내">
        <div class="login-brand-inner">
          <img class="login-logo" src="/portal/asset/images/img/img_logo_white.svg" alt="지역경찰포털" />
        </div>

        <div class="login-notice">
          <div class="login-notice-header">
            <img src="/portal/asset/images/icon/icon_info_white.svg" alt="" />
            <p class="login-notice-title">안내사항</p>
          </div>
          <ul class="login-notice-list">
            <li>아이디와 비밀번호는 [공조 조회 시스템]에서 찾을 수 있습니다.</li>
            <li>로그인 5회 실패 시 계정이 잠기게 됩니다. 잠금 해제는 관리자에게 문의 바랍니다.</li>
          </ul>
        </div>
      </div>

      <div class="login-form-area">
        <h1 class="login-form-title">로그인</h1>
        <form class="login-form" @submit.prevent="onSubmit">
          <InputField2
            v-model="userId"
            label="아이디"
            label-position="top"
            label-class="text-[1.5rem] font-normal text-[var(--Text-body_1)]"
            placeholder="아이디를 입력하세요"
            clearable
            size="md"
            autocomplete="username"
            :disabled="locked"
          />
          <InputField2
            v-model="password"
            type="password"
            label="비밀번호"
            label-position="top"
            label-class="text-[1.5rem] font-normal text-[var(--Text-body_1)]"
            placeholder="비밀번호를 입력하세요"
            clearable
            size="md"
            autocomplete="current-password"
            :disabled="locked"
          />

          <div class="login-save-id-row">
            <Checkbox v-model="saveId" label="아이디 저장" :disabled="locked" />
          </div>

          <Button type="submit" variant="primary" size="md" class="login-submit-btn">
            로그인
          </Button>
        </form>

        <div class="login-cert-section">
          <p class="login-cert-title">행정전자서명 로그인</p>
          <ButtonGroup :items="certButtons" class="gap-3 max-md:flex-col" />
        </div>
      </div>
    </div>

    <CertRegisterDialog v-model:open="certDialogOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button, ButtonGroup, type ButtonCaseItem } from '@/components/custom/button'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import CertRegisterDialog from './components/CertRegisterDialog.vue'
import { useLogin } from './composable/PM-COM-0101'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PmCom0101',
})

const router = useRouter()

const { userId, password, saveId, locked, submit } = useLogin()

async function onSubmit() {
  await submit(async () => {
    await dialog.alert({ title: '로그인 성공', description: '환영합니다!', btnCancel: '확인' })
    router.push('/')
  })
}

/**
 * 공인인증서 로그인은 브라우저/OS 플러그인이 띄우는 시스템 팝업(기획서: "시스템 팝업으로
 * 공인인증서 선택창 오픈")이라 이 화면에서 직접 그릴 수 있는 UI가 아니다. 실제 연동 전까지는
 * 자리만 잡아둔다.
 */
function onCertLogin() {
  // TODO(연동 필요): 공인인증서 선택 시스템 팝업 연동
}

const certDialogOpen = ref(false)

const certButtons: ButtonCaseItem[] = [
  { key: 'register', label: '공인인증서 등록', variant: 'tertiary2', size: 'sm', class: 'login-cert-btn', onClick: () => (certDialogOpen.value = true) },
  { key: 'login', label: '공인인증서 로그인', variant: 'secondary', size: 'sm', class: 'login-cert-btn', onClick: onCertLogin },
]

/**
 * 화면ID(PM-COM-0101/0102) ↔ 공인인증서 등록 팝업 상태 동기화 (PC-LPO-0701/0702 와 동일 패턴).
 *   PM-COM-0101 : 로그인 화면만(팝업 닫힘)
 *   PM-COM-0102 : 로그인 화면 + 공인인증서 등록 팝업(certDialogOpen) 열림
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-COM-0101': [[certDialogOpen, false]],
  'PM-COM-0102': [[certDialogOpen, true]],
}
useAutoTrigger(screenTriggers)

// 로그인 전 단독 화면이라 하단 탭을 쓰지 않는다
useBottomTabSetup(false)
</script>
