<template>
  <PageHeader>
    <template #left>
      <PageTitle title="통합 판단조사표" />
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
        <DateRangePicker
          v-model:from="receiptFrom"
          v-model:to="receiptTo"
          label="접수일자"
          from-label="접수일자 시작일"
          to-label="접수일자 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField
          v-model="searchRoute"
          label="접수경로"
          :options="receiptRouteOptions"
          size="sm"
          trigger-class="w-30"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <p class="form-note end">
      * 개인정보를 공무수행 목적외 사적으로 조회 또는 유출하여 타인의 비밀을 침해하거나 누설할 경우
      <span class="notice-strong">5년이하의 징역 또는 5천만원 이하의 벌금</span>에 처해집니다.
    </p>
  </div>

  <LayoutSplit :count="2" :widths="[56, 44]" :min-widths="[38, 34]">
    <template #layout-1>
      <LayoutPanel title="통합 판단조사표 현황">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="createRow">신규</Button>
        </template>

        <!-- 컬럼이 많아 가로 스크롤이 필요하다 — fitColumns 가 아니라 fitDataFill(CLAUDE.md §6) -->
        <TabulatorGrid
          :columns="listColumns"
          :data="rows"
          class="flex-1"
          height="100%"
          layout="fitDataFill"
          :row-class="rowClass"
          placeholder="조회된 조사표가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="긴급임시 · 긴급응급 조치">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <ScrollWrapper>
          <Alert state="warning" title="조사 유의사항">
            <ol class="lp-bullet-list">
              <li>(쌍방) 쌍방 가정폭력인 경우 양 대상자에 대해 작성하십시오.</li>
              <li>(사실혼) 사실혼에 해당되는 경우 『사실혼 체크리스트』를 작성하십시오.</li>
              <li>
                (아동학대) 아동학대 정황이 발견되는 경우 『아동학대 체크리스트』를 활용, 세심하게 채점하십시오.
              </li>
            </ol>
            <p class="lp-answer-note">
              ※ 만 18세 미만 아동에 대한 폭행(눈에 띄는 상처 · 멍 등) · 유기 · 방임 등
            </p>
          </Alert>

          <section class="lp-section" aria-labelledby="judgement-basic-heading">
            <h3 id="judgement-basic-heading" class="lp-heading-md lp-section-title">기본 정보</h3>
            <InfoTable :columns="1" size="90">
              <InfoField>
                <template #label>접수경로<span :class="infoStyles.requiredDot" /></template>
                <RadioGroup v-model="detail.receiptRoute" :class="infoStyles['info-table-radio']" aria-label="접수경로">
                  <RadioGroupItem value="report112" label="112신고" />
                  <RadioGroupItem value="complaint" label="고소장접수" />
                  <RadioGroupItem value="etc" label="기타" />
                </RadioGroup>
                <InputField2
                  v-model="detail.receiptRouteEtc"
                  size="sm"
                  aria-label="접수경로 기타"
                  :disabled="detail.receiptRoute !== 'etc'"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </InfoField>

              <InfoField label="접수번호" for="judgement-receipt-no">
                <div class="lp-unit-row">
                  <InputField2
                    id="judgement-receipt-no"
                    v-model="detail.receiptNo"
                    size="sm"
                    class="!space-y-0"
                    input-class="w-50"
                  />
                  <Button type="button" variant="secondary" size="sm" @click="openReport112">
                    112신고 조회
                  </Button>
                </div>
              </InfoField>

              <InfoField label="신고일시" for="judgement-report-date">
                <div class="lp-unit-row">
                  <DatePicker id="judgement-report-date" v-model="detail.reportDate" size="sm" input-class="w-40" />
                  <InputField2
                    v-model="detail.reportTime"
                    size="sm"
                    aria-label="신고 시각"
                    placeholder="00:00"
                    class="!space-y-0"
                    input-class="w-25"
                  />
                </div>
              </InfoField>

              <InfoField label="신고내용" for="judgement-report-content">
                <TextareaField
                  id="judgement-report-content"
                  v-model="detail.reportContent"
                  class="w-full !space-y-0"
                  textarea-class="w-full"
                  :height="90"
                />
              </InfoField>

              <InfoField>
                <template #label>사건유형</template>
                <div class="lp-unit-row">
                  <Checkbox v-model="detail.caseTypes.domestic" label="가정폭력" />
                  <span aria-hidden="true">(</span>
                  <!-- 가정폭력을 켰을 때만 하위 유형을 고를 수 있다 -->
                  <Checkbox v-model="detail.caseTypes.mutual" label="쌍방" :disabled="!detail.caseTypes.domestic" />
                  <Checkbox v-model="detail.caseTypes.commonLaw" label="사실혼" :disabled="!detail.caseTypes.domestic" />
                  <Checkbox v-model="detail.caseTypes.child" label="아동" :disabled="!detail.caseTypes.domestic" />
                  <span aria-hidden="true">)</span>
                  <Checkbox v-model="detail.caseTypes.stalking" label="스토킹" />
                </div>
              </InfoField>
            </InfoTable>

            <!-- 피해자 · 가해자는 같은 항목을 나란히 채우는 자유 배치라 FlexRow 를 쓴다(§1) -->
            <FlexRow class="lp-table-gap">
              <FlexCol>
                <section aria-labelledby="judgement-victim-heading">
                  <h4 id="judgement-victim-heading" class="lp-label-text lp-section-title ac">피해자</h4>
                  <InfoTable :columns="1" size="80">
                    <InfoField label="성명" for="judgement-victim-name">
                      <InputField2 id="judgement-victim-name" v-model="detail.victim.name" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
                    </InfoField>
                    <InfoField label="성별">
                      <RadioGroup v-model="detail.victim.gender" :class="infoStyles['info-table-radio']" aria-label="피해자 성별">
                        <RadioGroupItem value="male" label="남" />
                        <RadioGroupItem value="female" label="여" />
                      </RadioGroup>
                    </InfoField>
                    <InfoField label="생년월일" for="judgement-victim-birth">
                      <DatePicker id="judgement-victim-birth" v-model="detail.victim.birthDate" size="sm" class="flex-1" input-class="w-full" />
                    </InfoField>
                    <InfoField label="연락처" for="judgement-victim-phone">
                      <InputField2 id="judgement-victim-phone" v-model="detail.victim.phone" size="sm" type="tel" clearable class="!space-y-0 flex-1" input-class="w-full" />
                    </InfoField>
                  </InfoTable>
                </section>
              </FlexCol>
              <FlexCol>
                <section aria-labelledby="judgement-offender-heading">
                  <h4 id="judgement-offender-heading" class="lp-label-text lp-section-title ac">가해자</h4>
                  <InfoTable :columns="1" size="80">
                    <InfoField label="성명" for="judgement-offender-name">
                      <InputField2 id="judgement-offender-name" v-model="detail.offender.name" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
                    </InfoField>
                    <InfoField label="성별">
                      <RadioGroup v-model="detail.offender.gender" :class="infoStyles['info-table-radio']" aria-label="가해자 성별">
                        <RadioGroupItem value="male" label="남" />
                        <RadioGroupItem value="female" label="여" />
                      </RadioGroup>
                    </InfoField>
                    <InfoField label="생년월일" for="judgement-offender-birth">
                      <DatePicker id="judgement-offender-birth" v-model="detail.offender.birthDate" size="sm" class="flex-1" input-class="w-full" />
                    </InfoField>
                    <InfoField label="연락처" for="judgement-offender-phone">
                      <InputField2 id="judgement-offender-phone" v-model="detail.offender.phone" size="sm" type="tel" clearable class="!space-y-0 flex-1" input-class="w-full" />
                    </InfoField>
                  </InfoTable>
                </section>
              </FlexCol>
            </FlexRow>
          </section>

          <section class="lp-section" aria-labelledby="judgement-survey-heading">
            <h3 id="judgement-survey-heading" class="lp-heading-md lp-section-title">통합 판단조사표 평가문항</h3>

            <template v-for="group in surveyGroups" :key="group">
              <h4 class="lp-section-title">
                <Badge color="grayLighter" size="md">{{ surveyGroupLabel[group] }}</Badge>
              </h4>
              <ol class="lp-survey-list lp-table-gap">
                <li v-for="q in questionsOf(group)" :key="q.id" class="lp-survey-item">
                  <span>{{ questionNo(q.id) }}. {{ q.text }}</span>
                  <RadioGroup
                    :model-value="detail.answers[q.id]"
                    class="lp-unit-row lp-survey-choice"
                    :aria-label="`${questionNo(q.id)}번 문항`"
                    @update:model-value="(v: any) => (detail.answers[q.id] = String(v))"
                  >
                    <RadioGroupItem value="yes" label="예" />
                    <RadioGroupItem value="no" label="아니오" />
                  </RadioGroup>
                </li>
              </ol>
            </template>

            <h4 class="lp-section-title lp-table-gap">
              <Badge color="grayLighter" size="md">위험성 총점</Badge>
            </h4>
            <p class="lp-score-box">점수 <b>{{ riskScore }}</b> 점</p>
            <p class="form-note notice-strong">
              * 3점 이상부터 긴급임시조치 또는 긴급응급조치 적극 권장함
            </p>
          </section>

          <section class="lp-section" aria-labelledby="judgement-risk-heading">
            <h3 id="judgement-risk-heading" class="lp-heading-md lp-section-title">위험성 판단</h3>
            <InfoTable :columns="1" size="90">
              <InfoField label="최종판단">
                <span class="lp-flex-fill">긴급임시 · 긴급응급조치를 결정하시겠습니까?</span>
                <RadioGroup v-model="detail.finalDecision" :class="infoStyles['info-table-radio']" aria-label="최종판단">
                  <RadioGroupItem value="yes" label="예" />
                  <RadioGroupItem value="no" label="아니오" />
                </RadioGroup>
              </InfoField>
            </InfoTable>

            <p class="form-note lp-table-gap">
              * 평가문항 총점에 따른 기준과 다른 결정을 하는 경우(3점 이상임에도 조치 미실시 또는 3점
              미만임에도 조치 결정)에는 판단 사유를 반드시 적습니다.
            </p>

            <InfoTable :columns="1" size="90">
              <InfoField label="판단사유" for="judgement-reason">
                <TextareaField
                  id="judgement-reason"
                  v-model="detail.decisionReason"
                  class="w-full !space-y-0"
                  textarea-class="w-full"
                  :height="110"
                  :maxlength="4000"
                  show-count
                  placeholder="내용을 입력하세요"
                />
              </InfoField>
            </InfoTable>
            <ul class="lp-bullet-list">
              <li>
                총점 3점 이상임에도 조치 미실시한 경우, 피해자가 단순히 조치를 원하지 않는다는 의사 외에
                구체적인 사유를 적습니다.
              </li>
              <li>
                총점 3점 미만임에도 조치 결정 사유 예시: 가해자가 흉기를 휴대·사용하여 위험성이 높음 /
                치료가 필요한 상해를 입힘 등
              </li>
            </ul>

            <InfoTable :columns="1" size="90" class="lp-table-gap">
              <InfoField label="추가 위험요인" for="judgement-extra-risk">
                <TextareaField
                  id="judgement-extra-risk"
                  v-model="detail.extraRiskFactor"
                  class="w-full !space-y-0"
                  textarea-class="w-full"
                  :height="110"
                  :maxlength="4000"
                  show-count
                  placeholder="내용을 입력하세요"
                />
              </InfoField>
            </InfoTable>
            <ul class="lp-bullet-list">
              <li>
                평가 문항(10개) 외에 수사단계에서 고려할 수 있는 가해자의 위험요인이 확인되는 경우에는
                관련 내용을 적습니다.
              </li>
            </ul>
          </section>

          <section class="lp-section" aria-labelledby="judgement-writer-heading">
            <h3 id="judgement-writer-heading" class="lp-heading-md lp-section-title">작성자</h3>
            <InfoTable :columns="1" size="90">
              <InfoField label="소속">
                <span class="readonly-text">본청 범죄예방대응 지역경찰운영과 지역경찰기획계</span>
              </InfoField>
              <InfoField label="이름">
                <span class="readonly-text">OOO</span>
              </InfoField>
              <InfoField label="직위">
                <span class="readonly-text">무기계약직</span>
              </InfoField>
            </InfoTable>
          </section>
        </ScrollWrapper>
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <Report112Dialog />
  <PendingReportDialog />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import Alert from '@/components/custom/alert/Alert.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import FlexRow from '@/components/custom/flex-grid/FlexRow.vue'
