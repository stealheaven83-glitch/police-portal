<!--
  지역경찰포털 메인 화면 (루트 경로 "/").
  퍼블리싱 원본 html/index.html 의 <main> 내부 전체를 컴포넌트 분리 없이 한 파일로 옮긴 것.
  클래스명 / DOM 구조 / aria 속성은 원본과 1:1 로 유지한다. (police-style.css 무수정 전제)
  이미지 경로만 ../asset/images/... → /portal/asset/images/... 로 치환.
-->
<template>
  <div class="container main">
    <div class="inner">
      <!-- 검색 탭 영역 -->
      <div class="search-tab">
        <div class="main-tab-list" role="tablist" aria-label="">
          <button
            v-for="(tab, i) in tabs"
            :key="tab.id"
            :id="tab.id"
            ref="tabRefs"
            class="main-tab"
            :class="{ active: activeTab === i }"
            role="tab"
            :aria-selected="activeTab === i"
            :aria-controls="tab.panelId"
            :tabindex="activeTab === i ? 0 : -1"
            @click="activateTab(i)"
            @keydown="onTabKeydown"
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          id="panel-1"
          role="tabpanel"
          aria-labelledby="tab-1"
          class="tab-panel"
          :hidden="activeTab !== 0"
        >
          <div class="search-wrap">
            <form class="search-bar" role="search" name="msfrm" @submit.prevent="onSearch">
              <h2 class="blind">통합검색</h2>
              <div class="status-box">
                <span class="status-bedge good">
                  <i class="icon info" aria-hidden="true"></i>
                  <span>검색원활</span>
                </span>
                <!-- <span class="status-bedge normal">
                  <i class="icon info" aria-hidden="true"></i>
                  <span>검색보통</span>
                </span>
                <span class="status-bedge busy">
                  <i class="icon info" aria-hidden="true"></i>
                  <span>검색혼잡</span>
                </span> -->
              </div>
              <div class="search-box">
                <input
                  v-model="scenarioKeyword"
                  class="input-search"
                  type="search"
                  placeholder="검색어를 입력해주세요."
                  aria-label="Search"
                  name="search_txt"
                  id="search_inp"
                  autocomplete="off"
                />
                <button class="btn btn-search" type="submit" aria-label="검색하기"></button>
              </div>
              <button class="btn btn-voice" type="button" aria-label="음성검색"></button>
            </form>
            <div class="keyword">
              <span class="sr-only">추천검색어</span>
              <ul class="keyword-list">
                <li v-for="keyword in recommendKeywords" :key="keyword"># {{ keyword }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          id="panel-2"
          role="tabpanel"
          aria-labelledby="tab-2"
          class="tab-panel"
          :hidden="activeTab !== 1"
        >
          <div class="search-wrap">
            <form class="search-bar no-bedge" role="search" name="msfrm" @submit.prevent="onSearch">
              <h2 class="blind">통합검색</h2>
              <input
                v-model="totalKeyword"
                class="input-search"
                type="search"
                placeholder="검색어를 입력해주세요."
                aria-label="Search"
                name="search_txt"
                autocomplete="off"
              />
              <button class="btn btn-search" type="submit" aria-label="검색하기"></button>
            </form>
            <div class="keyword">
              <span class="sr-only">추천검색어</span>
              <ul class="keyword-list">
                <li v-for="keyword in recommendKeywords" :key="keyword"># {{ keyword }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- //검색 탭 영역 -->

      <!-- 서비스 바로가기 -->
      <div class="rowgroup service">
        <h2 class="sr-only">서비스 바로가기</h2>
        <div class="service-col first">
          <a href="" class="service-bnr" @click.prevent>
            <strong class="title">
              출동수당 조회
              <i aria-hidden="true" class="icon01">
                <img src="/portal/asset/images/icon/img_main_card01.svg" alt="" />
              </i>
            </strong>
          </a>
          <a href="" class="service-bnr" @click.prevent>
            <strong class="title">
              범죄 안전 지도
              <i aria-hidden="true" class="icon02">
                <img src="/portal/asset/images/icon/img_main_card02.svg" alt="" />
              </i>
            </strong>
          </a>
        </div>

        <div class="service-col result">
          <strong class="title">근무 실적</strong>
          <div class="swiper resultSwiper">
            <div class="swiper-wrapper">
              <div
                v-for="(slide, i) in resultSlides"
                :key="i"
                class="card-wrap swiper-slide"
              >
                <div class="card">
                  <a v-for="item in slide" :key="item.key" href="#">
                    <span class="key">{{ item.key }}</span>
                    <span class="value">{{ item.value }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-control">
            <div class="result-pagination"></div>
            <div class="swiper-button-wrap">
              <button class="result-button-prev"></button>
              <button class="result-button-next"></button>
            </div>
          </div>
          <i aria-hidden="true" class="icon03">
            <img src="/portal/asset/images/icon/img_main_card03.svg" alt="" />
          </i>
        </div>

        <div class="service-col">
          <RouterLink to="/lpo/notebook" class="service-bnr note">
            <strong class="title">
              개인 수첩
              <i aria-hidden="true" class="icon04">
                <img src="/portal/asset/images/icon/img_main_card04.svg" alt="" />
              </i>
            </strong>
          </RouterLink>
          <a href="#" class="service-bnr" @click.prevent>
            <p class="title-box">
              <strong class="title">알림</strong>
            </p>
            <ul class="service-list">
              <li v-for="(noti, i) in notifications" :key="i">
                <span class="date">{{ noti.date }}</span>
                <p>{{ noti.text }}</p>
              </li>
            </ul>
          </a>
        </div>

        <div class="service-col last">
          <a href="#" class="service-bnr small" @click.prevent>
            <strong class="title">
              Q&amp;A
              <i aria-hidden="true" class="icon05">
                <img src="/portal/asset/images/icon/img_main_card05.svg" alt="" />
              </i>
            </strong>
          </a>
          <a href="#" class="service-bnr small" @click.prevent>
            <strong class="title">
              물리력 사용<br />
              보고서
              <i aria-hidden="true" class="icon06">
                <img src="/portal/asset/images/icon/img_main_card06.svg" alt="" />
              </i>
            </strong>
          </a>
        </div>
      </div>
      <!-- //서비스 바로가기 -->

      <!-- 공지사항 영역 -->
      <div class="rowgroup notice">
        <h2 class="sr-only">공지사항</h2>
        <div class="notice-list">
          <span class="icon-notice">
            <img src="/portal/asset/images/icon/ico_notice-main.svg" alt="공지사항" />
          </span>
          <div class="swiper noticeSwiper">
            <ul class="swiper-wrapper">
              <li v-for="(notice, i) in notices" :key="i" class="notice-slide swiper-slide">
                <a href="#">
                  <p class="subject">{{ notice.subject }}</p>
                  <span class="date">{{ notice.date }}</span>
                </a>
              </li>
            </ul>
            <div class="notice-pagination"></div>
            <div class="swiper-nav">
              <button
                class="slide-arrow"
                :class="noticePlaying ? 'pause' : 'play'"
                :aria-label="noticePlaying ? '정지' : '재생'"
                type="button"
                @click="toggleNoticeAutoplay"
              ></button>
              <button class="slide-arrow prev" aria-label="이전" type="button"></button>
              <button class="slide-arrow next" aria-label="다음" type="button"></button>
            </div>
          </div>
        </div>
      </div>
      <!-- //공지사항 영역 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

/* ------------------------------------------------------------------
 * 검색 탭 (퍼블리싱 원본 asset/js/common/common.js 의 DOM 조작을 대체)
 * ------------------------------------------------------------------ */
const tabs = [
  { id: 'tab-1', panelId: 'panel-1', label: '사건대응 시나리오' },
  { id: 'tab-2', panelId: 'panel-2', label: '지역경찰포털 통합검색' },
] as const

const activeTab = ref(0)
const tabRefs = useTemplateRef<HTMLButtonElement[]>('tabRefs')

const activateTab = (index: number, focus = false) => {
  activeTab.value = index
  if (!focus) return
  nextTick(() => tabRefs.value?.[index]?.focus())
}

const onTabKeydown = (e: KeyboardEvent) => {
  const total = tabs.length
  const current = activeTab.value

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      activateTab((current + 1) % total, true)
      break
    case 'ArrowLeft':
      e.preventDefault()
      activateTab((current - 1 + total) % total, true)
      break
    case 'Home':
      e.preventDefault()
      activateTab(0, true)
      break
    case 'End':
      e.preventDefault()
      activateTab(total - 1, true)
      break
  }
}

