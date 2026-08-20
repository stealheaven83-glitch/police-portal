<!--
  개인수첩 메인 (경로 "/lpo/notebook") — 포털 서브페이지 예시.

  ▸ 레이아웃
    라우트 meta.layout = 'PortalLayout' 로 지정하면 헤더/GNB/푸터가 자동으로 붙는다.
    이 파일은 <main> 안쪽만 담당하므로 최상위는 .container > .inner 로 시작한다.
    (메인 화면은 .container.main, 서브 화면은 .container + 페이지 훅 클래스)

  ▸ 스타일 기준
    police-style.css 는 메인 화면 전용이라 서브페이지 컴포넌트(브레드크럼 / 페이지 타이틀 /
    테이블 / 버튼)가 정의되어 있지 않다. 그래서 :root 디자인 토큰(--Base-*, --Text-body_*,
    --Border_gray*, --Surface-*)만 가져다 쓰고 페이지 스타일은 아래 scoped 블록에 작성한다.

    · rem 기준은 1rem = 10px 이다 (police reset 의 html { font-size: 62.5% }).
    · SFC scoped 스타일은 레이어에 속하지 않아 police 레이어보다 우선한다.
      덕분에 police reset 의 a/button/ul 기본값을 별도 처리 없이 덮어쓸 수 있다.
    · 필요하면 Tailwind 유틸리티나 shadcn 컴포넌트를 그대로 섞어 써도 된다
      (utilities 레이어가 police 레이어보다 우선).
-->
<template>
  <div class="container notebook">
    <div class="inner">
      <!-- 브레드크럼: 레이아웃의 '본문 바로가기' 링크가 #breadCrumb 를 가리키므로 서브페이지에는 반드시 둔다 -->
      <nav id="breadCrumb" class="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><RouterLink to="/">홈</RouterLink></li>
          <li>지역경찰</li>
          <li aria-current="page">개인수첩</li>
        </ol>
      </nav>

      <!-- 페이지 헤더 -->
      <div class="page-head">
        <div class="page-head-text">
          <h2 class="page-title">개인수첩</h2>
          <p class="page-desc">
            근무 중 작성한 인수인계와 차량점검 기록을 한곳에서 확인하고 관리합니다.
          </p>
        </div>
        <div class="page-head-actions">
          <button type="button" class="btn btn-primary" @click="onCreate">인수인계 작성</button>
        </div>
      </div>

      <!-- 바로가기 -->
      <div class="rowgroup">
        <h3 class="sr-only">개인수첩 바로가기</h3>
        <ul class="shortcut-list">
          <li v-for="item in shortcuts" :key="item.title">
            <a href="#" class="shortcut" @click.prevent>
              <span class="shortcut-title">{{ item.title }}</span>
              <span class="shortcut-desc">{{ item.desc }}</span>
              <span class="shortcut-count">
                <em>{{ item.count }}</em>
                건
              </span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 최근 인수인계 -->
      <div class="rowgroup">
        <div class="section-head">
          <h3 class="section-title">최근 인수인계</h3>

          <div class="filter" role="group" aria-label="구분 필터">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              type="button"
              class="filter-btn"
              :class="{ active: filter === option.value }"
              :aria-pressed="filter === option.value"
              @click="filter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <caption>최근 인수인계 목록 — 번호, 구분, 제목, 근무일자, 작성자, 상태</caption>
            <colgroup>
              <col style="width: 8rem" />
              <col style="width: 12rem" />
              <col />
              <col style="width: 14rem" />
              <col style="width: 12rem" />
              <col style="width: 11rem" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">번호</th>
                <th scope="col">구분</th>
                <th scope="col" class="al">제목</th>
                <th scope="col">근무일자</th>
                <th scope="col">작성자</th>
                <th scope="col">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.no">
                <td class="ac">{{ row.no }}</td>
                <td class="ac">{{ row.category }}</td>
                <td class="al">
                  <a href="#" class="subject" @click.prevent>{{ row.subject }}</a>
                </td>
                <td class="ac">{{ row.workedAt }}</td>
                <td class="ac">{{ row.writer }}</td>
                <td class="ac">
                  <span class="badge" :class="row.status">{{ statusLabel[row.status] }}</span>
                </td>
              </tr>
              <tr v-if="!filteredRows.length">
                <td class="ac empty" colspan="6">해당 조건의 인수인계가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'done' | 'ongoing' | 'rejected'
