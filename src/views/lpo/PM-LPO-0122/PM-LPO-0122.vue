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
      <span class="lp-icon-row">
        <span class="lp-heading-md">화면 모드 설정</span>
        <InfoBox size="slim" type="primary">
          현재 {{ darkMode ? '다크(어두운)' : '라이트(밝은)' }}모드 입니다.
        </InfoBox>
      </span>
      <Switch v-model="darkMode" variant="none" label="다크(어두운) 모드 사용" />
    </div>

    <div class="lp-row-between lp-section-head">
      <span class="lp-heading-md">메인화면 설정</span>
      <span class="group-gap2">
        <Button type="button" variant="tertiary2" size="sm" @click="onReset">기본설정으로</Button>
        <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      </span>
    </div>

    <div class="lp-mainset-preview">
      <div class="lp-mainset-col">
        <div v-for="slot in [1, 2]" :key="slot" class="lp-mainset-slot">
          <span class="lp-mainset-badge">{{ slot }}</span>
          <div v-if="previewSlots[slot - 1]" class="lp-mainset-card">
            <span class="lp-mainset-card-title">{{ previewSlots[slot - 1]?.label }}</span>
            <span class="lp-mainset-card-img" aria-hidden="true"></span>
          </div>
          <div v-else class="lp-mainset-empty">미설정</div>
        </div>
      </div>

      <div class="lp-mainset-col">
        <div class="lp-mainset-empty lp-mainset-empty-tall">수정 불가</div>
      </div>

      <div class="lp-mainset-col">
        <div class="lp-mainset-empty">수정 불가</div>
        <div class="lp-mainset-empty">수정 불가</div>
      </div>

      <div class="lp-mainset-col">
        <div v-for="slot in [3, 4]" :key="slot" class="lp-mainset-slot lp-mainset-slot-reverse">
          <span class="lp-mainset-badge">{{ slot }}</span>
          <div v-if="previewSlots[slot - 1]" class="lp-mainset-card">
            <span class="lp-mainset-card-title">{{ previewSlots[slot - 1]?.label }}</span>
            <span class="lp-mainset-card-img" aria-hidden="true"></span>
          </div>
          <div v-else class="lp-mainset-empty">미설정</div>
        </div>
      </div>

      <div class="lp-mainset-guide">
        <ul class="lp-bullet-list">
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
      <div v-for="group in menuGroups" :key="group.title">
        <p class="lp-mainset-group-title">{{ group.title }}</p>
        <ul>
          <li v-for="item in group.items" :key="item.key" class="lp-mainset-menu-item">
            <Checkbox
              :id="`main-menu-${item.key}`"
              :model-value="!!selectionOf(item.key)"
              :disabled="!selectionOf(item.key) && isFull"
              :label="item.label"
              @update:model-value="(checked) => toggleMenu(item.key, !!checked)"
            />
            <template v-if="selectionOf(item.key)">
              <SelectField
                :model-value="String(selectionOf(item.key)?.slot)"
                :options="slotOptions"
                size="sm"
                triggerClass="w-20"
                :aria-label="`${item.label} 위치 번호`"
                @update:model-value="(v: string | number) => setSlot(item.key, Number(v))"
              />
              <Button type="button" variant="tertiary" size="sm" padding="12" @click="openImagePick(item.key)">
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
    :used-ids="pickingMenuKey ? usedImageIds(pickingMenuKey) : []"
    @update:model-value="onPickImage"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/custom/checkbox'
import { Switch } from '@/components/custom/switch'
import { InfoBox } from '@/components/custom/infobox'
import SelectField from '@/components/custom/select/SelectField.vue'
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

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '화면설정' },
]

const {
  darkMode,
  isFull,
  previewSlots,
  selectionOf,
  toggleMenu,
  setSlot,
  setImage,
  usedImageIds,
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
  toast.success('기본설정으로 되돌렸습니다.')
}

function onSave() {
  toast.success('저장되었습니다.')
}

useBottomTabSetup({
  value: 'PM-LPO-0122',
  label: '화면설정',
  path: '/views/lpo/PM-LPO-0122',
  componentName: 'PmLpo0122',
  closable: true,
})
</script>
