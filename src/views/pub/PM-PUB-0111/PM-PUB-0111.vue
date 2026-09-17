<template>
  <PageHeader>
    <template #left>
      <PageTitle title="참고사항" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <SelectField v-model="year" label="년도" :options="yearOptions" size="sm" trigger-class="w-30" />
        <SelectField v-model="town" label="읍면동" :options="townOptions" size="sm" trigger-class="w-50" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadTemplate">
      <Download :size="16" aria-hidden="true" />
      양식다운로드
    </Button>
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="tertiary2" size="sm" @click="onUpload">업로드</Button>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </div>

  <ScrollWrapper>
    <section class="lp-section" aria-labelledby="ref-crime-heading">
      <h2 id="ref-crime-heading" class="lp-section-title">범죄 통계</h2>
      <InfoTable :columns="2" size="130">
        <!-- 시안은 '범죄' 한 칸이 하위 3줄을, '강력범죄' 한 칸이 하위 4줄을 묶는다 -->
        <InfoField label="범죄" layout="column">
          <div class="info-label">
            <div class="info-label-group">
              <span class="info-label-txt">철도범죄</span>
              <InputField2 v-model.number="crime.railway" type="number" min="0" :clearable="false" aria-label="철도범죄" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
            <div class="info-label-group">
              <span class="info-label-txt">폭력범죄</span>
              <InputField2 v-model.number="crime.violence" type="number" min="0" :clearable="false" aria-label="폭력범죄" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
            <div class="info-label-group">
              <span class="info-label-txt">지능범죄</span>
              <InputField2 v-model.number="crime.intelligence" type="number" min="0" :clearable="false" aria-label="지능범죄" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
          </div>
        </InfoField>

        <!-- 네 줄이 한 .info-label(grid) 안에 있어야 라벨 열이 가장 긴 문구에 같이 맞는다 -->
        <InfoField label="강력범죄" layout="column">
          <div class="info-label">
            <div class="info-label-group">
              <span class="info-label-txt">강력(살인)</span>
              <InputField2 v-model.number="crime.murder" type="number" min="0" :clearable="false" aria-label="강력(살인)" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
            <div class="info-label-group">
              <span class="info-label-txt">강력(강도)</span>
              <InputField2 v-model.number="crime.robbery" type="number" min="0" :clearable="false" aria-label="강력(강도)" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
            <div class="info-label-group">
              <span class="info-label-txt">강력(강간, 강제추행)</span>
              <InputField2 v-model.number="crime.rape" type="number" min="0" :clearable="false" aria-label="강력(강간, 강제추행)" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
            <div class="info-label-group">
              <span class="info-label-txt">강력(방화)</span>
              <InputField2 v-model.number="crime.arson" type="number" min="0" :clearable="false" aria-label="강력(방화)" size="sm" class="!space-y-0" input-class="w-30" />
            </div>
          </div>
        </InfoField>

        <!-- 소계는 위 입력의 합이라 결과만 보여준다 -->
        <InfoField label="범죄 소계">
          <InputField2 :model-value="crimeSubtotal" type="number" readonly :clearable="false" aria-label="범죄 소계" size="sm" class="!space-y-0 w-full" input-class="w-full" />
        </InfoField>
        <InfoField label="강력범죄 소계">
          <InputField2 :model-value="violentCrimeSubtotal" type="number" readonly :clearable="false" aria-label="강력범죄 소계" size="sm" class="!space-y-0 w-full" input-class="w-full" />
        </InfoField>
      </InfoTable>
    </section>

    <section class="lp-section" aria-labelledby="ref-report-heading">
      <h2 id="ref-report-heading" class="lp-heading-md lp-section-title">112신고 통계</h2>
      <InfoTable :columns="2" size="130">
        <InfoField label="Code 1">
          <InputField2 v-model.number="report.code1" type="number" min="0" :clearable="false" aria-label="Code 1" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="Code 2">
          <InputField2 v-model.number="report.code2" type="number" min="0" :clearable="false" aria-label="Code 2" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="합계" full>
          <InputField2 :model-value="reportTotal" type="number" readonly :clearable="false" aria-label="112신고 합계" size="sm" class="!space-y-0 w-full" input-class="w-full" />
        </InfoField>
      </InfoTable>
    </section>

    <section class="lp-section" aria-labelledby="ref-population-heading">
      <h2 id="ref-population-heading" class="lp-heading-md lp-section-title">인구,사회학적 통계</h2>
      <InfoTable :columns="2" size="170">
        <InfoField label="지피면적">
          <InputField2 v-model.number="population.landArea" type="number" min="0" :clearable="false" aria-label="지피면적" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="면적">
          <InputField2 v-model.number="population.area" type="number" min="0" :clearable="false" aria-label="면적" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="인구밀도">
          <InputField2 v-model.number="population.density" type="number" min="0" :clearable="false" aria-label="인구밀도" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="전년인구">
          <InputField2 v-model.number="population.prevPopulation" type="number" min="0" :clearable="false" aria-label="전년인구" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="인구이동">
          <InputField2 v-model.number="population.migration" type="number" min="0" :clearable="false" aria-label="인구이동" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="기초생활수급자수">
          <InputField2 v-model.number="population.basicLivingCount" type="number" min="0" :clearable="false" aria-label="기초생활수급자수" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="기초생활수급자">
          <InputField2 v-model.number="population.basicLiving" type="number" min="0" :clearable="false" aria-label="기초생활수급자" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="전체세대">
          <InputField2 v-model.number="population.households" type="number" min="0" :clearable="false" aria-label="전체세대" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="1인가구 비율">
          <InputField2 v-model.number="population.singleHouseholdRate" type="number" min="0" :clearable="false" aria-label="1인가구 비율" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="1인세대">
          <InputField2 v-model.number="population.singleHouseholds" type="number" min="0" :clearable="false" aria-label="1인세대" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="외국인 비율">
          <InputField2 v-model.number="population.foreignerRate" type="number" min="0" :clearable="false" aria-label="외국인 비율" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="등록 외국인">
          <InputField2 v-model.number="population.registeredForeigners" type="number" min="0" :clearable="false" aria-label="등록 외국인" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="관리대상자수">
          <InputField2 v-model.number="population.managedTargets" type="number" min="0" :clearable="false" aria-label="관리대상자수" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="우범자수">
          <InputField2 v-model.number="population.exOffenders" type="number" min="0" :clearable="false" aria-label="우범자수" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField for="ref-entertainment-note" label="풍속업소">
          <InputField2
            id="ref-entertainment-note"
            v-model="population.entertainmentTotalNote"
            size="sm"
            class="!space-y-0"
            input-class="w-40"
          />
        </InfoField>
        <InfoField label="신상정보등록대상자수">
          <InputField2 v-model.number="population.registeredIdentityTargets" type="number" min="0" :clearable="false" aria-label="신상정보등록대상자수" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="인구">
          <InputField2 v-model.number="population.population" type="number" min="0" :clearable="false" aria-label="인구" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField>
        </InfoField>
      </InfoTable>

      <InfoTable :columns="2" size="130" class="form-rest lp-table-gap">
        <InfoField label="유흥주점">
          <InputField2 v-model.number="entertainment.bar" type="number" min="0" :clearable="false" aria-label="유흥주점" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="노래연습장">
          <InputField2 v-model.number="entertainment.karaokeRoom" type="number" min="0" :clearable="false" aria-label="노래연습장" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="단란주점">
          <InputField2 v-model.number="entertainment.pub" type="number" min="0" :clearable="false" aria-label="단란주점" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="게임제공업">
          <InputField2 v-model.number="entertainment.gameArcade" type="number" min="0" :clearable="false" aria-label="게임제공업" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="숙박업">
          <InputField2 v-model.number="entertainment.lodging" type="number" min="0" :clearable="false" aria-label="숙박업" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="무도학원">
          <InputField2 v-model.number="entertainment.danceAcademy" type="number" min="0" :clearable="false" aria-label="무도학원" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="이용업">
          <InputField2 v-model.number="entertainment.barbershop" type="number" min="0" :clearable="false" aria-label="이용업" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField label="무도장">
          <InputField2 v-model.number="entertainment.danceHall" type="number" min="0" :clearable="false" aria-label="무도장" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>

        <InfoField label="비디오감상실">
          <InputField2 v-model.number="entertainment.videoRoom" type="number" min="0" :clearable="false" aria-label="비디오감상실" size="sm" class="!space-y-0" input-class="w-40" />
        </InfoField>
        <InfoField>
        </InfoField>
        <InfoField label="풍속업소 합계" full>
          <InputField2 :model-value="entertainmentTotal" type="number" readonly :clearable="false" aria-label="풍속업소 합계" size="sm" class="!space-y-0 w-full" input-class="w-full" />
        </InfoField>

      </InfoTable>
    </section>
  </ScrollWrapper>

  <UploadDialog v-model:open="uploadOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDiagnosisReference, yearOptions, townOptions } from './composable/PM-PUB-0111'