type Category = '인수인계' | '차량점검'

const statusLabel: Record<Status, string> = {
  done: '완료',
  ongoing: '진행중',
  rejected: '반려',
}

const shortcuts = [
  { title: '인수인계 작성', desc: '근무 교대 시 전달사항을 기록합니다.', count: 3 },
  { title: '인수인계 현황', desc: '작성한 인수인계의 처리 상태를 확인합니다.', count: 12 },
  { title: '차량점검', desc: '순찰차 점검 결과를 등록하고 조회합니다.', count: 5 },
]

const filterOptions = [
  { label: '전체', value: 'all' },
  { label: '인수인계', value: '인수인계' },
  { label: '차량점검', value: '차량점검' },
] as const

const filter = ref<'all' | Category>('all')

interface NotebookRow {
  no: number
  category: Category
  subject: string
  workedAt: string
  writer: string
  status: Status
}

// TODO: API 연동 시 이 목록을 응답 데이터로 교체
const rows: NotebookRow[] = [
  { no: 6, category: '인수인계', subject: '야간 근무 중 관내 집회 관련 전달사항', workedAt: '2026.07.27.', writer: '홍길동', status: 'ongoing' },
  { no: 5, category: '차량점검', subject: '순찰차 3호 타이어 마모 확인 및 정비 요청', workedAt: '2026.07.26.', writer: '홍길동', status: 'done' },
  { no: 4, category: '인수인계', subject: '유실물 보관함 인계 목록 (지갑 2, 휴대전화 1)', workedAt: '2026.07.25.', writer: '김순경', status: 'done' },
  { no: 3, category: '인수인계', subject: '관내 공사구간 교통 통제 인계 사항', workedAt: '2026.07.24.', writer: '홍길동', status: 'rejected' },
  { no: 2, category: '차량점검', subject: '순찰차 1호 정기 점검 결과 보고', workedAt: '2026.07.23.', writer: '이경장', status: 'done' },
]

const filteredRows = computed(() =>
  filter.value === 'all' ? rows : rows.filter((row) => row.category === filter.value),
)

const onCreate = () => {
  // TODO: 인수인계 작성 화면으로 이동
}
</script>

<style scoped>
/* rem 기준은 1rem = 10px (police reset 의 html { font-size: 62.5% }) */

.notebook {
  padding: 3.2rem 0 8rem;
}

/* ---------------------------------------------------------------- 브레드크럼 */
.breadcrumb ol {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.5rem;
  color: var(--Text-body_2);
}

.breadcrumb li + li::before {
  content: "";
  display: inline-block;
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.8rem;
  vertical-align: -0.3rem;
  background: url("/portal/asset/images/icon/ico_arrow_next_black_16.svg") no-repeat center / 1.2rem auto;
  opacity: 0.5;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb [aria-current="page"] {
  color: var(--Text-body_0);
  font-weight: 600;
}

/* ---------------------------------------------------------------- 페이지 헤더 */
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2.4rem;
  margin-top: 2rem;
  padding-bottom: 2.4rem;
  border-bottom: 2px solid var(--Text-body_0);
}

.page-title {
  font-size: 3.6rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--Text-body_0);
}

.page-desc {
  margin-top: 0.8rem;
  color: var(--Text-body_2);
}

