<script setup lang="ts">
import { ref } from "vue"
import { CriticalAlert } from "@/components/custom/alert"
import { AddressInput } from "@/components/custom/address"
import { Badge } from "@/components/custom/badge"
import { Card } from "@/components/custom/card"
import { Chip, ChipGroup } from "@/components/custom/chip"
import { ContextualHelp, ContextualHelpTrigger } from "@/components/custom/contextual-help"
import { Disclosure } from "@/components/custom/disclosure"
import { NoData } from "@/components/custom/empty"
import { InfoBox } from "@/components/custom/infobox"
import { List, ListGroup } from "@/components/custom/list"
import { ProgressBar } from "@/components/custom/progress"
import { Spinner } from "@/components/custom/spinner"
import { Tag, TagList } from "@/components/custom/tag"
import { TopButton } from "@/components/custom/top-button"
import TextSelect from "@/components/custom/select/TextSelect.vue"
import { Switch } from "@/components/custom/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/custom/tabs"
import styles from "./style/NewComponents.module.css"

defineOptions({ name: "NewComponentsSample" })

const singleChip = ref("b")
const multiChip = ref<string[]>(["a"])
const chipItems = [
  { label: "전체", value: "a" },
  { label: "기동장비", value: "b" },
  { label: "무기", value: "c" },
  { label: "비활성", value: "d", disabled: true },
]

const address = ref("")
const addressDetail = ref("")
const disclosureOpen = ref(false)
const tags = ref(["지구대", "파출소", "치안센터"])

const sortValue = ref("recent")
const sortOptions = [
  { label: "최신순", value: "recent" },
  { label: "이름순", value: "name" },
  { label: "등록순", value: "created" },
]
const switchXl = ref(true)

function removeTag(t: string) {
  tags.value = tags.value.filter((x) => x !== t)
}
</script>

