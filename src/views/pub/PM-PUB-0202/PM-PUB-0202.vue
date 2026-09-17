<template>
  <PageHeader>
    <template #left>
      <PageTitle title="아동학대" />
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

  <LayoutSplit :count="2" :widths="[54, 46]" :min-widths="[38, 34]">
    <template #layout-1>
      <LayoutPanel title="아동학대 현황">
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
          placeholder="조회된 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="상세정보">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <Alert state="warning" title="작성 시 유의사항">
          <ol class="lp-bullet-list">
            <li>피해아동을 행위자와 분리한 상태에서 작성.</li>
            <li>육안 또는 피해아동진술 등으로 확인된 부분만 기록(필요시 문서 · 사진 · 동영상 등 확보)</li>
            <li>
              [신체적 학대] 직접적으로 신체에 가해, 도구를 사용해 신체를 가해하는 행위, 완력을 사용해
              신체 위협, 유해한 물질로 신체에 가해<br >
              [성적 학대] 성적 노출, 성적 만족을 위한 아동관찰, 성교행위, 성매매 혹은 매개행위등.
            </li>
            <li>
              [정서적 학대] 정식전 폭력이나 강혹해우이(언어적 폭력, 공포 분위기 조성, 집 밖에 세워두는
              행위, 집 밖으로 내쫓음, 잠을 재우지 않는 행위 등)<br >
              [방임] 물리적 방임(의식주 미제공, 불결한 환경, 위험한 상태에 방치, 출생신고 하지 않음,
              의료 · 교육적 방임등<br >
              [유기] 버리거나, 보호 없이 떠나는 행위 등
            </li>
          </ol>
        </Alert>

        <!-- ── 01 신고정보 ─────────────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-report-heading">
          <div class="lp-row-between lp-section-title">
            <h3 id="abuse-report-heading" class="lp-heading-md">신고정보</h3>
            <Button type="button" variant="tertiary" size="sm" @click="onPrint">인쇄</Button>
          </div>

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

            <InfoField label="접수번호" for="abuse-receipt-no">
              <div class="lp-unit-row">
                <InputField2 id="abuse-receipt-no" v-model="detail.receiptNo" size="sm" class="!space-y-0" input-class="w-50" />
                <Button type="button" variant="secondary" size="sm" @click="openReport112">112신고 조회</Button>
              </div>
            </InfoField>

            <InfoField label="신고일시" for="abuse-report-date">
              <div class="lp-unit-row">
                <DatePicker id="abuse-report-date" v-model="detail.reportDate" size="sm" input-class="w-40" />
                <InputField2 v-model="detail.reportTime" size="sm" aria-label="신고 시각" placeholder="00:00" class="!space-y-0" input-class="w-25" />
              </div>
            </InfoField>

            <InfoField label="신고이력" for="abuse-report-count">
              <div class="lp-unit-row">
                <InputField2 id="abuse-report-count" v-model="detail.reportCount" size="sm" type="number" class="!space-y-0" input-class="w-20" />
                <span>회</span>
                <span class="lp-label-text">* 현재 신고 포함</span>
              </div>
            </InfoField>

            <InfoField>
              <template #label>신고자</template>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.reporterVictim" label="피해아동" />
                <Checkbox v-model="detail.reporterFamily" label="가족" />
                <Checkbox v-model="detail.reporterAnonymous" label="익명" />
                <Checkbox v-model="detail.reporterEtc.checked" label="기타" />
                <InputField2
                  v-model="detail.reporterEtc.text"
                  size="sm"
                  aria-label="신고자 기타"
                  :disabled="!detail.reporterEtc.checked"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.reporterMandatory.checked" label="신고의무자" />
                <span aria-hidden="true">( 직업군</span>
                <InputField2
                  v-model="detail.reporterMandatory.text"
                  size="sm"
                  aria-label="신고의무자 직업군"
                  :disabled="!detail.reporterMandatory.checked"
                  class="!space-y-0"
                  input-class="w-50"
                />
                <span aria-hidden="true">)</span>
              </div>
            </InfoField>

            <InfoField label="신고내용" for="abuse-report-content">
              <TextareaField id="abuse-report-content" v-model="detail.reportContent" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
            </InfoField>
          </InfoTable>
        </section>

        <!-- ── 02 신상정보 ─────────────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-person-heading">
          <h3 id="abuse-person-heading" class="lp-heading-md lp-section-title">신상정보</h3>

          <h4 class="lp-label-text lp-section-title">1. 피해아동</h4>
          <AbusePersonFields
            :person="detail.victim"
            id-prefix="abuse-victim"
            legend="피해아동"
            @search-address="onAddressSearch"
          />

          <h4 class="lp-label-text lp-section-title lp-table-gap">2. 학대행위자</h4>
          <AbusePersonFields
            :person="detail.offender"
            id-prefix="abuse-offender"
            legend="학대행위자"
            show-relation
            @search-address="onAddressSearch"
          />
        </section>

        <!-- ── 03 발생정보 ─────────────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-occur-heading">
          <h3 id="abuse-occur-heading" class="lp-heading-md lp-section-title">발생정보</h3>
          <InfoTable :columns="1" size="90">
            <InfoField label="발생일시" for="abuse-occurred-date">
              <div class="lp-unit-row">
                <DatePicker id="abuse-occurred-date" v-model="detail.occurredDate" size="sm" input-class="w-40" />
                <InputField2 v-model="detail.occurredTime" size="sm" aria-label="발생 시각" placeholder="00:00" class="!space-y-0" input-class="w-25" />
              </div>
            </InfoField>
          </InfoTable>

          <h4 class="lp-label-text lp-section-title lp-table-gap ac">발생장소</h4>
          <FlexRow>
            <FlexCol>
              <section aria-labelledby="abuse-home-heading">
                <h5 id="abuse-home-heading" class="lp-label-text lp-section-title ac">가정(내)</h5>
                <div class="lp-form-box">
                  <p class="lp-label-text">아동학대 외 가정폭력 여부</p>
                  <RadioGroup v-model="detail.domesticViolence" class="lp-unit-row" aria-label="아동학대 외 가정폭력 여부">
                    <RadioGroupItem value="yes" label="유" />
                    <RadioGroupItem value="no" label="무" />
                    <RadioGroupItem value="unknown" label="확인불가" />
                  </RadioGroup>
                </div>
              </section>
            </FlexCol>
            <FlexCol>
              <section aria-labelledby="abuse-outside-heading">
                <h5 id="abuse-outside-heading" class="lp-label-text lp-section-title ac">가정(외)</h5>
                <div class="lp-form-box">
                  <RadioGroup v-model="detail.outsidePlace" aria-label="가정 외 발생장소">
                    <div class="lp-unit-row">
                      <RadioGroupItem value="institution" label="기관/시설" />
                      <InputField2 v-model="detail.outsideInstitution" size="sm" aria-label="기관/시설명" :disabled="detail.outsidePlace !== 'institution'" class="!space-y-0 flex-1" input-class="w-full" />
                    </div>
                    <div class="lp-unit-row">
                      <RadioGroupItem value="public" label="공공장소" />
                      <InputField2 v-model="detail.outsidePublic" size="sm" aria-label="공공장소명" :disabled="detail.outsidePlace !== 'public'" class="!space-y-0 flex-1" input-class="w-full" />
                    </div>
                    <div class="lp-unit-row">
                      <RadioGroupItem value="etc" label="기타" />
                      <InputField2 v-model="detail.outsideEtc" size="sm" aria-label="발생장소 기타" :disabled="detail.outsidePlace !== 'etc'" class="!space-y-0 flex-1" input-class="w-full" />
                    </div>
                  </RadioGroup>
                </div>
              </section>
            </FlexCol>
          </FlexRow>

          <InfoTable :columns="1" size="90" class="lp-table-gap">
            <InfoField label="CCTV">
              <RadioGroup v-model="detail.cctv" :class="infoStyles['info-table-radio']" aria-label="CCTV 유무">
                <RadioGroupItem value="yes" label="유" />
                <RadioGroupItem value="no" label="무" />
              </RadioGroup>
            </InfoField>
          </InfoTable>
        </section>

        <!-- ── 04 현장확인 ─────────────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-scene-heading">
          <div class="lp-row-between lp-section-title">
            <h3 id="abuse-scene-heading" class="lp-heading-md">현장확인</h3>
            <p class="form-note">* 만6세 이하 영유아의 경우, 보다 세심한 확인이 필요</p>
          </div>

          <InfoTable :columns="1" size="110">
            <InfoField label="1. 신체적 학대">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.toolUsed.checked" label="도구이용" />
                <span aria-hidden="true">( 도구종류 · 행위</span>
                <InputField2
                  v-model="detail.toolUsed.text"
                  size="sm"
                  aria-label="도구종류 · 행위"
                  :disabled="!detail.toolUsed.checked"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
                <span aria-hidden="true">)</span>
              </div>
            </InfoField>
          </InfoTable>

          <!-- 부위 8칸은 시안에서 좌우 두 줄로 흐른다 -->
          <InfoTable :columns="2" size="110" class="form-rest">
            <InfoField v-for="part in bodyParts" :key="part.id" :label="part.label">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.bodyParts[part.id].checked" :aria-label="`${part.label} 확인`" />
                <InputField2
                  v-model="detail.bodyParts[part.id].text"
                  size="sm"
                  :aria-label="`${part.label} 내용`"
                  :disabled="!detail.bodyParts[part.id].checked"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </InfoField>
          </InfoTable>

          <InfoTable :columns="1" size="110" class="form-rest">
            <InfoField label="기타사항" for="abuse-physical-note">
              <TextareaField
                id="abuse-physical-note"
                v-model="detail.physicalNote"
                class="w-full !space-y-0"
                textarea-class="w-full"
                :height="90"
                placeholder="내용을 입력하세요"
              />
            </InfoField>
          </InfoTable>
          <p class="form-note">
            * 상처 발생 경위에 대해 아동과 행위자 진술이 다르거나 / 기타 피해의 부연설명 등을 상세히 기재
          </p>

          <InfoTable :columns="1" size="110" class="lp-table-gap">
            <InfoField label="2. 성적 학대">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.sexualContact" label="신체접촉" />
                <Checkbox v-model="detail.sexualExposure" label="성적노출" />
                <Checkbox v-model="detail.sexualCoercion" label="강요" />
                <Checkbox v-model="detail.sexualTrade" label="성매매(매개강요)" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.sexualEtc.checked" label="기타" />
                <InputField2 v-model="detail.sexualEtc.text" size="sm" aria-label="성적 학대 기타" :disabled="!detail.sexualEtc.checked" class="!space-y-0 flex-1" input-class="w-full" />
              </div>
            </InfoField>

            <InfoField label="3. 정서적 학대">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.emotionalAbuse" label="폭업/위협/강요" />
                <Checkbox v-model="detail.emotionalConfine" label="감금/억제" />
                <Checkbox v-model="detail.emotionalExposure" label="가정폭력에 노출" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.emotionalEtc.checked" label="기타" />
                <InputField2 v-model="detail.emotionalEtc.text" size="sm" aria-label="정서적 학대 기타" :disabled="!detail.emotionalEtc.checked" class="!space-y-0 flex-1" input-class="w-full" />
              </div>
            </InfoField>

            <InfoField label="4. 방임(유기)">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.neglectNoGuardian" label="보호자 부재(아동만 방치)" />
                <Checkbox v-model="detail.neglectHunger" label="장시간 굶주림(영양상태 불량)" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.neglectHygiene" label="아동 개인 위생불량 (예: 계절에 맞지 않는 옷/ 장기간 씻지 않음)" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.neglectEnvironment" label="거주 환경 위생불량" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.neglectEtc.checked" label="기타" />
                <InputField2 v-model="detail.neglectEtc.text" size="sm" aria-label="방임 기타" :disabled="!detail.neglectEtc.checked" class="!space-y-0 flex-1" input-class="w-full" />
              </div>
            </InfoField>
          </InfoTable>
        </section>

        <!-- ── 05 확인경로 ─────────────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-route-heading">
          <h3 id="abuse-route-heading" class="lp-heading-md lp-section-title">확인경로</h3>
          <div class="lp-form-box">
            <div class="lp-unit-row">
              <Checkbox v-model="detail.routeDirect" label="조사자 직접확인 진술" />
              <span aria-hidden="true">(</span>
              <!-- 직접확인을 켰을 때만 대상자를 고를 수 있다 -->
              <Checkbox v-model="detail.routeVictim" label="피해아동" :disabled="!detail.routeDirect" />
              <Checkbox v-model="detail.routeOffender" label="행위자" :disabled="!detail.routeDirect" />
              <Checkbox v-model="detail.routeReporter" label="신고자" :disabled="!detail.routeDirect" />
              <Checkbox v-model="detail.routeOther" label="기타관련자" :disabled="!detail.routeDirect" />
              <span aria-hidden="true">)</span>
              <Checkbox v-model="detail.routeCctv" label="CCTV" />
            </div>
            <div class="lp-unit-row">
              <Checkbox v-model="detail.routeEtc.checked" label="기타" />
              <InputField2 v-model="detail.routeEtc.text" size="sm" aria-label="확인경로 기타" :disabled="!detail.routeEtc.checked" class="!space-y-0 flex-1" input-class="w-full" />
            </div>
          </div>
        </section>

        <!-- ── 06 판단/조치/결과 ───────────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-judge-heading">
          <h3 id="abuse-judge-heading" class="lp-heading-md lp-section-title">판단/조치/결과</h3>
          <InfoTable :columns="1" size="110">
            <InfoField label="판단">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.judgeFalseReport" label="오인 또는 허위신고" />
                <Checkbox v-model="detail.judgeRepeated" label="신고이력 2회이상" />
                <Checkbox v-model="detail.judgeSevere" label="[성학대] 또는 [중상해]" label-class="notice-strong" />
              </div>
            </InfoField>

            <InfoField label="조치">
              <p class="notice-strong">
                APO 인계(전수합동조사) 피해아동 분리 등 조치 및 입건여부 반드시 검토
              </p>
            </InfoField>

            <InfoField label="결과">
              <Checkbox v-model="detail.resultOnSite" label="현장종결 (※기타에 판단사유 등 기재)" />
            </InfoField>

            <InfoField label="응급조치">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.emergency1" label="1호(제지)" />
                <Checkbox v-model="detail.emergency2" label="2호(격리)" />
                <Checkbox v-model="detail.emergency3" label="3호(보호시설 인도)" />
                <Checkbox v-model="detail.emergency4" label="4호(의료기관 인도)" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.emergency5" label="5호(연고자 인계)" />
                <span>5호관계 :</span>
                <InputField2 v-model="detail.emergency5Relation" size="sm" aria-label="5호 관계" :disabled="!detail.emergency5" class="!space-y-0" input-class="w-40" />
                <span>5호이름 :</span>
                <InputField2 v-model="detail.emergency5Name" size="sm" aria-label="5호 이름" :disabled="!detail.emergency5" class="!space-y-0" input-class="w-40" />
              </div>
            </InfoField>

            <InfoField label="기타사항" for="abuse-action-note">
              <TextareaField
                id="abuse-action-note"
                v-model="detail.actionNote"
                class="w-full !space-y-0"
                textarea-class="w-full"
                :height="90"
                placeholder="내용을 입력하세요"
              />
            </InfoField>

            <InfoField label="동행출동">
              <div class="lp-unit-row">
                <Checkbox v-model="detail.companyLocalGov" label="지자체(전담공무원)" />
                <Checkbox v-model="detail.companyChildAgency" label="아동보호전문기관" />
                <Checkbox v-model="detail.companyInvestigation" label="여청수사팀" />
                <Checkbox v-model="detail.companyApo" label="APO" />
              </div>
              <div class="lp-unit-row">
                <Checkbox v-model="detail.companyEtc.checked" label="기타" />
                <InputField2 v-model="detail.companyEtc.text" size="sm" aria-label="동행출동 기타" :disabled="!detail.companyEtc.checked" class="!space-y-0 flex-1" input-class="w-full" />
              </div>
            </InfoField>
          </InfoTable>
          <p class="form-note">
            * 조치결과 판단사유 <span class="notice-strong">(현장종결 시 필히 기재)</span> / APO · 여청수사팀 등 인계시 참고사항등
          </p>
        </section>

        <!-- ── (긴급) 아동 임시조치 내용 ────────────────── -->
        <section class="lp-section" aria-labelledby="abuse-urgent-heading">
          <div class="lp-row-between lp-section-title">
            <h3 id="abuse-urgent-heading" class="lp-heading-md">
              <Checkbox v-model="detail.urgentEnabled" label="(긴급) 아동 임시조치 내용" />
            </h3>
            <Button type="button" variant="tertiary" size="sm" @click="onPrint">인쇄</Button>
          </div>

          <!-- 체크를 켜야 아래를 채울 수 있다 -->
          <h4 class="lp-label-text lp-section-title">1. 가해자</h4>
          <InfoTable :columns="2" size="90">
            <InfoField label="성명">
              <span class="readonly-text">{{ detail.offender.name }}</span>
            </InfoField>
            <InfoField label="생년월일">
              <span class="readonly-text">{{ detail.offender.birthDate }}</span>
            </InfoField>
            <InfoField label="직업" for="abuse-urgent-job">
              <SelectField
                id="abuse-urgent-job"
                v-model="detail.urgentOffenderJob"
                :options="jobOptions"
                size="sm"
                trigger-class="w-full"
                class="!space-y-0 flex-1"
                placeholder="선택"
                :disabled="!detail.urgentEnabled"
              />
            </InfoField>
            <InfoField label="아동과의 관계" for="abuse-urgent-relation">
              <SelectField
                id="abuse-urgent-relation"
                v-model="detail.urgentOffenderRelation"
                :options="relationEtcOptions"
                size="sm"
                trigger-class="w-full"
                class="!space-y-0 flex-1"
                placeholder="선택"
                :disabled="!detail.urgentEnabled"
              />
            </InfoField>
            <InfoField label="주소지" full>
              <span class="readonly-text">{{ detail.offender.address }}</span>
            </InfoField>
          </InfoTable>

          <h4 class="lp-label-text lp-section-title lp-table-gap">2. 피해아동</h4>
          <InfoTable :columns="2" size="90">
            <InfoField label="성명">
              <span class="readonly-text">{{ detail.victim.name }}</span>
            </InfoField>
            <InfoField label="생년월일">
              <span class="readonly-text">{{ detail.victim.birthDate }}</span>
            </InfoField>
            <InfoField label="주소지" full>
              <span class="readonly-text">{{ detail.victim.address }}</span>
            </InfoField>
          </InfoTable>

          <InfoTable :columns="1" size="90" class="lp-table-gap">
            <InfoField label="통보일시" for="abuse-urgent-date">
              <div class="lp-unit-row">
                <DatePicker id="abuse-urgent-date" v-model="detail.urgentNoticeDate" size="sm" input-class="w-40" :disabled="!detail.urgentEnabled" />
                <SelectField
                  v-model="detail.urgentNoticeTime"
                  :options="noticeTimeOptions"
                  label="통보 시각"
                  label-class="sr-only"
                  size="sm"
                  trigger-class="w-30"
                  class="!space-y-0"
                  placeholder="선택"
                  :disabled="!detail.urgentEnabled"
                />
              </div>
            </InfoField>
            <InfoField label="통보장소" for="abuse-urgent-place">
              <InputField2
                id="abuse-urgent-place"
                v-model="detail.urgentNoticePlace"
                size="sm"
                :disabled="!detail.urgentEnabled"
                class="!space-y-0 flex-1"
                input-class="w-full"
              />
            </InfoField>
          </InfoTable>

          <h4 class="lp-label-text lp-section-title lp-table-gap">(긴급) 아동 임시조치 내용</h4>
          <div class="lp-form-box">
            <Checkbox
              v-model="detail.urgentMeasure1"
              :disabled="!detail.urgentEnabled"
              label="피해아동 또는 가정구성원의 주거로부터 퇴거 등 격리(제19조제1항제1호)"
            />
            <Checkbox
              v-model="detail.urgentMeasure2"
              :disabled="!detail.urgentEnabled"
              label="피해아동 또는 가정구성원의 주거, 학교또는 보호시설 등에서 100미터 이내의 접근금지 (제19조제1항제2호)"
            />
            <div class="lp-unit-row">
              <span class="lp-label-text">기준지</span>
              <SelectField
                v-model="detail.urgentMeasure2Base"
                :options="baseLocationOptions"
                label="기준지"
                label-class="sr-only"
                size="sm"
                trigger-class="w-30"
                class="!space-y-0"
                placeholder="선택"
                :disabled="!detail.urgentMeasure2"
              />
              <InputField2
                v-model="detail.urgentMeasure2BaseEtc"
                size="sm"
                aria-label="기준지 상세"
                :disabled="!detail.urgentMeasure2"
                class="!space-y-0 flex-1"
                input-class="w-full"
              />
            </div>
            <Checkbox
              v-model="detail.urgentMeasure3"
              :disabled="!detail.urgentEnabled"
              label="피해아동 또는 가정구성원에 대한 「전기통신기본법」제2조제1호의 전기통신을 이용한 접근 금지 (제19조제1항제3호)"
            />
          </div>
        </section>
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <Report112Dialog />
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
import { Button } from '@/components/custom/button'
import Alert from '@/components/custom/alert/Alert.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import FlexRow from '@/components/custom/flex-grid/FlexRow.vue'
import FlexCol from '@/components/custom/flex-grid/FlexCol.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import AbusePersonFields from './components/AbusePersonFields.vue'
import Report112Dialog from './components/Report112Dialog.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useChildAbuseSurvey,
  ChildAbuseKey,
  receiptRouteOptions,
  relationEtcOptions,
  jobOptions,
  noticeTimeOptions,
  baseLocationOptions,
  bodyParts,
  type ChildAbuseRow,
} from './composable/PM-PUB-0202'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0202' })

// LNB: publicSafetyMenu items[1] = '여성청소년' > '아동학대'
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 1, activeChild: '아동학대' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '여성청소년' },
  { label: '아동학대' },
]

/* 112신고 조회 팝업이 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useChildAbuseSurvey()
provide(ChildAbuseKey, store)
const {
  department,
  advancedSearchOpen,
  receiptFrom,
  receiptTo,
  searchRoute,
  rows,
  activeRowKey,
  detail,
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
]

/** 지금 우측 서식에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: ChildAbuseRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as ChildAbuseRow
  selectRow(data.rowKey)
}

/* 주소검색·인쇄는 개발팀 연동 대상이라 화면단에서는 안내만 낸다 */
async function onAddressSearch() {
  await dialog.alert({ title: '주소검색은 연동 후 제공됩니다.', btnCancel: '확인' })
}
async function onPrint() {
  await dialog.alert({ title: '인쇄는 연동 후 제공됩니다.', btnCancel: '확인' })
}


async function onSave() {
  const message = validateDetail()
  if (message) {
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}
useBottomTabSetup({
  value: 'PM-PUB-0202',
  label: '아동학대',
  path: '/views/pub/PM-PUB-0202',
  componentName: 'PmPub0202',
  closable: true,
})
</script>