import FlexCol from '@/components/custom/flex-grid/FlexCol.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import Report112Dialog from './components/Report112Dialog.vue'
import PendingReportDialog from './components/PendingReportDialog.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useJudgementSurvey,
  JudgementSurveyKey,
  receiptRouteOptions,
  surveyQuestions,
  surveyGroupLabel,
  type JudgementRow,
  type SurveyGroup,
} from './composable/PM-PUB-0201'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0201' })

// LNB: publicSafetyMenu items[1] = '여성청소년' > '통합판단조사표'
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 1, activeChild: '통합판단조사표' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '여성청소년' },
  { label: '통합판단조사표' },
]

/* 팝업 2개(112신고 조회 / 미도착·미종결 목록)가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useJudgementSurvey()
provide(JudgementSurveyKey, store)
const {
  department,
  advancedSearchOpen,
  receiptFrom,
  receiptTo,
  searchRoute,
  rows,
  activeRowKey,
  detail,
  riskScore,
  selectRow,
  createRow,
  openReport112,
  validateDetail,
} = store

const dialog = useDialog()

const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '접수번호', field: 'receiptNo', width: 160, hozAlign: 'center' },
  { title: '접수일자', field: 'receiptDate', width: 120, hozAlign: 'center' },
  { title: '접수경로', field: 'receiptRoute', width: 110, hozAlign: 'center' },
  { title: '사건내용', field: 'caseSummary', width: 180, hozAlign: 'center' },
  { title: '피해자 성명', field: 'victimName', width: 110, hozAlign: 'center' },
  { title: '피해자 전화번호', field: 'victimPhone', width: 150, hozAlign: 'center' },
  { title: '피해 점수', field: 'score', width: 100, hozAlign: 'center' },
]

/** 지금 우측 조치 화면에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: JudgementRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as JudgementRow
  selectRow(data.rowKey)
}

/* 평가문항 — 시안대로 세 묶음으로 나눠 보여준다 */
const surveyGroups: SurveyGroup[] = ['victim', 'victim-police', 'police']
function questionsOf(group: SurveyGroup) {
  return surveyQuestions.filter((q) => q.group === group)
}
/** 문항 번호는 묶음과 무관하게 1~10 으로 이어진다(시안) */
function questionNo(id: string) {
  return surveyQuestions.findIndex((q) => q.id === id) + 1
}

async function onSave() {
  const message = validateDetail()
  if (message) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0201',
  label: '통합판단조사표',
  path: '/views/pub/PM-PUB-0201',
  componentName: 'PmPub0201',
  closable: true,
})
</script>