import UploadDialog from './components/UploadDialog.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0111' })

// LNB: publicSafetyMenu items[0] = '범죄예방진단' > '참고사항'
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 0, activeChild: '참고사항' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '범죄예방진단' },
  { label: '참고사항' },
]

const {
  department,
  advancedSearchOpen,
  year,
  town,
  crime,
  report,
  population,
  entertainment,
  crimeSubtotal,
  violentCrimeSubtotal,
  reportTotal,
  entertainmentTotal,
} = useDiagnosisReference()

const dialog = useDialog()

/* 양식/엑셀 파일 생성과 업로드는 개발팀 연동 대상이라 화면단에서는 안내만 낸다 */
async function onDownloadTemplate() {
  await dialog.alert({ title: '양식다운로드는 연동 후 제공됩니다.', btnCancel: '확인' })
}
async function onDownloadExcel() {
  await dialog.alert({ title: '엑셀다운로드는 연동 후 제공됩니다.', btnCancel: '확인' })
}
/* 업로드는 팝업(참고사항 업로드)으로 받는다 — Figma 11213:88495 */
const uploadOpen = ref(false)
function onUpload() {
  uploadOpen.value = true
}

async function onSave() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0111',
  label: '참고사항',
  path: '/views/pub/PM-PUB-0111',
  componentName: 'PmPub0111',
  closable: true,
})
</script>