/* ---------------------------------------------------------------- 버튼 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 4.8rem;
  padding: 0 2.4rem;
  border-radius: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary {
  background: var(--Base-primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--Base-secondary);
}

/* ---------------------------------------------------------------- 바로가기 카드 */
.rowgroup {
  margin-top: 4rem;
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.shortcut {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2.8rem 3.2rem;
  border: 1px solid var(--Border_gray03);
  border-radius: 1.6rem;
  background: var(--white);
  transition:
    border-color 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
}

.shortcut:hover {
  border-color: var(--Base-primary);
  background: var(--Surface-primary);
}

.shortcut-title {
  position: relative;
  padding-right: 2.4rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--Text-body_0);
}

.shortcut-title::after {
  content: "";
  position: absolute;
  top: 0.4rem;
  right: 0;
  width: 1.6rem;
  height: 1.6rem;
  background: url("/portal/asset/images/icon/ico_arrow_next_black_16.svg") no-repeat center / 1.3rem auto;
}

.shortcut-desc {
  margin-top: 0.8rem;
  font-size: 1.5rem;
  color: var(--Text-body_2);
}

.shortcut-count {
  margin-top: 2.4rem;
  color: var(--Text-body_1);
}

.shortcut-count em {
  margin-right: 0.2rem;
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--Base-primary);
}

/* ---------------------------------------------------------------- 섹션 헤더 / 필터 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 1.6rem;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--Text-body_0);
}

.filter {
  display: flex;
  gap: 0.8rem;
}

.filter-btn {
  height: 3.6rem;
  padding: 0 1.6rem;
  border: 1px solid var(--Border_gray01);
  border-radius: 1000px;
  font-size: 1.5rem;
  color: var(--Text-body_2);
}

.filter-btn.active {
  border-color: var(--Base-secondary);
  background: var(--Base-secondary);
  color: var(--white);
  font-weight: 600;
}

/* ---------------------------------------------------------------- 테이블 */
/* police reset 이 table { table-layout: fixed } 를 적용하므로 colgroup 으로 폭을 지정한다 */
.table-wrap {
  overflow-x: auto;
  border-top: 2px solid var(--Text-body_0);
}

.table-wrap th,
.table-wrap td {
  padding: 1.6rem 1.2rem;
  border-bottom: 1px solid var(--Border_gray03);
  font-size: 1.6rem;
  color: var(--Text-body_1);
}

.table-wrap th {
  background: var(--Background-gray01);
  color: var(--Text-body_0);
  font-weight: 600;
}

.table-wrap tbody tr:hover {
  background: var(--Surface-primary);
}

.table-wrap .subject {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--Text-body_0);
}

.table-wrap .subject:hover {
  text-decoration: underline;
}

.table-wrap .empty {
  padding: 6rem 0;
  color: var(--Text-body_disable);
}

/* ---------------------------------------------------------------- 상태 배지 */
.badge {
  display: inline-flex;
  align-items: center;
  height: 2.8rem;
  padding: 0 1.2rem;
  border-radius: 1000px;
  font-size: 1.4rem;
  font-weight: 600;
}

.badge.done {
  background: var(--Surface-secondary);
  color: var(--Base-secondary);
}

.badge.ongoing {
  background: var(--Surface-primary);
  color: var(--info);
}

.badge.rejected {
  background: var(--Surface-point);
  color: var(--Base--point);
}

/* ----------------------------------------------------------------------------
 * 포커스 링
 * police reset 의 *:focus 는 존재하지 않는 변수(--Base-seconday-dark, 오타)를 참조해
 * 아웃라인이 무효화된다. 원본 CSS 는 수정하지 않고 이 페이지에서만 보완한다.
 * police-style.css 이 파일을 수정했으니 이 라인은 삭제하겠습니다
 * -------------------------------------------------------------------------- */
/* .notebook a:focus-visible,
.notebook button:focus-visible {
  outline: 0.2rem solid var(--Base-primary);
  outline-offset: 0.2rem;
} */

/* ---------------------------------------------------------------- 반응형 */
@media (max-width: 1200px) {
  .shortcut-list {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