const scenarioKeyword = ref('')
const totalKeyword = ref('')

const onSearch = () => {
  // TODO: 검색 API 연동
}

const recommendKeywords = [
  '가출청소년 매뉴얼 검색해줘',
  '가정폭력 매뉴얼 검색해줘',
  '사건대응 시나리오 예상 질문 내용 표시',
]

/* ------------------------------------------------------------------
 * 서비스 바로가기 / 공지사항 데이터
 * ------------------------------------------------------------------ */
const resultSlides = [
  [
    { key: '112신고처리', value: 7 },
    { key: '즉결심판', value: 7 },
    { key: '통고처분', value: 7 },
    { key: 'TCS단속', value: 18 },
    { key: '차량순찰', value: 12 },
  ],
  [
    { key: '탄력순찰 이행', value: 7 },
    { key: 'TCS 사건처리', value: 7 },
    { key: '즉결 심판', value: 7 },
    { key: '통고 처분', value: 18 },
    { key: '유실물 처리', value: 12 },
  ],
]

const notifications = [
  { date: '06.15', text: '신청하신 출동수당이 승인 완료 되었습니다.' },
  { date: '06.15', text: '신청하신 출동수당이 승인 완료되었습니다.' },
]

const noticeSubject =
  '[공지] 지역경찰 순찰차 적재함 및 탑재장비 개선 관련 현장 의견을 취합합니다. (댓글로 입력해주세요.) 길어지면 말줄임표로 표로 나옵니다'

