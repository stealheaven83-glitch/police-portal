<template>
  <div :class="styles.loginPage">
    <div :class="styles.loginCard">
      <div :class="styles.brand" aria-label="지역경찰포털 안내">
        <div :class="styles.brandInner">
          <img :class="styles.logo" src="/portal/asset/images/img/img_logo_white.svg" alt="지역경찰포털" />
        </div>

        <div :class="styles.notice">
          <div :class="styles.noticeHeader">
            <img src="/portal/asset/images/icon/icon_info_white.svg" alt="" />
            <p :class="styles.noticeTitle">안내사항</p>
          </div>
          <ul :class="styles.noticeList">
            <li>아이디와 비밀번호는 [공조 조회 시스템]에서 찾을 수 있습니다.</li>
            <li>로그인 5회 실패 시 계정이 잠기게 됩니다. 잠금 해제는 관리자에게 문의 바랍니다.</li>
          </ul>
        </div>
      </div>

      <div :class="styles.formArea">
        <h1 :class="styles.formTitle">로그인</h1>
        <form :class="styles.form" @submit.prevent="onSubmit">
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

          <div :class="styles.saveIdRow">
            <Checkbox v-model="saveId" label="아이디 저장" :disabled="locked" />
          </div>

          <Button type="submit" variant="primary" size="md" :class="styles.submitBtn" :disabled="!canSubmit">
            공인인증서 등록
          </Button>
        </form>

        <div :class="styles.certSection">
          <p :class="styles.certTitle">행정전자서명 로그인</p>
          <div :class="styles.certBtns">
            <Button type="button" variant="tertiary2" size="sm" :class="styles.certBtn" @click="certDialogOpen = true">
              공인인증서 등록
            </Button>
            <Button type="button" variant="secondary" size="sm" :class="styles.certBtn" @click="onCertLogin">
              공인인증서 로그인
            </Button>
          </div>
        </div>
      </div>
    </div>

    <CertRegisterDialog v-model:open="certDialogOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import CertRegisterDialog from './components/CertRegisterDialog.vue'
import { useLogin } from './composable/PM-COM-0101'
import styles from './style/PM-COM-0101.module.css'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PmCom0101',
})

const router = useRouter()

const { userId, password, saveId, locked, canSubmit, submit } = useLogin()

async function onSubmit() {
  await submit(() => {
    toast.success('로그인 성공', { description: '환영합니다!' })
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
