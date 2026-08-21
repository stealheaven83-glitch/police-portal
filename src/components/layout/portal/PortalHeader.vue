<!--
  지역경찰포털 상단 헤더.
  퍼블리싱 원본 html/index.html 의 .identifier + header 영역을 그대로 옮긴 것으로,
  클래스명 / DOM 구조 / aria 속성은 원본과 1:1 로 유지한다. (police-style.css 무수정 전제)
  이미지 경로만 ../asset/images/... → /portal/asset/images/... 로 치환.
-->
<template>
  <!-- 상단 헤더 영역 -->
  <div class="identifier" v-if="showBanner">
    <div class="inner">
      <div class="logo">
        <span class="sr-only">지역 경찰 포털</span>
      </div>
      <p  class="ban-txt">이 누리집은 대한민국 공식 전자정부 누리집입니다.</p>
    </div>
  </div>

  <header>
    <div class="header-in">
      <div class="header-container">
        <div class="inner">
          <div class="header-branding">
            <h2 class="logo">
              <RouterLink to="/">
                <span class="sr-only">지역경찰포털</span>
              </RouterLink>
            </h2>
            <div class="header-actions">
              <button type="button" class="btn-navi sch" title="통합검색 레이어">
                <i aria-hidden="true">
                  <img src="/portal/asset/images/icon/ico_seach_black_20.svg" alt="" />
                </i>
                통합검색
              </button>
              <button type="button" class="btn-navi all" aria-controls="mobile-nav">
                <img src="/portal/asset/images/icon/ico_menu_20.svg" alt="" />
                전체메뉴
              </button>
            </div>
          </div>
        </div>

        <!-- 전체메뉴 영역 -->
        <nav class="main-menu">
          <h2 class="sr-only">메뉴</h2>
          <div class="inner">
            <div class="gnb-menu">
              <ul class="depth1-list">
                <li v-for="(depth1, i) in portalMenu" :key="depth1.title" class="depth1-item">
                  <a
                    href=""
                    class="depth1-text"
                    :class="{ active: i === activeDepth1 }"
                    @click.prevent="activeDepth1 = i"
                  >
                    {{ depth1.title }}
                  </a>
                  <div class="gnb-sub">
                    <strong class="tit">{{ depth1.groupTitle ?? '' }}</strong>
                    <ul class="depth2-list">
                      <li
                        v-for="depth2 in depth1.children"
                        :key="depth2.title"
                        class="depth2-item"
                      >
                        <a href="" class="detpth2-text" @click.prevent>
                          {{ depth2.title }}
                        </a>
                        <div v-if="depth2.children" class="gnb-sub-sub">
                          <strong class="tit">{{ depth2.groupTitle }}</strong>
                          <ul class="depth3-list">
                            <li
                              v-for="depth3 in depth2.children"
                              :key="depth3.title"
                              class="depth3-item"
                            >
                              <a href="" class="depth3-text" @click.prevent>
                                {{ depth3.title }}
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>

            <div class="my-info">
              <a href="" title="마이페이지 바로가기" @click.prevent>
                <span class="mypic"><img :src="portalMyInfo.thumbnail" alt="" aria-hidden="true" /></span>
                <span class="name">{{ portalMyInfo.name }}</span>
                <span class="position">{{ portalMyInfo.position }}</span>
              </a>
            </div>
          </div>
        </nav>
        <!-- //전체메뉴 영역 -->
      </div>
    </div>
  </header>
  <!-- //상단 헤더 영역 -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { portalMenu, portalMyInfo } from './portalMenu'

withDefaults(
  defineProps<{
    /** 전자정부 누리집 안내 문구 노출 여부. 업무화면(WorkLayout)에서는 숨긴다. */
    showBanner?: boolean
  }>(),
  { showBanner: true },
)

/** 원본 마크업에서 첫 번째 depth1 에 active 가 걸려 있던 것을 상태로 옮김 */
const activeDepth1 = ref(0)
</script>