const notices = [
  { subject: noticeSubject, date: '2026.07.01.' },
  { subject: noticeSubject, date: '2026.07.01.' },
  { subject: noticeSubject, date: '2026.07.01.' },
]

/* ------------------------------------------------------------------
 * Swiper (index.html 에서 로드한 전역 swiper-bundle.min.js 사용)
 * ------------------------------------------------------------------ */
const swipers: SwiperInstance[] = []

/** 공지 띠 인스턴스 — 정지 버튼이 자동 롤링을 세우려면 이것만 따로 잡아야 한다 */
let noticeSwiper: SwiperInstance | null = null

/** 공지 자동 롤링이 돌고 있는가 — 버튼 아이콘(pause/play)과 aria-label 이 이 값을 따른다 */
const noticePlaying = ref(true)

/** 정지 ↔ 재생 토글. 자동으로 움직이는 내용은 멈출 수단이 있어야 한다 */
function toggleNoticeAutoplay() {
  if (noticePlaying.value) {
    noticeSwiper?.autoplay?.stop()
  } else {
    noticeSwiper?.autoplay?.start()
  }
  noticePlaying.value = !noticePlaying.value
}

const initSwipers = () => {
  const Swiper = window.Swiper
  if (!Swiper) {
    console.warn('[Main] swiper-bundle.min.js 가 로드되지 않았습니다.')
    return
  }

  swipers.push(
    new Swiper('.resultSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: {
        el: '.result-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.result-button-next',
        prevEl: '.result-button-prev',
      },
    }),
  )

  // 공지는 자동으로 넘어간다. loop 가 없으면 마지막 장에서 멈춘다.
  // 정지 버튼(.slide-arrow.pause)이 이 인스턴스를 세우므로 배열과 별개로 따로 들고 있는다
  noticeSwiper = new Swiper('.noticeSwiper', {
    loop: true,
    // disableOnInteraction:false — 화살표로 넘긴 뒤에도 자동 롤링이 이어진다
    autoplay: { delay: 5000, disableOnInteraction: false },
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: '.notice-pagination',
      type: 'fraction',
      // 현재 페이지 번호를 두 자리(01, 02...)로 포맷팅
      formatFractionCurrent: (number: number) => String(number).padStart(2, '0'),
      // 전체 페이지 번호를 두 자리(09)로 포맷팅
      formatFractionTotal: (number: number) => String(number).padStart(2, '0'),
      renderFraction: (currentClass: string, totalClass: string) =>
        `<span class="${currentClass}"></span> | <span class="${totalClass}"></span>`,
    },
    navigation: {
      nextEl: '.next',
      prevEl: '.prev',
    },
  })
  swipers.push(noticeSwiper)
}

onMounted(async () => {
  // swiper-bundle.min.js 는 defer 로 로드되므로 보통 이미 준비되어 있지만,
  // 순서가 어긋나는 경우를 대비해 다음 틱까지 한 번 더 기다린다.
  if (!window.Swiper) await nextTick()
  initSwipers()
})

onBeforeUnmount(() => {
  swipers.forEach((swiper) => swiper.destroy(true, true))
  swipers.length = 0
  noticeSwiper = null
  noticePlaying.value = true
})
</script>