<template>
  <div :class="styles.page">
    <div>
      <h1 :class="styles.pageTitle">Figma 신규 컴포넌트 13종</h1>
      <p :class="styles.pageDesc">
        기존 라이브러리에 없어서 새로 만든 것들. 각 절의 회색 글씨가 Figma 원본 이름이다.
      </p>
    </div>

    <!-- InfoBox -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">InfoBox</h2>
      <p :class="styles.sectionMeta">infobox — Type=primary|secondary, Size=default|slim</p>
      <div :class="styles.col">
        <div :class="styles.box">
          <InfoBox title="장비 등록 안내">
            무기는 총번이 중복될 수 없습니다. 등록 전 총번을 확인해 주세요.
            <template #list>
              <ListGroup>
                <List :level="2">총번은 숫자 8자리로 입력합니다.</List>
                <List :level="2">배치장소는 소속 관서만 선택할 수 있습니다.</List>
              </ListGroup>
            </template>
          </InfoBox>
        </div>
        <div :class="styles.box">
          <InfoBox type="secondary" title="회색 계열(secondary)">
            제목 없이 본문만 쓸 수도 있다.
          </InfoBox>
        </div>
        <div :class="styles.box">
          <InfoBox size="slim">한 줄짜리 안내는 slim을 쓴다.</InfoBox>
        </div>
        <div :class="styles.box">
          <InfoBox type="secondary" size="slim">회색 slim.</InfoBox>
        </div>
      </div>
    </section>

    <!-- List -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">List / ListGroup</h2>
      <p :class="styles.sectionMeta">list, list_group — Level 1~3, 번호 목록 지원</p>
      <div :class="styles.box">
        <ListGroup>
          <List :level="1">레벨1 — 채운 원 불릿</List>
          <List :level="2">레벨2 — 짧은 막대 불릿</List>
          <List :level="3">레벨3 — 빈 사각 불릿</List>
        </ListGroup>
        <ListGroup ordered>
          <List :order="1">번호 목록 첫째</List>
          <List :order="2">번호 목록 둘째</List>
        </ListGroup>
      </div>
    </section>

    <!-- Tag -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Tag / TagList</h2>
      <p :class="styles.sectionMeta">tag, tag__list — Size=large|medium|small, 삭제 가능</p>
      <TagList>
        <Tag v-for="t in tags" :key="t" :label="t" deletable @delete="removeTag(t)" />
      </TagList>
      <div :class="styles.row">
        <Tag size="large" label="large" />
        <Tag size="medium" label="medium" />
        <Tag size="small" label="small" />
        <Tag type="button" label="#링크형태그" />
      </div>
    </section>

    <!-- Chip -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Chip / ChipGroup</h2>
      <p :class="styles.sectionMeta">
        chip__single, chip__multi — FilterChip과 다름(폼 안에서 값을 고르는 컨트롤)
      </p>
      <div :class="styles.col">
        <ChipGroup v-model="singleChip" :items="chipItems" size="medium" />
        <p :class="styles.sectionMeta">단일 선택 값: {{ singleChip || "(없음)" }}</p>
        <ChipGroup v-model="multiChip" :items="chipItems" multiple size="small" />
        <p :class="styles.sectionMeta">다중 선택 값: {{ multiChip.join(", ") || "(없음)" }}</p>
        <div :class="styles.row">
          <Chip size="large" label="large" />
          <Chip size="large" label="checked" checked />
          <Chip size="large" label="disabled" disabled />
        </div>
      </div>
    </section>

    <!-- Spinner / NoData -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Spinner / NoData</h2>
      <p :class="styles.sectionMeta">spinner (48/32/20), No Data</p>
      <div :class="styles.stage">
        <Spinner size="large" />
        <Spinner size="medium" />
        <Spinner size="small" />
        <NoData />
      </div>
    </section>

    <!-- ProgressBar -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">ProgressBar</h2>
      <p :class="styles.sectionMeta">progress_bar — Size=large|medium, State=active|success|error</p>
      <div :class="styles.col">
        <div :class="styles.narrowBox">
          <ProgressBar :value="50" message="업로드 중입니다." />
        </div>
        <div :class="styles.narrowBox">
          <ProgressBar state="success" message="완료되었습니다." />
        </div>
        <div :class="styles.narrowBox">
          <ProgressBar state="error" size="medium" message="실패했습니다." />
        </div>
      </div>
    </section>

    <!-- CriticalAlert -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">CriticalAlert</h2>
      <p :class="styles.sectionMeta">critical_alerts — Type=emergency|safety|info</p>
      <div :class="styles.col">
        <CriticalAlert type="emergency" text="관내 강력사건 발생 — 전 지구대 비상소집" />
        <CriticalAlert type="safety" text="한파 특보 발효, 취약계층 순찰 강화" />
        <CriticalAlert type="info" text="시스템 정기점검 안내 (토 02:00~04:00)" :show-more="false" />
      </div>
    </section>

    <!-- Disclosure / ContextualHelp / TopButton -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Disclosure / ContextualHelp / TopButton</h2>
      <p :class="styles.sectionMeta">disclosure, contextual_help(+trigger), top_button</p>
      <div :class="styles.col">
        <Disclosure v-model:open="disclosureOpen" title="상세 조건 더보기">
          펼쳐진 내용이 여기 들어간다.
        </Disclosure>

        <div :class="styles.center">
          <ContextualHelp
            title="도움말 제목"
            contents="컴포넌트 주변에 배치되어 해당 컴포넌트의 상태나 관련된 상세 정보를 제공한다."
            show-button
          >
            <template #trigger>
              <ContextualHelpTrigger label="도움말" />
            </template>
          </ContextualHelp>

          <ContextualHelp title="아이콘만" contents="라벨 없이 아이콘만 쓰는 형태.">
            <template #trigger>
              <ContextualHelpTrigger />
            </template>
          </ContextualHelp>

          <TopButton :show-after="0" />
          <TopButton :show-after="0" type="label" />
        </div>
      </div>
    </section>

    <!-- AddressInput -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">AddressInput</h2>
      <p :class="styles.sectionMeta">
        Adress input — 주소검색 팝업은 화면에서 연결한다(@search). 우편번호 API 미연동
      </p>
      <div :class="styles.narrowBox">
        <AddressInput v-model="address" v-model:detail="addressDetail" />
      </div>
    </section>

    <!-- 기존 컴포넌트 보강분 -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">TextSelect (신규)</h2>
      <p :class="styles.sectionMeta">
        select_text — 테두리 없는 텍스트형 셀렉트. 폼용 SelectField와 다름
      </p>
      <div :class="styles.row">
        <TextSelect v-model="sortValue" :options="sortOptions" size="xlarge" aria-label="정렬 xlarge" />
        <TextSelect v-model="sortValue" :options="sortOptions" size="medium" aria-label="정렬 medium" />
        <TextSelect v-model="sortValue" :options="sortOptions" size="small" aria-label="정렬 small" />
        <TextSelect v-model="sortValue" :options="sortOptions" size="map" aria-label="정렬 map" />
      </div>
    </section>

    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Switch — xl 추가</h2>
      <p :class="styles.sectionMeta">toggle_switch Size=xlarge (트랙 64×32) 보강. default/lg는 그대로</p>
      <div :class="styles.row">
        <Switch v-model="switchXl" label="medium(default)" />
        <Switch v-model="switchXl" size="lg" label="large(lg)" />
        <Switch v-model="switchXl" size="xl" label="xlarge(xl)" />
      </div>
    </section>

    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Tabs — tone 추가</h2>
      <p :class="styles.sectionMeta">
        tab Type=primary|secondary 보강. tone 미지정(inherit)이면 기존 화면과 완전히 동일
      </p>
      <div :class="styles.col">
        <Tabs default-value="a">
          <TabsList :grow="false">
            <TabsTrigger value="a">inherit(기존)</TabsTrigger>
            <TabsTrigger value="b">두번째</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs default-value="a">
          <TabsList :grow="false" tone="primary">
            <TabsTrigger value="a">tone=primary</TabsTrigger>
            <TabsTrigger value="b">두번째</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs default-value="a">
          <TabsList :grow="false" variant="line" tone="secondary">
            <TabsTrigger value="a">line + secondary</TabsTrigger>
            <TabsTrigger value="b">두번째</TabsTrigger>
          </TabsList>
        </Tabs>
        <!-- variant=chip: Figma chip(11220:71184) — chip__single 을 탭으로, 활성 탭에 체크 -->
        <Tabs default-value="a">
          <TabsList variant="chip">
            <TabsTrigger value="a">장애처리</TabsTrigger>
            <TabsTrigger value="b">출동수당</TabsTrigger>
            <TabsTrigger value="c">범죄예방진단</TabsTrigger>
            <TabsTrigger value="d">해바라기센터</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </section>

    <!-- Card -->
    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">Card</h2>
      <p :class="styles.sectionMeta">card — Type=vertical|horizontal, 구성요소는 슬롯</p>
      <div :class="styles.box">
        <Card title="타이틀 영역" description="간단한 설명이 들어가는 영역입니다.">
          <template #badge>
            <Badge color="primary" variant="solid-pastel" shape="sm">뱃지</Badge>
          </template>
          <template #meta>2015-11-00 · 홍길동</template>
          <template #tags>
            <Tag size="small" label="지구대" />
            <Tag size="small" label="무기" />
          </template>
        </Card>
      </div>
    </section>
  </div>
</template>
