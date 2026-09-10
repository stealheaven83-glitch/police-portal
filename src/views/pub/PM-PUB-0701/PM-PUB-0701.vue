<template>
  <PageHeader>
    <template #left>
      <PageTitle title="물리력 사용 보고서" />
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
        <SelectField
          v-model="periodType"
          label="기간구분"
          :options="periodTypeOptions"
          size="sm"
          trigger-class="w-25"
        />
        <DateRangePicker
          v-model:from="periodFrom"
          v-model:to="periodTo"
          label="기간"
          from-label="기간 시작일"
          to-label="기간 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField
          v-model="userType"
          label="사용자구분"
          :options="userTypeOptions"
          size="sm"
          trigger-class="w-30"
        />
        <InputField2 v-model="searchName" label="성명" size="sm" input-class="w-40" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions space-between">
    <p class="form-note">
      * 물리력 사용 보고서의 상세 조회는 작성자 본인 및 작성자가 지정한 1, 2, 3차 결재자만 가능합니다.
    </p>
    <div class="btn-wrap-group">
      <!-- Figma button_link — 아이콘 + 붉은 링크 텍스트 -->
      <button type="button" class="lp-link-danger" @click="requirementOpen = true">
        <Icon name="systemInfo" :size="20" />
        [필수] 보고서 작성 요건 확인
      </button>
      <Button type="button" variant="tertiary" size="sm" @click="onPrint">인쇄</Button>
    </div>
  </div>

  <!-- 시안 13462:140738 — 목록과 보고서가 한 화면에 나란히 놓인다(좌 758 / 우 800) -->
  <!-- 시안: 목록 758 / 보고서 800 (내용 폭 1558 기준 48.6 : 51.4) -->
  <LayoutSplit :count="2" :widths="[48.6, 51.4]" :min-widths="[32, 40]">
    <template #layout-1>
      <LayoutPanel title="물리력 사용 보고서 목록">
        <template #actions>
          <Button type="button" variant="tertiary" size="sm" @click="onDeleteSelected">선택삭제</Button>
        </template>

        <TabulatorGrid
          ref="gridRef"
          :columns="columns"
          :data="rows"
          class="flex-1"
          height="100%"
          select-mode="checkbox"
          :row-class="rowClass"
          placeholder="조회된 보고서가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
          @row-selection-changed="onSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="물리력 사용 보고서">
        <template #actions>
          <Button type="button" variant="secondary" size="sm" @click="createReport">신규</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <ScrollWrapper>
          <!-- 시안 13685:117683 — 초록 안내 박스(체크 아이콘 + 제목 + 3줄) -->
          <Alert state="success" title="보고서 작성 요령">
            <ol class="lp-guide-list">
              <li>보고서는 대상자별로 작성합니다.</li>
              <li>해당 항목에 중복사항이 있으면 모두 체크합니다.</li>
              <li>권총 사격(경고 또는 실제 사격)이나 전자충격기(전극침)는 발사가 불발에 그치더라도 보고서를 작성합니다.</li>
            </ol>
          </Alert>

          <section class="lp-section" aria-labelledby="force-approval-heading">
            <div class="lp-row-between lp-section-title">
              <h3 id="force-approval-heading" class="lp-heading-md">결재선</h3>
              <Button type="button" variant="tertiary" size="sm" @click="onSelectApprovalLine">결재선 선택</Button>
            </div>
            <p class="form-note lp-note-gap">* 결재선 선택 버튼을 클릭하여 결재자를 선택합니다.</p>

            <TableWrapper
              :columns="approvalColumns"
              :items="approvalItems"
              :selectable="false"
              caption="결재선 — 기안자와 차수별 결재자"
            >
              <template v-for="step in approvalLine" :key="step.role" #[`cell-${step.role}`]="{ item }">
                <SelectField
                  v-if="item.kind === 'person' && step.selectable"
                  v-model="nextApprover"
                  :label="step.role"
                  label-class="sr-only"
                  :options="approverOptions"
                  size="sm"
                  trigger-class="w-full"
                  class="!space-y-0"
                  placeholder="선택"
                />
                <span v-else-if="item.kind === 'person'">{{ step.person }}</span>

                <span v-else-if="step.action === 'none'" :class="statusClass(step.status)">
                  {{ step.status }}
                </span>
                <span v-else-if="step.action === 'withdraw'" class="lp-unit-row">
                  <span :class="statusClass(step.status)">{{ step.status }}</span>
                  <Button type="button" variant="tertiary" size="xs" padding="8" @click="onWithdraw(step)">
                    결재회수
                  </Button>
                </span>
                <span v-else class="lp-unit-row">
                  <Button type="button" variant="tertiary" size="xs" padding="8" @click="onReject(step)">반려</Button>
                  <Button type="button" variant="tertiary" size="xs" padding="8" @click="onApprove(step)">결재</Button>
                </span>
              </template>
            </TableWrapper>
          </section>

          <section class="lp-section" aria-labelledby="force-use-heading">
            <h3 id="force-use-heading" class="lp-heading-md lp-section-title">사용 물리력</h3>
            <div class="lp-form-box">
              <!--
                총기류는 체크했을 때만 일련번호·개수를 적는다(기획서 13-3-1).
                라벨-입력이 한 줄에 세 쌍이라 InfoTable 이 아니라 줄 단위로 늘어놓는다.
              -->
              <div v-for="gun in gunForceOptions" :key="gun.id" class="lp-field-row">
                <Checkbox v-model="detail.forces[gun.id]" :label="gun.label" class="w-50" />
                <InputField2
                  v-model="detail.gunSerial[gun.id]"
                  :label="`${gun.label} 총기 일련번호`"
                  size="sm"
                  :disabled="!detail.forces[gun.id]"
                  class="!space-y-0"
                  input-class="w-40"
                />
                <span class="lp-unit-row">
                  <InputField2
                    v-model="detail.gunCount[gun.id]"
                    :label="`${gun.label} 사용 개수`"
                    size="sm"
                    :disabled="!detail.forces[gun.id]"
                    class="!space-y-0"
                    input-class="w-20"
                  />
                  <span class="lp-unit-text">{{ gun.unit }}</span>
                </span>
              </div>

              <div class="lp-field-row">
                <Checkbox v-for="force in forceOptions" :key="force.id" v-model="detail.forces[force.id]" :label="force.label" />
              </div>

              <div class="lp-field-row">
                <Checkbox v-model="detail.forceEtc" label="기타" />
                <InputField2
                  v-model="detail.forceEtcText"
                  label="사용 물리력 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.forceEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-damage-heading">
            <h3 id="force-damage-heading" class="lp-heading-md lp-section-title">피해 상황</h3>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <Checkbox v-for="damage in damageOptions" :key="damage.id" v-model="detail.damages[damage.id]" :label="damage.label" />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.damageEtc" label="기타" />
                <InputField2
                  v-model="detail.damageEtcText"
                  label="피해 상황 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.damageEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-user-heading">
            <div class="lp-row-between lp-section-title">
              <h3 id="force-user-heading" class="lp-heading-md">사용자 정보</h3>
              <p class="form-note">* 사용자는 최대 4명 선택 가능합니다.</p>
            </div>

            <TableWrapper
              :columns="userColumns"
              :items="userRows"
              :selectable="false"
              caption="물리력을 사용한 사람"
            >
              <!-- 빈 자리는 더하기, 등록된 사람은 빼기 (기획서 13-5-1·5-2) -->
              <template #cell-manage="{ item }">
                <Button
                  v-if="item.name"
                  type="button"
                  variant="tertiary"
                  size="xs"
                  padding="10"
                  @click="removeReportUser(item.no)"
                >
                  －<span class="sr-only">{{ item.no }}번 사용자 빼기</span>
                </Button>
                <Button v-else type="button" variant="tertiary" size="xs" padding="10" @click="onAddUser">
                  ＋<span class="sr-only">사용자 추가</span>
                </Button>
              </template>
            </TableWrapper>
          </section>

          <section class="lp-section" aria-labelledby="force-target-heading">
            <h3 id="force-target-heading" class="lp-heading-md lp-section-title">대상자 정보</h3>

            <h4 class="lp-label-text lp-section-title">1. 기본 정보</h4>
            <InfoTable :columns="2" size="100">
              <InfoField label="성명" for="force-target-name">
                <InputField2 id="force-target-name" v-model="detail.targetName" size="sm" class="!space-y-0 w-full" input-class="w-full" />
              </InfoField>
              <InfoField label="성별">
                <RadioGroup v-model="detail.targetGender" class="lp-unit-row" aria-label="성별">
                  <RadioGroupItem value="male" label="남" />
                  <RadioGroupItem value="female" label="여" />
                </RadioGroup>
              </InfoField>
              <InfoField label="생년월일" for="force-target-birth">
                <DatePicker id="force-target-birth" v-model="detail.targetBirth" size="sm" input-class="w-full" class="w-full" />
              </InfoField>
              <InfoField label="나이" for="force-target-age">
                <!-- 기획서 14-2-2 — 숫자로 입력한다 -->
                <InputField2 id="force-target-age" v-model="detail.targetAge" size="sm" inputmode="numeric" class="!space-y-0 w-full" input-class="w-full" />
              </InfoField>
              <InfoField label="연락처" for="force-target-phone" full>
                <InputField2 id="force-target-phone" v-model="detail.targetPhone" size="sm" inputmode="numeric" class="!space-y-0 w-full" input-class="w-full" />
              </InfoField>
              <InfoField label="주소" full>
                <!-- 기획서 14-2-3 — 주소 검색 팝업은 연동 대상이라 버튼만 둔다 -->
                <div class="lp-field lp-flex-fill">
                  <InputField2
                    v-model="detail.targetAddress"
                    label="주소"
                    label-class="sr-only"
                    size="sm"
                    readonly
                    placeholder="주소검색"
                    class="!space-y-0 w-full"
                    input-class="w-full"
                    :icon="searchIcon"
                    icon-label="주소 검색"
                    search
                    @icon-click="onSearchAddress"
                  />
                  <InputField2
                    v-model="detail.targetAddressDetail"
                    label="상세주소"
                    label-class="sr-only"
                    size="sm"
                    placeholder="상세주소"
                    class="!space-y-0 w-full"
                    input-class="w-full"
                  />
                </div>
              </InfoField>
            </InfoTable>

            <div class="lp-row-between lp-section-title lp-table-gap">
              <h4 class="lp-label-text">2. 정신/신체 상태</h4>
              <!-- 기획서 14-3-1 — 켜면 아래 항목을 전부 잠근다 -->
              <Checkbox v-model="detail.noSpecial" label="특이사항 없음" />
            </div>
            <InfoTable :columns="1" size="100">
              <InfoField label="정신상태" class="lp-info-nested" col-class="no-padding">
                <InfoTable :columns="1" size="120">
                  <InfoField label="주취">
                    <RadioGroup v-model="detail.drunk" :disabled="detail.noSpecial" class="lp-field-row" aria-label="주취">
                      <RadioGroupItem v-for="option in drunkOptions" :key="option.value" :value="option.value" :label="option.label" />
                    </RadioGroup>
                  </InfoField>
                  <InfoField label="정신질환">
                    <div class="lp-field-row">
                      <Checkbox
                        v-for="option in mentalIllnessOptions"
                        :key="option.id"
                        v-model="detail.mentalIllness[option.id]"
                        :label="option.label"
                        :disabled="detail.noSpecial"
                      />
                    </div>
                  </InfoField>
                  <InfoField label="중독">
                    <div class="lp-field-row">
                      <Checkbox
                        v-for="option in addictionOptions"
                        :key="option.id"
                        v-model="detail.addiction[option.id]"
                        :label="option.label"
                        :disabled="detail.noSpecial"
                      />
                    </div>
                  </InfoField>
                </InfoTable>
              </InfoField>
            </InfoTable>

            <InfoTable :columns="1" size="100" class="lp-table-gap">
              <InfoField label="신체상태" class="lp-info-nested" col-class="no-padding">
                <InfoTable :columns="1" size="120">
                  <InfoField label="체격">
                    <RadioGroup v-model="detail.build" :disabled="detail.noSpecial" class="lp-field-row" aria-label="체격">
                      <RadioGroupItem v-for="option in buildOptions" :key="option.value" :value="option.value" :label="option.label" />
                    </RadioGroup>
                  </InfoField>
                  <InfoField label="장애">
                    <div class="lp-field-row">
                      <Checkbox
                        v-for="option in disabilityOptions"
                        :key="option.id"
                        v-model="detail.disability[option.id]"
                        :label="option.label"
                        :disabled="detail.noSpecial"
                      />
                    </div>
                  </InfoField>
                  <InfoField label="기왕증">
                    <div class="lp-field-row">
                      <Checkbox
                        v-for="option in medicalHistoryOptions"
                        :key="option.id"
                        v-model="detail.medicalHistory[option.id]"
                        :label="option.label"
                        :disabled="detail.noSpecial"
                      />
                    </div>
                  </InfoField>
                </InfoTable>
              </InfoField>
            </InfoTable>

            <h4 class="lp-label-text lp-section-title lp-table-gap">3. 흉기 휴대</h4>
            <div class="lp-form-box">
              <RadioGroup v-model="detail.hasWeapon" class="lp-field-row" aria-label="흉기 휴대">
                <RadioGroupItem value="yes" label="흉기 있음" />
                <RadioGroupItem value="no" label="흉기 없음" />
              </RadioGroup>

              <!-- 기획서 15-1-2 — '흉기 있음' 일 때만 종류를 고를 수 있다 -->
              <div class="lp-field-row">
                <Checkbox
                  v-for="option in weaponOptions"
                  :key="option.id"
                  v-model="detail.weapons[option.id]"
                  :label="option.label"
                  :disabled="detail.hasWeapon !== 'yes'"
                />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.weaponEtc" label="기타" :disabled="detail.hasWeapon !== 'yes'" />
                <InputField2
                  v-model="detail.weaponEtcText"
                  label="흉기 종류 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="detail.hasWeapon !== 'yes' || !detail.weaponEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>

              <!-- 기획서 15-1-3 — 기타 소지 물건은 흉기 유무와 관계없이 입력한다 -->
              <div class="lp-field-row">
                <span class="lp-dot-item">기타 소지 물건</span>
                <InputField2
                  v-model="detail.weaponOther"
                  label="기타 소지 물건"
                  label-class="sr-only"
                  size="sm"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-scene-heading">
            <h3 id="force-scene-heading" class="lp-heading-md lp-section-title">현장 상황</h3>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <Checkbox v-for="option in sceneOptions" :key="option.id" v-model="detail.scenes[option.id]" :label="option.label" />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.sceneEtc" label="기타" />
                <InputField2
                  v-model="detail.sceneEtcText"
                  label="현장 상황 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.sceneEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-detail-heading">
            <h3 id="force-detail-heading" class="lp-heading-md lp-section-title">상황 (상세)</h3>

            <h4 class="lp-label-text lp-section-title">1. 대상자 행위</h4>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <Checkbox v-for="option in behaviorOptions" :key="option.id" v-model="detail.behaviors[option.id]" :label="option.label" />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.behaviorEtc" label="기타" />
                <InputField2
                  v-model="detail.behaviorEtcText"
                  label="대상자 행위 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.behaviorEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>

            <h4 class="lp-label-text lp-section-title lp-table-gap">2. 도주 상황</h4>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <Checkbox v-for="option in escapeOptions" :key="option.id" v-model="detail.escapes[option.id]" :label="option.label" />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.escapeEtc" label="기타" />
                <InputField2
                  v-model="detail.escapeEtcText"
                  label="도주 상황 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.escapeEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-when-heading">
            <h3 id="force-when-heading" class="lp-heading-md lp-section-title">사용일시</h3>
            <div class="lp-form-box">
              <!-- 기획서 16-2 — 주간·야간·심야는 택 1 이고, 날짜·시간은 그와 무관하게 적는다 -->
              <div class="lp-field-row">
                <RadioGroup v-model="detail.timeZone" class="lp-field-row" aria-label="사용 시간대">
                  <RadioGroupItem v-for="option in timeZoneOptions" :key="option.value" :value="option.value" :label="option.label" />
                </RadioGroup>
                <DatePicker
                  v-model="detail.usedDate"
                  label="날짜"
                  size="sm"
                  input-class="w-40"
                />
                <InputField2
                  v-model="detail.usedTime"
                  label="시간"
                  size="sm"
                  placeholder="예) 12:00"
                  class="!space-y-0"
                  input-class="w-30"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-place-heading">
            <h3 id="force-place-heading" class="lp-heading-md lp-section-title">사용 장소</h3>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <Checkbox v-for="option in placeOptions" :key="option.id" v-model="detail.places[option.id]" :label="option.label" />
              </div>
              <div class="lp-field-row">
                <Checkbox v-model="detail.placeEtc" label="기타" />
                <InputField2
                  v-model="detail.placeEtcText"
                  label="사용 장소 기타"
                  label-class="sr-only"
                  size="sm"
                  :disabled="!detail.placeEtc"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-body-heading">
            <h3 id="force-body-heading" class="lp-heading-md lp-section-title">사용 신체 부위</h3>
            <!-- 시안(13724:121520)은 '기존 이미지 사용' 자리표시다 — 이미지가 오면 그때 넣는다 -->
            <div class="lp-placeholder-box">기존 이미지 사용</div>
          </section>

          <section class="lp-section" aria-labelledby="force-warning-heading">
            <h3 id="force-warning-heading" class="lp-heading-md lp-section-title">경고</h3>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <RadioGroup v-model="detail.warning" class="lp-field-row" aria-label="경고 여부">
                  <RadioGroupItem value="none" label="없음" />
                  <RadioGroupItem value="yes" label="있음" />
                </RadioGroup>
                <!-- 기획서 17-1 — '없음' 이면 아래 항목을 잠근다 -->
                <Checkbox v-model="detail.warnings.verbal" label="구두경고" :disabled="detail.warning !== 'yes'" />
                <span class="lp-unit-row">
                  <InputField2
                    v-model="detail.warningVerbalCount"
                    label="구두경고 횟수"
                    label-class="sr-only"
                    size="sm"
                    inputmode="numeric"
                    :disabled="detail.warning !== 'yes' || !detail.warnings.verbal"
                    class="!space-y-0"
                    input-class="w-20"
                  />
                  <span class="lp-unit-text">회</span>
                </span>
                <Checkbox v-model="detail.warnings.blank" label="공포탄" :disabled="detail.warning !== 'yes'" />
                <Checkbox v-model="detail.warnings.live" label="실탄 경고사격" :disabled="detail.warning !== 'yes'" />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-witness-heading">
            <div class="lp-row-between lp-section-title">
              <h3 id="force-witness-heading" class="lp-heading-md">목격자</h3>
              <p class="form-note">* 목격자가 있는 경우 목격자 수를 숫자로만 입력하며 인적사항을 작성합니다.</p>
            </div>
            <div class="lp-form-box">
              <div class="lp-field-row">
                <RadioGroup v-model="detail.witness" class="lp-field-row" aria-label="목격자 여부">
                  <RadioGroupItem value="none" label="없음" />
                  <RadioGroupItem value="yes" label="있음" />
                </RadioGroup>
                <span class="lp-unit-row">
                  <InputField2
                    v-model="detail.witnessCount"
                    label="목격자 수"
                    label-class="sr-only"
                    size="sm"
                    inputmode="numeric"
                    :disabled="detail.witness !== 'yes'"
                    class="!space-y-0"
                    input-class="w-20"
                  />
                  <span class="lp-unit-text">명</span>
                </span>
                <InputField2
                  v-model="detail.witnessInfo"
                  label="인적사항"
                  size="sm"
                  :disabled="detail.witness !== 'yes'"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </div>
            </div>
          </section>

          <section class="lp-section" aria-labelledby="force-reason-heading">
            <div class="lp-row-between lp-section-title">
              <h3 id="force-reason-heading" class="lp-heading-md">사용 경위 (사용자 의견)</h3>
              <p class="form-note">* 입력 가능한 글자수는 최대 4000자 입니다.</p>
            </div>
            <TextareaField
              v-model="detail.reason"
              aria-label="사용 경위"
              class="w-full !space-y-0"
              textarea-class="w-full"
              :height="160"
              :maxlength="4000"
              show-count
              :placeholder="reasonPlaceholder"
            />
          </section>

          <section class="lp-section" aria-labelledby="force-followup-heading">
            <div class="lp-row-between lp-section-title">
              <h3 id="force-followup-heading" class="lp-heading-md">사후조치</h3>
              <p class="form-note">* 입력 가능한 글자수는 최대 3000자 입니다.</p>
            </div>
            <TextareaField
              v-model="detail.followUp"
              aria-label="사후조치"
              class="w-full !space-y-0"
              textarea-class="w-full"
              :height="140"
              :maxlength="3000"
              show-count
              :placeholder="followUpPlaceholder"
            />
          </section>

          <section class="lp-section" aria-labelledby="force-note-heading">
            <h3 id="force-note-heading" class="lp-heading-md lp-section-title">참고사항</h3>
            <TextareaField
              v-model="detail.note"
              aria-label="참고사항"
              class="w-full !space-y-0"
              textarea-class="w-full"
              :height="120"
              :placeholder="notePlaceholder"
            />
          </section>
        </ScrollWrapper>
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <RequirementDialog v-model:open="requirementOpen" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { Icon } from '@/components/custom/icon'
import { Alert } from '@/components/custom/alert'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import RequirementDialog from './components/RequirementDialog.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'

