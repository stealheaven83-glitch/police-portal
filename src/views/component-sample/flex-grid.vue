<script setup lang="ts">
import { reactive } from 'vue'
import { FlexRow, FlexCol } from '@/components/custom/flex-grid'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'

const form = reactive({
  name: '',
  birth: '',
  gender: 'm',
  address: '',
})

const genderOptions = [
  { label: '남', value: 'm' },
  { label: '여', value: 'f' },
]

// 실전 예시 2: 부서정보 — label/value 쌍을 table cell 처럼 촘촘히 박아넣는 실제 화면 흉내
const dept = reactive({
  deptName: '서울중부경찰서 을지지구대',
  openYear: '',
  gradeLevel: 1,
  capacity: '',
  currentHeadcount: 60,
  addressRoad: '',
  region: '',
  addressDetail: '',
  phone: '',
  guardPhone: '',
  guardFax: '',
  workType: '',
  workCycle: '',
  dayShiftCount: '',
  nightShiftCount: '',
})

const regionOptions = [
  { label: '1지역', value: 'r1' },
  { label: '2지역', value: 'r2' },
]

const workTypeOptions = [
  { label: '상시', value: 'always' },
  { label: '교대', value: 'shift' },
]

// table cell 처럼 보이게 하는 라벨/값 셀 공통 class. --flex-col-min-w: 0 으로 FlexCol 기본
// min-width(20rem)를 꺼서, 이 좁은 셀들이 표 폭 안에서 제멋대로 줄바꿈되지 않게 한다
// (줄바꿈은 바깥 그룹 FlexCol 단위로만 일어나야 한다).
const cellLabel = '!flex-none !w-[11rem] flex items-center px-3 py-2 text-[1.4rem] font-semibold bg-[var(--Background-gray01)] text-[var(--Text-body_0)]'
const cellValue = 'flex items-center flex-wrap gap-2 px-3 py-2 bg-white'
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Flex Grid</h1>
          <p class="text-muted-foreground text-sm mt-1">
            flexbox 기반 범용 row/col 레이아웃 프리미티브 샘플입니다.
            <code>FlexRow</code>가 flex 컨테이너(한 줄), <code>FlexCol</code>이 그 안의 칸입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <!-- 기본: N등분 자동 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">기본: N등분 자동</h2>
          <p class="text-muted-foreground text-sm">
            <code>FlexCol</code>은 기본이 <code>flex: 1 1 0%</code>라서, 한 <code>FlexRow</code> 안에 몇 개를
            넣든 계산 없이 항상 균등분할됩니다. bootstrap의 번호 없는 <code>.col</code>과 같은 원리입니다.
          </p>
          <div class="space-y-2">
            <p class="text-sm font-medium">2등분</p>
            <FlexRow>
              <FlexCol class="bg-blue-50 p-2 border">1/2</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">2/2</FlexCol>
            </FlexRow>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">3등분</p>
            <FlexRow>
              <FlexCol class="bg-blue-50 p-2 border">1/3</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">2/3</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">3/3</FlexCol>
            </FlexRow>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">5등분</p>
            <FlexRow>
              <FlexCol class="bg-blue-50 p-2 border">1/5</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">2/5</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">3/5</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">4/5</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">5/5</FlexCol>
            </FlexRow>
          </div>
        </section>

        <!-- 중첩 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">중첩: FlexCol 안에 FlexRow</h2>
          <p class="text-muted-foreground text-sm">
            <code>FlexCol</code> 안에 <code>FlexRow</code>를 다시 넣으면, 바깥 행의 분할과 무관하게
            그 안에서 독립적으로 다시 등분됩니다. 각 <code>FlexRow</code>는 자신만의 flex 컨텍스트라서
            안쪽 묶음(라벨+값 등)이 통째로 한 덩어리로 다음 줄에 떨어지는 것도 별도 처리 없이 그대로 됩니다.
          </p>
          <FlexRow>
            <FlexCol>
              <FlexRow>
                <FlexCol class="bg-blue-50 p-2 border">중첩 1/3</FlexCol>
                <FlexCol class="bg-blue-50 p-2 border">중첩 2/3</FlexCol>
                <FlexCol class="bg-blue-50 p-2 border">중첩 3/3</FlexCol>
              </FlexRow>
            </FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">2/4</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">3/4</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">4/4</FlexCol>
          </FlexRow>
        </section>

        <!-- 고정폭 + 자동배분 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">고정폭 + 자동배분 혼합</h2>
          <p class="text-muted-foreground text-sm">
            특정 칸만 폭을 고정하고 싶으면 class로 오버라이드합니다. <code>width</code>만 주면
            기본값인 <code>flex-basis: 0%</code>에 밀려 무시되므로, <code>flex-none</code>도 같이 줘야
            합니다(이 프로젝트에서 컴포넌트 내부 스타일을 페이지에서 덮어쓸 때 쓰는 <code>!</code> 접두
            Tailwind 방식). 고정폭 칸이 <code>min-width</code> 기본값(20rem) 때문에 불필요하게 wrap을
            유발하지 않도록 <code>--flex-col-min-w: 0</code>도 같이 줍니다.
          </p>
          <FlexRow>
            <FlexCol class="!flex-none !w-20 bg-amber-50 p-2 border" style="--flex-col-min-w: 0">고정폭</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">자동1</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">자동2</FlexCol>
          </FlexRow>
        </section>

        <!-- size prop: breakpoint별 명시적 비율 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">size: breakpoint별 명시적 비율</h2>
          <p class="text-muted-foreground text-sm">
            자동 균등분할이 아니라 "12를 기준 단위로 몇을 차지할지"를 직접 지정하고 싶을 때
            <code>size</code>를 씁니다(bootstrap의 <code>col-4</code>와 같은 비율 감각).
            <code>:size="&#123; default: 4, '761&lt;': 6 &#125;"</code>처럼 객체로 주면, 평소(넓을 때)엔
            4(=33.3%)라 한 줄에 3칸씩, 부모 <code>FlexRow</code>의 실제 렌더 폭이 761px 이하가 되면
            6(=50%)으로 바뀌어 한 줄에 2칸씩 배치됩니다. 미디어쿼리의 기준값(761)은 CSS 변수로 표현이
            안 되는 값이라(브라우저가 지원하지 않음), <code>FlexRow</code>가 <code>ResizeObserver</code>로
            자기 폭을 관찰해 내려주고 <code>FlexCol</code>이 그 폭을 보고 <code>computed</code>로 매번
            판정합니다 — 그래서 전역 viewport가 아니라 이 FlexGrid가 실제로 렌더링된 컨테이너 폭 기준으로
            반응합니다(좁은 다이얼로그 안에 들어가도 그 다이얼로그 폭 기준). 숫자를 주면 기본
            min-width(20rem)도 자동으로 꺼집니다 — 안 그러면 6(=50%)처럼 좁은 값을 줘도 min-width에
            밀려 의도한 폭보다 넓게 렌더링됩니다.
          </p>
          <p class="text-muted-foreground text-sm">
            <b>주의:</b> 숫자 size는 flex-grow가 0이라 정확히 그 비율만 차지합니다 — 강제개행이
            섞이는 row라면 아래 "size 규칙" 섹션을 먼저 보세요.
          </p>
          <p class="text-sm font-medium">900px 컨테이너 (761보다 넓음 → 4, 3칸)</p>
          <div class="w-[90rem] max-w-full border border-dashed p-2">
            <FlexRow>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">1</FlexCol>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">2</FlexCol>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">3</FlexCol>
            </FlexRow>
          </div>
          <p class="text-sm font-medium">700px 컨테이너 (761 이하 → 6, 2칸)</p>
          <div class="w-[70rem] max-w-full border border-dashed p-2">
            <FlexRow>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">1</FlexCol>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">2</FlexCol>
              <FlexCol :size="{ default: 4, '761<': 6 }" class="bg-blue-50 p-2 border">3</FlexCol>
            </FlexRow>
          </div>
        </section>

        <!-- size: content / full -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">size: content / full — 라벨+값 패턴</h2>
          <p class="text-muted-foreground text-sm">
            숫자 대신 키워드도 됩니다. <code>'content'</code>는 내용 크기만큼만(<code>flex: 0 0 auto</code>),
            <code>'full'</code>은 남는 폭 전부(<code>flex: 1 1 0%</code>, size 를 안 준 기본값과 동일).
            라벨은 텍스트 길이대로, 값은 나머지 전부를 차지하는 흔한 폼 패턴을 손으로 폭을 재지 않고도
            만들 수 있습니다. 아래는 라벨 길이가 서로 다른데도(제목/부서정보) 각자 딱 맞는 폭만 차지합니다.
          </p>
          <FlexRow class="border-t border-l border-[var(--Border_gray03)]">
            <FlexCol :size="{ default: 'content' }" class="bg-[var(--Background-gray01)] px-3 py-2 border-r border-b border-[var(--Border_gray03)] text-[1.4rem] font-semibold whitespace-nowrap">
              제목
            </FlexCol>
            <FlexCol :size="{ default: 'full' }" class="px-3 py-2 border-r border-b border-[var(--Border_gray03)]">
              sdfsdlfjsdlfd
            </FlexCol>
          </FlexRow>
          <FlexRow class="border-l border-[var(--Border_gray03)]">
            <FlexCol :size="{ default: 'content' }" class="bg-[var(--Background-gray01)] px-3 py-2 border-r border-b border-[var(--Border_gray03)] text-[1.4rem] font-semibold whitespace-nowrap">
              부서정보
            </FlexCol>
            <FlexCol :size="{ default: 'full' }" class="px-3 py-2 border-r border-b border-[var(--Border_gray03)]">
              sdlfd
            </FlexCol>
          </FlexRow>
        </section>

        <!-- size + 자동분배 혼합, 하나의 FlexRow 안에서 자동 줄바꿈 -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">size 있는 칸 + 없는 칸 혼합 / 줄마다 FlexRow 안 나눠도 되는지</h2>
          <p class="text-muted-foreground text-sm">
            <code>size</code> 없는 <code>FlexCol</code>은 그대로 <code>flex:1 1 0%</code>(자동 성장)라서,
            같은 <code>FlexRow</code> 안에 <code>size</code> 있는 칸과 없는 칸을 섞으면 고정폭을 뺀
            나머지를 자동분배 칸들끼리 나눠 가집니다. 아래는 첫 칸만 <code>size:6</code>(50%)로 고정하고
            나머지 둘은 size 없이 뒀습니다 — 둘이 남은 50%를 25%씩 나눠 갖습니다.
          </p>
          <FlexRow>
            <FlexCol :size="6" class="bg-amber-50 p-2 border">고정 6/12</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">자동</FlexCol>
            <FlexCol class="bg-gray-50 p-2 border">자동</FlexCol>
          </FlexRow>

          <p class="text-muted-foreground text-sm">
            줄마다 <code>&lt;FlexRow&gt;</code>를 따로 감쌀 필요도 없습니다 — <code>size</code> 합이 12를
            채우면 flexbox의 <code>flex-wrap</code>이 알아서 다음 줄로 넘기므로, 아래처럼
            <code>FlexCol</code> 6개를 <b>하나의 FlexRow</b>에 전부 넣고 각각 <code>size:4</code>(=33.3%)만
            주면 3개씩 자동으로 두 줄이 됩니다. 게다가 같은 FlexRow 하나를 공유하니 두 줄의 열 경계가
            항상 정확히 정렬됩니다(행마다 FlexRow를 따로 만들면 행별로 계산이 독립적이라 정렬이 안
            맞을 수 있었는데, 그 문제가 자연스럽게 해결됩니다).
          </p>
          <FlexRow>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">1</FlexCol>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">2</FlexCol>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">3</FlexCol>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">4</FlexCol>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">5</FlexCol>
            <FlexCol :size="4" class="bg-blue-50 p-2 border">6</FlexCol>
          </FlexRow>
        </section>

        <!-- size 규칙: 숫자 size 를 섞으면 반드시 'full' 을 하나 이상 같이 둘 것 -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">size 규칙: grow:0인 size 는 'full' 을 꼭 하나 끼워둘 것</h2>
          <p class="text-muted-foreground text-sm">
            숫자 size든 <code>'content'</code>든 <code>flex-grow:0</code>인 size는 전부 "정확히 이
            크기"만 뜻합니다 — 옆 칸이 내용 때문에(숫자는 안의 컨트롤 min-width, <code>'content'</code>는
            자기 텍스트 길이) 강제로 다음 줄로 밀려나도, 그 자리를 메우려고 스스로 늘어나지 않습니다.
            그래서 grow:0인 size(숫자 또는 <code>'content'</code>)를 섞어 쓰는 row에는 <b>반드시
            <code>'full'</code> 칸을 하나 이상</b> 같이 둬야 합니다 — 예: 고정 <code>3</code> +
            <code>4</code> + <code>'full'</code>, 또는 라벨은 <code>'content'</code> + 값은
            <code>'full'</code>. <code>'full'</code>은 <code>flex-grow:1</code>이라 강제개행으로
            어느 줄에 남겨지든 그 줄의 남는 공간을 알아서 흡수합니다. 이건 프레임워크가 대신 끼워주지
            않으니 쓰는 쪽에서 챙겨야 하는 규칙입니다.
          </p>
          <p class="text-sm font-medium text-red-600">나쁜 예 — 전부 숫자 size, 'full'이 없음</p>
          <div class="w-[60rem] border border-dashed p-2">
            <FlexRow>
              <FlexCol :size="4" class="bg-red-50 p-2 border" style="min-width: 30rem">1 (내용이 넓음)</FlexCol>
              <FlexCol :size="4" class="bg-red-50 p-2 border">2</FlexCol>
              <FlexCol :size="4" class="bg-red-50 p-2 border">3</FlexCol>
            </FlexRow>
          </div>
          <p class="text-sm font-medium text-emerald-600">좋은 예 — 'full'이 남는 공간을 흡수</p>
          <div class="w-[60rem] border border-dashed p-2">
            <FlexRow>
              <FlexCol :size="4" class="bg-emerald-50 p-2 border" style="min-width: 30rem">1 (내용이 넓음)</FlexCol>
              <FlexCol :size="4" class="bg-emerald-50 p-2 border">2</FlexCol>
              <FlexCol :size="'full'" class="bg-emerald-50 p-2 border">full</FlexCol>
            </FlexRow>
          </div>
          <p class="text-muted-foreground text-sm">
            이 규칙은 중첩된 row 안에서도 똑같이 적용됩니다 — 라벨을 <code>고정</code>(또는
            <code>'content'</code>)으로 두고 그 옆 값 칸들을 <code>'full'</code>로 채우는 라벨+값
            패턴이 대표적입니다.
          </p>
          <div class="w-[60rem] border border-dashed p-2">
            <FlexRow>
              <FlexCol :size="4" class="border">
                <FlexRow>
                  <FlexCol :size="3" class="bg-blue-50 p-2 border" style="min-width: 14rem">고정(넓음)</FlexCol>
                  <FlexCol :size="'full'" class="bg-blue-50 p-2 border">full</FlexCol>
                  <FlexCol :size="'full'" class="bg-blue-50 p-2 border">full</FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol :size="4" class="bg-gray-50 p-2 border">2</FlexCol>
              <FlexCol :size="4" class="bg-gray-50 p-2 border">3</FlexCol>
            </FlexRow>
          </div>
        </section>

        <!-- fluid wrap -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">breakpoint 없는 fluid wrap</h2>
          <p class="text-muted-foreground text-sm">
            각 칸은 <code>min-width</code>(기본 20rem) 밑으로 좁아지면 media query 없이 자연스럽게
            다음 줄로 떨어집니다. 아래 박스는 폭을 60rem으로 좁혀둬서 바로 줄바꿈이 보이지만, 실제로는
            특정 breakpoint 값이 아니라 폭이 줄어드는 정도에 따라 연속적으로(fluid하게) 반응합니다 —
            브라우저 창 폭을 직접 줄여보면 20rem 단위가 아니라 담을 수 있는 만큼 계속 재배치됩니다.
          </p>
          <div class="max-w-[60rem] border border-dashed p-2">
            <FlexRow>
              <FlexCol class="bg-blue-50 p-2 border">min-w 20rem</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">min-w 20rem</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">min-w 20rem</FlexCol>
              <FlexCol class="bg-blue-50 p-2 border">min-w 20rem</FlexCol>
            </FlexRow>
          </div>
        </section>

        <!-- 실전 예시 -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">실전 예시: 폼 필드에 적용</h2>
          <p class="text-muted-foreground text-sm">
            라벨+입력 쌍을 <code>FlexCol</code> 하나로 묶어서, 한 행에 폭이 다른 필드 여러 개를
            섞어 배치한 예시입니다. "이름"/"생년월일"은 짧게, "주소"는 남는 폭을 자동으로 더 가져갑니다
            (등록/상세 화면에서 반복되는 표 형태의 라벨-값 패턴은 <RouterLink to="/infoTable" class="underline">
            InfoTable</RouterLink>을 쓰세요 — FlexGrid는 그보다 더 일반적인 레이아웃 프리미티브입니다).
          </p>
          <FlexRow class="gap-4">
            <FlexCol class="!flex-none !w-[16rem]" style="--flex-col-min-w: 0">
              <label class="block text-sm font-medium mb-1">이름</label>
              <InputField2 v-model="form.name" size="sm" class="!space-y-0" placeholder="홍길동" />
            </FlexCol>
            <FlexCol class="!flex-none !w-[16rem]" style="--flex-col-min-w: 0">
              <label class="block text-sm font-medium mb-1">생년월일</label>
              <InputField2 v-model="form.birth" size="sm" class="!space-y-0" placeholder="YYYY-MM-DD" />
            </FlexCol>
            <FlexCol class="!flex-none !w-[10rem]" style="--flex-col-min-w: 0">
              <label class="block text-sm font-medium mb-1">성별</label>
              <SelectField v-model="form.gender" :options="genderOptions" size="sm" trigger-class="w-full" class="!space-y-0" />
            </FlexCol>
            <FlexCol style="--flex-col-min-w: 0">
              <label class="block text-sm font-medium mb-1">주소</label>
              <InputField2 v-model="form.address" size="sm" class="!space-y-0 w-full" placeholder="남는 폭을 자동으로 채웁니다" />
            </FlexCol>
          </FlexRow>
        </section>

        <!-- 실전 예시 2: 부서정보 -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">실전 예시: 부서정보 (label rowspan 흉내)</h2>
          <p class="text-muted-foreground text-sm">
            실제 화면(관할현황 &gt; 부서정보)처럼 한 행에 라벨-값 쌍 여러 개를 촘촘히 박고,
            "소재지 주소"처럼 라벨 하나가 값 영역 2줄에 걸치는 경우까지 FlexGrid로 만든 예시입니다.
            "소재지 주소" 라벨을 담은 FlexCol은 <code>grid-row-span</code> 같은 속성이 따로 없어도,
            FlexRow의 기본 <code>align-items: stretch</code> 덕분에 옆(주소 2줄) 칸 높이에 맞춰
            자동으로 늘어나서 rowspan처럼 보입니다. 이 좁은 라벨/값 셀들은 FlexCol 기본
            min-width(20rem)를 그대로 두면 표 폭 안에서 제멋대로 줄바꿈되므로,
            <code>--flex-col-min-w: 0</code>으로 꺼두고 줄바꿈은 바깥 그룹(FlexCol) 단위에서만
            일어나게 합니다.
          </p>
          <div class="max-w-[100rem] border-l border-t-2 border-[var(--Border_gray03)] border-t-[var(--Text-body_0)]">
            <!-- row 1: 부서명 / 개소년도 / 급지+정원 -->
            <FlexRow class="divide-x divide-[var(--Border_gray03)] border-b border-[var(--Border_gray03)]">
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">부서명</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">{{ dept.deptName }}</FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">개소년도</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <DatePicker v-model="dept.openYear" size="sm" input-class="w-full max-w-[16rem]" class="!space-y-0" />
                  </FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">급지</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <Stepper v-model="dept.gradeLevel" :min="1" :max="9" label="급지" class="w-[12rem]" />
                    <label class="text-[1.4rem] text-[var(--Text-body_1)]">정원</label>
                    <InputField2 v-model="dept.capacity" size="sm" input-class="w-16" class="!space-y-0" />
                    <span class="text-[1.3rem] text-[var(--Text-body_2)] whitespace-nowrap">
                      경찰관 현원 {{ dept.currentHeadcount }}명
                    </span>
                  </FlexCol>
                </FlexRow>
              </FlexCol>
            </FlexRow>

            <!-- row 2: 소재지 주소(label 2줄 rowspan) / 소재지+경비전화 / 일반전화+경비팩스 -->
            <FlexRow class="divide-x divide-[var(--Border_gray03)] border-b border-[var(--Border_gray03)]">
              <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">소재지 주소</FlexCol>
              <FlexCol>
                <div class="flex flex-col h-full divide-y divide-[var(--Border_gray03)]">
                  <div class="flex items-center flex-wrap gap-2 px-3 py-2 bg-white">
                    <InputField2
                      v-model="dept.addressRoad"
                      size="sm"
                      input-class="w-full max-w-[22rem]"
                      class="!space-y-0 flex-1 min-w-[14rem]"
                      placeholder="도로명주소"
                    />
                    <Button type="button" variant="tertiary2" size="sm">
                      <Icon name="search" :size="16" aria-label="" />
                      주소검색
                    </Button>
                  </div>
                  <div class="flex items-center px-3 py-2 bg-white">
                    <InputField2 v-model="dept.addressDetail" size="sm" class="!space-y-0 flex-1" placeholder="상세주소" />
                  </div>
                </div>
              </FlexCol>
              <FlexCol>
                <div class="flex flex-col h-full divide-y divide-[var(--Border_gray03)]">
                  <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                    <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">소재지</FlexCol>
                    <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                      <SelectField v-model="dept.region" :options="regionOptions" size="sm" trigger-class="w-full max-w-[16rem]" class="!space-y-0" placeholder="선택" />
                    </FlexCol>
                  </FlexRow>
                  <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                    <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">경비전화</FlexCol>
                    <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                      <InputField2 v-model="dept.guardPhone" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
                    </FlexCol>
                  </FlexRow>
                </div>
              </FlexCol>
              <FlexCol>
                <div class="flex flex-col h-full divide-y divide-[var(--Border_gray03)]">
                  <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                    <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">일반전화</FlexCol>
                    <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                      <InputField2 v-model="dept.phone" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
                    </FlexCol>
                  </FlexRow>
                  <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                    <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">경비팩스</FlexCol>
                    <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                      <InputField2 v-model="dept.guardFax" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
                    </FlexCol>
                  </FlexRow>
                </div>
              </FlexCol>
            </FlexRow>

            <!-- row 3: 근무형태 / 근무주기 / 주간전종인원 / 야간전종인원 -->
            <FlexRow class="divide-x divide-[var(--Border_gray03)]">
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">근무형태</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <SelectField v-model="dept.workType" :options="workTypeOptions" size="sm" trigger-class="w-full max-w-[16rem]" class="!space-y-0" placeholder="선택" />
                  </FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">근무주기</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <InputField2 v-model="dept.workCycle" size="sm" class="!space-y-0 flex-1" />
                  </FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">주간전종인원</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <InputField2 v-model="dept.dayShiftCount" size="sm" class="!space-y-0 flex-1" />
                  </FlexCol>
                </FlexRow>
              </FlexCol>
              <FlexCol>
                <FlexRow class="h-full divide-x divide-[var(--Border_gray03)]">
                  <FlexCol :class="cellLabel" style="--flex-col-min-w: 0">야간전종인원</FlexCol>
                  <FlexCol :class="cellValue" style="--flex-col-min-w: 0">
                    <InputField2 v-model="dept.nightShiftCount" size="sm" class="!space-y-0 flex-1" />
                  </FlexCol>
                </FlexRow>
              </FlexCol>
            </FlexRow>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
