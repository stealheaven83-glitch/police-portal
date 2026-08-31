<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import PopupNoticeDialog from './components/PopupNoticeDialog.vue'
import {
  usePopupNoticeList,
  usePopupNoticeDetail,
  PopupNoticeKey,
  type PopupNoticeRow,
} from './composable/PC-COM-2402'

defineOptions({ name: 'PcCom2402' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '홈페이지관리' },
  { label: '팝업공지 관리' },
]

/**
 * 팝업(components/)이 props/emit 없이 같은 상태를 쓰도록 여기서 한 번만 만들어 provide 한다.
 * 팝업은 PopupNoticeKey 로 inject 해서 이 인스턴스를 공유한다.
 */
const store = { ...usePopupNoticeList(), ...usePopupNoticeDetail() }
provide(PopupNoticeKey, store)

const { searchFrom, searchTo, rows, search, openNew, openDetail } = store

/**
 * 읽기 전용 목록이라 셀에 컨트롤을 붙이지 않는다.
 * 번호만 폭을 고정하고 나머지는 layout="fitColumns" 가 남는 폭을 나눠 갖는데,
 * 제목이 가장 길어 widthGrow 로 더 넓게 잡는다.
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 80, hozAlign: 'center' },
  { title: '공지시작일', field: 'startDate', hozAlign: 'center' },
  { title: '공지종료일', field: 'endDate', hozAlign: 'center' },
  {
    title: '제목',
    field: 'title',
    hozAlign: 'center',
    widthGrow: 4,
    // 버튼 텍스트가 곧 셀 값이다 — 눌러서 공지팝업 상세를 연다
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonLabel: (row) => String((row as PopupNoticeRow).title),
    onButtonClick: (row) => openDetail(row as PopupNoticeRow),
  },
  { title: '사용여부', field: 'use', hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', hozAlign: 'center' },
  { title: '등록자', field: 'createdBy', hozAlign: 'center' },
]

// 사이드메뉴(시스템 관리 LNB) 설정 — 활성 항목은 라우트 경로로 자동 매칭된다
useSideMenuSetup('systemAdmin')

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2402',
  label: '팝업공지 관리',
  path: '/views/com/PC-COM-2402',
  componentName: 'PcCom2402',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="팝업공지 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <!--
    시안의 검색줄은 부서 선택도 상세조회 토글도 없다.
    SearchWrapper 는 department 슬롯과 collapsible 이 모두 없으면 회색 입력 박스만 그린다.
  -->
  <div>
    <SearchWrapper>
      <template #form>
        <div class="search-area">
          <div class="group-gap2">
            <DatePicker v-model="searchFrom" label="시작일" size="sm" class="!space-y-0" input-class="w-[16rem]" />
            <span>~</span>
            <DatePicker v-model="searchTo" label="종료일" size="sm" class="!space-y-0" input-class="w-[16rem]" />
          </div>
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" @click="search">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="list-actions">
    <Button type="button" variant="primary" size="sm" @click="openNew">신규</Button>
  </div>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="30rem"
    placeholder="등록된 팝업공지가 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <PopupNoticeDialog />
</template>