import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useForceUseReport,
  periodTypeOptions,
  userTypeOptions,
  approverOptions,
  gunForceOptions,
  forceOptions,
  damageOptions,
  drunkOptions,
  mentalIllnessOptions,
  addictionOptions,
  buildOptions,
  disabilityOptions,
  medicalHistoryOptions,
  weaponOptions,
  sceneOptions,
  behaviorOptions,
  escapeOptions,
  timeZoneOptions,
  placeOptions,
  MAX_REPORT_USERS,
  type ApprovalStep,
  type ForceReportRow,
} from './composable/PM-PUB-0701'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0701' })

/*
 * LNB: publicSafetyMenu items[5] = '보고서'.
 * ⚠ 프리셋 children 은 '보고서 목록' 하나뿐인데 시안 LNB 는 '물리력 사용 보고서 /
 *   기타 영상기기 사용 보고서' 두 개다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 5, activeChild: '물리력 사용 보고서' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보고서' },
  { label: '물리력사용보고서' },
]

const {
  department,
  advancedSearchOpen,
  periodType,
  periodFrom,
  periodTo,
  userType,
  searchName,
  rows,
  activeRowKey,
  approvalLine,
  nextApprover,
  reportUsers,
  detail,
  selectRow,
  createReport,
  addReportUser,
  removeReportUser,
  validateDetail,
} = useForceUseReport()

const dialog = useDialog()

/* 주소 검색 아이콘 — public/ 에 있는 퍼블 원본을 그대로 쓴다(PC-COM-2204 와 같은 경로) */
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/* ------------------------------------------------------------------ *
 * 좌측 목록
 * ------------------------------------------------------------------ */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 80, hozAlign: 'center' },
  { title: '결재', field: 'approval', width: 130, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '사용자', field: 'user', width: 120, hozAlign: 'center' },
  { title: '대상자', field: 'target', width: 120, hozAlign: 'center' },
  { title: '사용일시', field: 'usedAt', width: 170, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/** 지금 우측 보고서에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: ForceReportRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as ForceReportRow
  selectRow(data.rowKey)
}

/** @row-selection-changed 는 데이터가 아니라 RowComponent 배열을 넘긴다(CLAUDE.md §6) */
function onSelectionChanged(selected: any[]) {
  selectedCount.value = selected.length
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: '삭제할 보고서를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  gridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/** 작성 요건 안내 팝업(시안 13724:123136) */
const requirementOpen = ref(false)

/* 인쇄는 시안에 대상 화면이 없다 — 연동 대상이라 안내만 낸다 */
async function onPrint() {
  await dialog.alert({ title: '인쇄는 연동 후 제공됩니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 결재선 — 역할이 열, 사람/상태가 행인 표라 TabulatorGrid 가 아니라 정적 표다
 * ------------------------------------------------------------------ */
const approvalColumns = computed(() =>
  approvalLine.value.map((step) => ({ key: step.role, label: step.role })),
)

/** 첫 줄은 사람, 둘째 줄은 상태·조작 — 열마다 슬롯으로 그린다 */
const approvalItems = [{ kind: 'person' }, { kind: 'status' }]

/** 결재완료는 초록, 나머지는 기본색(시안) */
function statusClass(status: string) {
  return status === '결재완료' ? 'lp-status-done' : undefined
}

/** 기획서 13-2-1 — 결재선 선택 팝업은 공통 팝업이라 아직 없다(연동 대상) */
async function onSelectApprovalLine() {
  await dialog.alert({ title: '결재선 선택은 연동 후 제공됩니다.', btnCancel: '확인' })
}

/* 결재 처리는 서버 몫이라 화면단에서는 상태만 바꿔 보여준다 */
function setStep(target: ApprovalStep, status: string, action: ApprovalStep['action']) {
  approvalLine.value = approvalLine.value.map((step) =>
    step.role === target.role ? { ...step, status, action } : step,
  )
}
async function onWithdraw(step: ApprovalStep) {
  const result = await dialog.confirm({ title: '결재를 회수하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(step, '결재대기', 'decide')
  await dialog.alert({ title: '회수되었습니다.', btnCancel: '확인' })
}
async function onReject(step: ApprovalStep) {
  const result = await dialog.confirm({ title: '반려하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(step, '반려', 'none')
  await dialog.alert({ title: '반려되었습니다.', btnCancel: '확인' })
}
async function onApprove(step: ApprovalStep) {
  const result = await dialog.confirm({ title: '결재하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(step, '결재완료', 'none')
  await dialog.alert({ title: '결재되었습니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 사용자 정보 — 시안은 빈 자리까지 4줄이 늘 보이고, 빈 줄에는 + 버튼이 있다
 * ------------------------------------------------------------------ */
const userColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'dept', label: '소속' },
  { key: 'rank', label: '계급', width: '90px' },
  { key: 'name', label: '이름', width: '110px' },
  { key: 'manage', label: '관리', width: '90px' },
]

/** 등록된 사용자 + 빈 자리 = 항상 4줄 */
const userRows = computed(() => {
  const filled = reportUsers.value
  const blanks = Array.from({ length: MAX_REPORT_USERS - filled.length }, (_, i) => ({
    no: filled.length + i + 1,
    dept: '',
    rank: '',
    name: '',
  }))
  return [...filled, ...blanks]
})

/** 기획서 13-5-2 — 사용자 선택 팝업은 시안에 없다(연동 대상) */
async function onAddUser() {
  if (reportUsers.value.length >= MAX_REPORT_USERS) {
    await dialog.alert({ title: `사용자는 최대 ${MAX_REPORT_USERS}명까지 등록할 수 있습니다.`, btnCancel: '확인' })
    return
  }
  addReportUser()
}

/** 기획서 14-2-3 — 주소 검색 팝업은 연동 대상이라 안내만 낸다 */
async function onSearchAddress() {
  await dialog.alert({ title: '주소 검색은 연동 후 제공됩니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 서술형 칸 — 시안의 작성 예시를 워터마크(placeholder)로 보여준다(기획서 17-3·4·5)
 * ------------------------------------------------------------------ */
const reasonPlaceholder = [
  '※ 무기장구 · 장구 · 완력 등 물리력을 사용하게 된 이유와 판단의 근거를 상세히 기술',
  '예 1) 대상자가 술에 만취하여 파출소내로 들어와 행패를 부리고 동료인 김OO 경장(女)에게 발길질을 하는 등 공격 행위를 하여 소지하고 있던 전자충격기를 1회 발사하여 제압한 것임',
  '예 2) △ 대상자는 몸무게가 100kg 이상 나가는 거구였고 △ 소내에는 두명의 경찰관만 있었으며, △ 구두경고에도 공격을 멈추지 않은 가운데 △ 즉각적인 경력지원이 불가능한 상황이었으므로 전자충격기 사용이 가장 적합한 것으로 판단함',
].join('\n')

const followUpPlaceholder = [
  '예 1) 대퇴부에 총상을 입어 최대한 출혈을 억제한 후 즉시 119 지원받아 가까운 병원 응급실로 후송',
  '※ 부상자 병원 후송 시 보호자 통지 여부 기재',
  '예 2) 테이저 전극침이 얼굴에 꽂혀 우선 안정을 취하게 한 후 가까운 보건소로 데려가 제거',
  '예 3) 수갑을 채워 일단 제압하였으나 계속해서 몸부림을 치며 소란을 피우고 있고 이를 근무자 2명이 계속해서 체포술로 억제하기가 어려워 포승을 하체에 채움',
].join('\n')

const notePlaceholder = [
  '예 1) 권총 모델명, 발사 탄환 수, 전자충격기 일련번호 등',
  '예 2) 감독자, 동료 등의 적절성 평가 의견',
].join('\n')

async function onSave() {
  const message = validateDetail()
  if (message) {
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 기획서 11-3-2 ① — 저장 전 컨펌창을 먼저 띄운다
  const result = await dialog.confirm({ title: '수정된 내용을 저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0701',
  label: '물리력사용보고서',
  path: '/views/pub/PM-PUB-0701',
  componentName: 'PmPub0701',
  closable: true,
})
</script>
