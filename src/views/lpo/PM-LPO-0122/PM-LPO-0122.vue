<template>
  <PageHeader>
    <template #left>
      <PageTitle title="화면설정" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-page-scroll">
    <div class="lp-setting-bar lp-row-between">
      <span class="lp-setting-bar-head">
        <span class="lp-heading-md">화면 모드 설정</span>
        <!-- 시안(13312:146247)은 InfoBox 같은 상자가 아니라 아이콘 + 한 줄 안내문이다 -->
        <span class="lp-info-message">
          <Icon name="systemInfo" :size="16" />
          현재 {{ darkMode ? '다크(어두운)' : '라이트(밝은)' }}모드 입니다.
        </span>
      </span>
      <Switch v-model="darkMode" variant="none" label="다크(어두운) 모드 사용" />
    </div>

    <!-- 시안(13391:64693)에는 제목 아래 실선이 없다 -->
    <div class="lp-row-between">
      <span class="lp-heading-md">메인화면 설정</span>
      <span class="group-gap2">
        <Button type="button" variant="tertiary2" size="sm" @click="onReset">기본설정으로</Button>
        <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      </span>
    </div>

    <div class="lp-mainset-preview">
      <!-- 왼쪽: 메인화면을 축소한 미리보기 (시안 13312:146548 — 1020×300) -->
      <div class="lp-mainset-figure">
        <div class="lp-mainset-cards">
          <div class="lp-mainset-col">
            <div v-for="slot in [1, 2]" :key="slot" class="lp-mainset-slot">
              <span class="lp-mainset-badge">{{ slot }}</span>
              <div v-if="previewSlots[slot - 1]" class="lp-mainset-card">
                <span class="lp-mainset-card-title">{{ previewSlots[slot - 1]?.label }}</span>
                <img
                  v-if="previewSlots[slot - 1]?.imageSrc"
                  class="lp-mainset-card-img"
                  :src="previewSlots[slot - 1]!.imageSrc"
                  :alt="previewSlots[slot - 1]!.imageName"
                >
                <span v-else class="lp-mainset-card-img" aria-hidden="true"></span>
              </div>
              <div v-else class="lp-mainset-empty">미설정</div>
            </div>
          </div>

          <div class="lp-mainset-col">
            <div class="lp-mainset-empty">수정 불가</div>
          </div>

          <div class="lp-mainset-col lp-mainset-col-split">
            <div class="lp-mainset-empty">수정 불가</div>
            <div class="lp-mainset-empty">수정 불가</div>
          </div>

          <div class="lp-mainset-col">
            <div v-for="slot in [3, 4]" :key="slot" class="lp-mainset-slot lp-mainset-slot-reverse">
              <span class="lp-mainset-badge">{{ slot }}</span>
              <div v-if="previewSlots[slot - 1]" class="lp-mainset-card">
                <span class="lp-mainset-card-title">{{ previewSlots[slot - 1]?.label }}</span>
                <img
                  v-if="previewSlots[slot - 1]?.imageSrc"
                  class="lp-mainset-card-img"
                  :src="previewSlots[slot - 1]!.imageSrc"
                  :alt="previewSlots[slot - 1]!.imageName"
                >
                <span v-else class="lp-mainset-card-img" aria-hidden="true"></span>
              </div>
              <div v-else class="lp-mainset-empty">미설정</div>
            </div>
          </div>
        </div>
      </div>

      <div class="lp-mainset-guide">
        <ul class="lp-dot-list">
          <li>
            왼쪽 이미지에서 보이는 4개의 메뉴를 설정하여 메인에 반영할 수 있습니다.
            (모바일의 경우 모바일에서 설정할 수 있습니다.)
          </li>
          <li>
            아래 메뉴 목록에서 원하는 메뉴를 체크하면, 메뉴 옆에 위치를 지정할 수 있는 번호와
            이미지 선택 버튼이 자동으로 생성됩니다. 선택을 완료하면 왼쪽 이미지에 반영되어
            미리보기가 가능합니다.
          </li>
          <li>
            한 번호 당 한 개의 메뉴만 선택할 수 있으며, 동일 메뉴를 여러 카드에 등록할 수 없습니다.
          </li>
        </ul>
      </div>
    </div>

    <div class="lp-mainset-menus">
      <div v-for="group in menuGroups" :key="group.title" class="lp-mainset-menu-col">
        <p class="lp-mainset-group-title">{{ group.title }}</p>
        <ul>
          <li v-for="item in group.items" :key="item.key" class="lp-mainset-menu-item">
            <!-- 기획서 5-1: 4개가 찼어도 막지 않는다. 새로 체크하면 가장 먼저 체크한 게 풀린다 -->
            <Checkbox
              :id="`main-menu-${item.key}`"
              :model-value="!!selectionOf(item.key)"
              :label="item.label"
              @update:model-value="(checked) => toggleMenu(item.key, !!checked)"
            />
            <template v-if="selectionOf(item.key)">
              <!-- 시안(13312:148981): 번호 셀렉트 72×32, '이미지 선택' 버튼 높이 32.
                   SelectField 의 sm 은 40px 이라 폭·높이만 triggerClass 로 맞춘다 -->
              <SelectField
                :model-value="String(selectionOf(item.key)?.slot)"
                :options="slotOptions"
                size="sm"
                triggerClass="w-18 h-8"
                :aria-label="`${item.label} 위치 번호`"
                @update:model-value="(v: string | number) => setSlot(item.key, Number(v))"
              />
              <Button type="button" variant="tertiary" size="xs" padding="12" @click="openImagePick(item.key)">
                이미지 선택
              </Button>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <MainImagePickDialog
    v-model:open="imagePickOpen"
    :images="mainImages"
    :model-value="pickingImageId"
    :used-slots="usedImageSlots()"
    @update:model-value="onPickImage"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/custom/checkbox'
import { Switch } from '@/components/custom/switch'
import Icon from '@/components/custom/icon/Icon.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import MainImagePickDialog from './components/MainImagePickDialog.vue'
import { useScreenSetting, menuGroups, mainImages, SLOT_COUNT } from './composable/PM-LPO-0122'

defineOptions({
  name: 'PmLpo0122',
})

// LNB: 개인수첩 > 화면설정 (프리셋 미등록 — Figma LNB 라벨을 그대로 넣었다, CLAUDE.md §5 ③)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '화면설정' })

const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '화면설정' },
]

const {
  darkMode,
  previewSlots,
  selectionOf,
  toggleMenu,
  setSlot,
  setImage,
  usedImageSlots,
  resetToDefault,
} = useScreenSetting()

const slotOptions = Array.from({ length: SLOT_COUNT }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}))

const imagePickOpen = ref(false)
const pickingMenuKey = ref<string | null>(null)
const pickingImageId = computed(() =>
  pickingMenuKey.value ? (selectionOf(pickingMenuKey.value)?.imageId ?? '') : '',
)

function openImagePick(menuKey: string) {
  pickingMenuKey.value = menuKey
  imagePickOpen.value = true
}

function onPickImage(imageId: string) {
  if (pickingMenuKey.value) setImage(pickingMenuKey.value, imageId)
}

function onReset() {
  resetToDefault()
}

/** 설계서 A01 — 한 버튼에 모달은 하나만 붙인다(완료 알림은 인계 대상) */
async function onSave() {
  const { confirmed } = await dialog.confirm({
    title: '저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
}

useBottomTabSetup({
  value: 'PM-LPO-0122',
  label: '화면설정',
  path: '/views/lpo/PM-LPO-0122',
  componentName: 'PmLpo0122',
  closable: true,
})
</script>
