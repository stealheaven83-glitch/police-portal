<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Search Wrapper</h1>
          <p class="text-muted-foreground text-sm mt-1">
            검색영역 컴포넌트 <code>custom/search/SearchWrapper.vue</code> 의 케이스별 샘플입니다.
            슬롯 4개(<code>#department</code> · <code>#form</code> · <code>#btns</code> · <code>#topRightSection</code>)와
            prop 2개(<code>collapsible</code> · <code>no-background</code>)의 조합으로 갈립니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-10 animate-in fade-in duration-500 scrollbar-hide">
        <!-- 1. department + collapsible -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">1. #department + collapsible — 부서 행 + '상세조회' 토글</h2>
          <p class="text-sm text-muted-foreground">
            부서 셀렉트 옆에 '상세조회' 버튼이 생기고 <code>#form</code> 은 접혔다 펼쳐진다(기본 접힘).
            <code>v-model:expanded</code> 로 상위에서 열림 상태를 제어할 수 있다. PM-PUB-0113 · PC-LPO-0801.
          </p>
          <SearchWrapper collapsible v-model:expanded="expanded1">
            <template #department>
              <span class="dept-name">부서</span>
              <DepartmentCascadeSelect v-model="department" size="sm" />
            </template>
            <template #form>
              <div class="search-area">
                <DateRangePicker
                  v-model:from="dateFrom"
                  v-model:to="dateTo"
                  label="등록기간"
                  from-label="등록기간 시작일"
                  to-label="등록기간 종료일"
                  size="sm"
                  input-class="w-40"
                />
                <SelectField v-model="region" label="지역" :options="regionOptions" placeholder="선택" size="sm" trigger-class="w-40" />
              </div>
            </template>
            <template #btns>
              <Button type="button" variant="secondary" size="sm">조회</Button>
            </template>
          </SearchWrapper>
          <p class="text-xs text-muted-foreground">지금 상태: expanded = {{ expanded1 }}</p>
          <pre class="text-xs bg-muted p-3 rounded">&lt;SearchWrapper collapsible v-model:expanded="advancedSearchOpen"&gt;
  &lt;template #department&gt;…&lt;/template&gt;
  &lt;template #form&gt;…&lt;/template&gt;
  &lt;template #btns&gt;…&lt;/template&gt;
&lt;/SearchWrapper&gt;</pre>
        </section>

        <!-- 2. department + topRightSection (form 없음) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">2. #department + #topRightSection — 검색 폼 없이 한 줄</h2>
          <p class="text-sm text-muted-foreground">
            부서 셀렉트만 두고 오른쪽에 버튼을 놓는 형태. <code>#form</code> 이 없으니 회색 박스도 없다. PC-LPO-0202(근무지정표).
          </p>
          <SearchWrapper>
            <template #department>
              <span class="dept-name">부서</span>
              <DepartmentCascadeSelect v-model="department" size="sm" />
            </template>
            <template #topRightSection>
              <div class="search-btns">
                <div class="group-gap2">
                  <Button type="button" variant="tertiary2" size="sm">甲지 일괄 출력</Button>
                  <Button type="button" variant="tertiary2" size="sm">인쇄</Button>
                </div>
              </div>
            </template>
          </SearchWrapper>
          <pre class="text-xs bg-muted p-3 rounded">&lt;SearchWrapper&gt;
  &lt;template #department&gt;…&lt;/template&gt;
  &lt;template #topRightSection&gt;…&lt;/template&gt;
&lt;/SearchWrapper&gt;</pre>
        </section>

        <!-- 3. department + collapsible + topRightSection -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">3. #department + collapsible + #topRightSection</h2>
          <p class="text-sm text-muted-foreground">1번에 오른쪽 상단 버튼까지. 부서 행 오른쪽 끝에 버튼이 붙고, 폼은 아래로 접혔다 펼쳐진다.</p>
          <SearchWrapper collapsible v-model:expanded="expanded3">
            <template #department>
              <span class="dept-name">부서</span>
              <DepartmentCascadeSelect v-model="department" size="sm" />
            </template>
            <template #topRightSection>
              <div class="search-btns">
                <div class="group-gap2">
                  <Button type="button" variant="tertiary2" size="sm">엑셀다운로드</Button>
                  <Button type="button" variant="primary" size="sm">신규</Button>
                </div>
              </div>
            </template>
            <template #form>
              <div class="search-area">
                <SelectField v-model="region" label="지역" :options="regionOptions" placeholder="선택" size="sm" trigger-class="w-40" />
              </div>
            </template>
            <template #btns>
              <Button type="button" variant="secondary" size="sm">조회</Button>
            </template>
          </SearchWrapper>
          <pre class="text-xs bg-muted p-3 rounded">&lt;SearchWrapper collapsible v-model:expanded="advancedSearchOpen"&gt;
  &lt;template #department&gt;…&lt;/template&gt;
  &lt;template #topRightSection&gt;…&lt;/template&gt;
  &lt;template #form&gt;…&lt;/template&gt;
  &lt;template #btns&gt;…&lt;/template&gt;
&lt;/SearchWrapper&gt;</pre>
        </section>

        <!-- 4. form 만, 배경 없음 (department · btns 없음) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">4. #form + no-background — 부서·조회 버튼 없이 셀렉트만 (항상 펼침)</h2>
          <p class="text-sm text-muted-foreground">
            부서 슬롯이 없으면 접기 없이 항상 펼쳐진다. 지역 → 센터명처럼 앞 값에 따라 뒤 목록이 바뀌는 건
            전용 컴포넌트 없이 <code>SelectField</code> 둘 + <code>computed</code> 로 화면에서 직접 잇는다. PM-PUB-0411 · PC-PUB-0412 · PM-PUB-0409.
          </p>
          <SearchWrapper no-background>
            <template #form>
              <div class="search-area">
                <SelectField
                  v-model="regionFilter"
                  label="지역"
                  :options="regionOptions"
                  placeholder="선택"
                  size="sm"
                  trigger-class="w-40"
                />
                <SelectField
                  v-model="centerFilter"
                  label="센터명"
                  :options="centerFilterOptions"
                  placeholder="선택"
                  size="sm"
                  trigger-class="w-70"
                />
              </div>
            </template>
          </SearchWrapper>
          <pre class="text-xs bg-muted p-3 rounded">&lt;SearchWrapper no-background&gt;
  &lt;template #form&gt;…&lt;/template&gt;
&lt;/SearchWrapper&gt;</pre>
        </section>

        <!-- 5. form + btns (department 없음) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">5. #form + #btns — 부서 없이 검색 폼 + 조회 버튼 (항상 펼침)</h2>
          <p class="text-sm text-muted-foreground">
            기간 + 검색어 + 조회 버튼의 가장 흔한 조회 폼. <code>#btns</code> 슬롯에 넣은 버튼은 폼 오른쪽 끝에 붙는다.
          </p>
          <SearchWrapper>
            <template #form>
              <div class="search-area">
                <DateRangePicker
                  v-model:from="dateFrom"
                  v-model:to="dateTo"
                  label="검색기간"
                  from-label="검색기간 시작일"
                  to-label="검색기간 종료일"
                  size="sm"
                />
                <InputField2
                  v-model="keyword"
                  size="sm"
                  aria-label="검색어"
                  placeholder="검색어를 입력해주세요."
                  input-class="w-60"
                  clearable
                />
              </div>
            </template>
            <template #btns>
              <Button type="button" variant="secondary" size="sm">조회</Button>
            </template>
          </SearchWrapper>
          <pre class="text-xs bg-muted p-3 rounded">&lt;SearchWrapper&gt;
  &lt;template #form&gt;…&lt;/template&gt;
  &lt;template #btns&gt;…&lt;/template&gt;
&lt;/SearchWrapper&gt;</pre>
        </section>

        <!-- 주의 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">주의 — 되지 않는 조합</h2>
          <ul class="text-sm list-disc pl-5 space-y-1">
            <li>
              <code>#department</code> + <code>#form</code> 인데 <code>collapsible</code> 을 안 주면 <b>폼이 아예 안 보인다</b>
              (부서 슬롯이 있으면 폼은 '상세조회' 토글로만 열리게 돼 있다). 부서와 폼을 같이 쓰려면 <code>collapsible</code> 을 준다.
            </li>
            <li><code>no-background</code> 는 <code>#form</code> 영역에만 걸린다. <code>#department</code> 행은 원래 배경이 없다.</li>
          </ul>
        </section>

        <!-- ── 조회화면 밑 버튼영역 (.list-actions) ─────────────────────────── -->
        <div class="flex justify-between items-center pt-6">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">조회화면 밑 버튼영역</h1>
            <p class="text-muted-foreground text-sm mt-1">
              검색영역과 본문 사이에 놓는 <code>.list-actions</code> 줄. 왼쪽은 안내 문구나 제목, 오른쪽은 버튼 묶음이다.
            </p>
          </div>
        </div>

        <!-- 1. 안내 문구 여러 줄 + 버튼 (아래 정렬) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">1. 안내 문구 여러 줄 — 버튼을 아래에 맞춤(items-end)</h2>
          <div class="list-actions space-between items-end">
            <div class="list-actions-txt">
              <p>
                ＊ 출동업무수당 지급대상 자동체크는 매일 오전 08시~12시에 반영됩니다.
                12시 이후에 확인 후 작성하세요
              </p>
              <p>＊ 출동업무수당 자동체크 된 지급대상 사건과 임의등록 사건 만 표시됩니다.</p>
            </div>
            <div class="group-gap2">
              <Button type="button" variant="tertiary" size="sm">
                <Download :size="16" aria-hidden="true" />
                엑셀다운로드
              </Button>
              <Button type="button" variant="tertiary" size="sm">삭제</Button>
              <Button type="button" variant="tertiary2" size="sm">임의등록</Button>
              <Button type="button" variant="primary" size="sm">저장</Button>
            </div>
          </div>
        </section>

        <!-- 2. 안내 문구 한 줄 + 버튼 (가운데 정렬) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">2. 안내 문구 한 줄 — 왼쪽 텍스트 세로 중앙정렬(items-center)</h2>
          <div class="list-actions space-between items-center">
            <div class="list-actions-txt">
              <p>＊ 신규등록 시 근무구분 선택 창이 추가되었습니다. 구분 선택 시에 직접입력을 선택하면 기존과 동일하게 입력 가능합니다.</p>
            </div>
            <span class="group-gap3">
              <Button type="button" variant="tertiary2" size="sm">112누락정보</Button>
              <Button type="button" variant="tertiary2" size="sm">새로고침</Button>
              <Button type="button" variant="secondary" size="sm">추가</Button>
              <Button type="button" variant="primary" size="sm">저장</Button>
              <Button type="button" variant="tertiary2" size="sm">삭제</Button>
            </span>
          </div>
        </section>

        <!-- 3. 제목(라벨:값) + 버튼 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">3. 제목(라벨: 값) + 버튼</h2>
          <div class="list-actions space-between">
            <p class="list-actions-title"><span class="list-actions-part">부서:</span> 경찰청</p>
            <div class="group-gap3">
              <Button type="button" variant="tertiary2" size="sm">목록</Button>
              <Button type="button" variant="tertiary2" size="sm">삭제</Button>
              <Button type="button" variant="primary" size="sm">저장</Button>
            </div>
          </div>
        </section>

        <!-- ── 목록 위 승인자 줄 (.approver-bar) ─────────────────────────────── -->
        <div class="flex justify-between items-center pt-6">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">목록 위 승인자 줄</h1>
            <p class="text-muted-foreground text-sm mt-1">
              버튼 줄과 표 사이에 놓는 <code>.approver-bar</code> 테두리 상자(Figma 13092:99695 · 케이스 13092:100022).
              왼쪽 제목, 오른쪽에 <code>.approver-bar-item</code>(직책 · 이름 · 상태) 묶음을 <code>.lp-divider-v</code> 로 끊어 놓는다.
              이름 뒤 상태는 <b>승인일 → 미승인 → 승인 버튼</b> 중 하나만 온다. PC-LPO-0505.
            </p>
          </div>
        </div>

        <!-- A. 이름까지만 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">A. 이름까지만 — 상태 없음</h2>
          <div class="approver-bar">
            <h2 class="approver-bar-title">출동수당 승인자</h2>
            <div class="approver-bar-list">
              <div class="approver-bar-item">
                <span>지구대/파출소 (팀장/계장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
              </div>
              <span class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
              <div class="approver-bar-item">
                <span>경찰서(과장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
              </div>
            </div>
          </div>
        </section>

        <!-- B. 승인 버튼 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">B. 승인 버튼 — 팀장/계장이 승인 전이고 내가 승인권자</h2>
          <p class="text-sm text-muted-foreground">
            버튼은 <code>Button variant="secondary" size="xs" padding="12"</code>(시안 32 높이, 폭 107).
          </p>
          <div class="approver-bar">
            <h2 class="approver-bar-title">출동수당 승인자</h2>
            <div class="approver-bar-list">
              <div class="approver-bar-item">
                <span>지구대/파출소 (팀장/계장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <Button type="button" variant="secondary" size="xs" padding="12">출동수당 승인</Button>
              </div>
              <span class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
              <div class="approver-bar-item">
                <span>경찰서(과장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
              </div>
            </div>
          </div>
        </section>

        <!-- C. 승인일 + 미승인 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">C. 승인일 + 미승인 — 팀장/계장은 끝났고 과장은 아직</h2>
          <p class="text-sm text-muted-foreground">
            승인일은 <code>.approver-bar-done</code>(본문색), 미승인은 <code>.approver-bar-status</code>(<code>--Alert-danger-text</code>).
          </p>
          <div class="approver-bar">
            <h2 class="approver-bar-title">출동수당 승인자</h2>
            <div class="approver-bar-list">
              <div class="approver-bar-item">
                <span>지구대/파출소 (팀장/계장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <span class="approver-bar-done">2026-08-27 승인</span>
              </div>
              <span class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
              <div class="approver-bar-item">
                <span>경찰서(과장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <span class="approver-bar-status">미승인</span>
              </div>
            </div>
          </div>
        </section>

        <!-- D. 승인 버튼 + 미승인 (본 화면 기본) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">D. 승인 버튼 + 미승인 — PC-LPO-0505 본 화면 시안</h2>
          <div class="approver-bar">
            <h2 class="approver-bar-title">출동수당 승인자</h2>
            <div class="approver-bar-list">
              <div class="approver-bar-item">
                <span>지구대/파출소 (팀장/계장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <Button type="button" variant="secondary" size="xs" padding="12">출동수당 승인</Button>
              </div>
              <span class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
              <div class="approver-bar-item">
                <span>경찰서(과장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <span class="approver-bar-status">미승인</span>
              </div>
            </div>
          </div>
        </section>

        <!-- E. 승인일 + 승인 버튼 (경찰서 과장 승인 전) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">E. 승인일 + 승인 버튼 — 팀장/계장은 끝났고 과장이 승인권자</h2>
          <p class="text-sm text-muted-foreground">
            승인 버튼은 어느 쪽 묶음에도 올 수 있다. 팀장/계장이 먼저 승인하고 나면 과장 쪽에 버튼이 붙는 순서.
          </p>
          <div class="approver-bar">
            <h2 class="approver-bar-title">출동수당 승인자</h2>
            <div class="approver-bar-list">
              <div class="approver-bar-item">
                <span>지구대/파출소 (팀장/계장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <span class="approver-bar-done">2026-08-27 승인</span>
              </div>
              <span class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
              <div class="approver-bar-item">
                <span>경찰서(과장)</span>
                <b class="approver-bar-name">경정 홍길동</b>
                <Button type="button" variant="secondary" size="xs" padding="12">출동수당 승인</Button>
              </div>
            </div>
          </div>
          <pre class="text-xs bg-muted p-3 rounded">&lt;div class="approver-bar"&gt;
  &lt;h2 class="approver-bar-title"&gt;출동수당 승인자&lt;/h2&gt;
  &lt;div class="approver-bar-list"&gt;
    &lt;div class="approver-bar-item"&gt;
      &lt;span&gt;직책&lt;/span&gt;
      &lt;b class="approver-bar-name"&gt;이름&lt;/b&gt;
      &lt;!-- 아래 셋 중 하나만: 승인일 / 미승인 / 승인 버튼 --&gt;
      &lt;span class="approver-bar-done"&gt;2026-08-27 승인&lt;/span&gt;
      &lt;span class="approver-bar-status"&gt;미승인&lt;/span&gt;
      &lt;Button variant="secondary" size="xs" padding="12"&gt;출동수당 승인&lt;/Button&gt;
    &lt;/div&gt;
    &lt;span class="lp-divider-v approver-bar-divider" aria-hidden="true"&gt;&lt;/span&gt;
    &lt;div class="approver-bar-item"&gt;…&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</pre>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'

const regionOptions = [
  { label: '전체', value: 'all' },
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '대구', value: 'daegu' },
]

const region = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const keyword = ref('')
const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

const expanded1 = ref(false)
const expanded3 = ref(false)

/* 4번 — 지역 → 센터명 연동. 전용 컴포넌트 없이 computed 로 거르고 watch 로 되돌린다 */
const mockCenters = [
  { region: 'seoul', name: '주취자응급의료센터(서울동부병원)' },
  { region: 'seoul', name: '주취해소센터(서울의료원)' },
  { region: 'busan', name: '주취해소센터(부산의료원)' },
  { region: 'daegu', name: '주취해소센터(대구의료원)' },
]
const regionFilter = ref('all')
const centerFilter = ref('all')
const centerFilterOptions = computed(() => [
  { label: '전체', value: 'all' },
  ...mockCenters
    .filter((center) => regionFilter.value === 'all' || center.region === regionFilter.value)
    .map((center) => ({ label: center.name, value: center.name })),
])
watch(regionFilter, () => {
  centerFilter.value = 'all'
})
</script>
