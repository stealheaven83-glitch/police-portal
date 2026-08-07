<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Tooltip 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        <a
          href="https://www.shadcn-vue.com/docs/components/tooltip"
          target="_blank"
          class="text-primary underline underline-offset-4"
        >
          shadcn-vue Tooltip
        </a>
        프리미티브를 감싼 커스텀
        <span class="text-primary font-medium">AppTooltip</span>
        컴포넌트 예시 페이지입니다. 활성화 버튼에 마우스를 올리거나 키보드로 포커스하면 부가 정보를 표시합니다.
      </div>

      <!-- Section 1: 기본 구조 (Anatomy) -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">기본 구조</h2>
        <div class="text-gray-500">
          <span class="text-primary font-medium">AppTooltip</span> 은 활성화 버튼(트리거)과
          컨테이너(팝오버), 상태 아이콘(선택), 본문으로 구성됩니다.
        </div>

        <div class="flex items-center gap-3 py-6">
          <span class="text-sm text-gray-600">활성화 버튼에 마우스를 올려보세요</span>
          <AppTooltip
            variant="info"
            content="툴팁은 부가적인 정보를 전달하는 데 사용합니다. 본문은 150자 이내의 텍스트만 제공합니다."
          />
        </div>

        <ol class="text-sm text-gray-500 list-decimal list-inside space-y-1 pt-2">
          <li><b>활성화 버튼</b> — 툴팁 콘텐츠가 있음을 표시하고 토글하는 트리거 (기본 슬롯, <code>triggerLabel</code>)</li>
          <li><b>컨테이너</b> — 툴팁 영역(팝오버)과 배경을 구분하는 요소 (자동)</li>
          <li><b>아이콘 [선택]</b> — 강조가 필요한 경우 내용에 따라 상태 아이콘 표시 (<code>variant</code>, <code>icon</code>)</li>
          <li><b>본문</b> — 툴팁에서 제공하는 구체적인 설명 텍스트 (<code>content</code>)</li>
        </ol>
      </section>

      <!-- Section 2: 기본 사용 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">기본 사용</h2>
        <div class="text-gray-500">
          가장 기본적인 형태입니다. 슬롯을 지정하지 않으면 접근성을 갖춘 도움말(?) 아이콘 버튼이 기본 트리거로 제공됩니다.
        </div>

        <div class="flex items-center gap-2 py-2">
          <span class="text-sm font-medium">비밀번호</span>
          <AppTooltip content="영문/숫자/특수문자를 조합하여 8자 이상 입력해 주세요." />
        </div>
      </section>

      <!-- Section 3: 아이콘 유형 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">아이콘 유형</h2>
        <div class="text-gray-500">
          강조가 필요한 경우 <code>variant</code> 로 내용에 맞는 시스템 상태 아이콘을 표시할 수 있습니다.
        </div>

        <div class="flex flex-wrap items-center gap-8 py-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">기본</span>
            <AppTooltip content="별도의 상태 강조가 없는 기본 툴팁입니다." />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">정보(info)</span>
            <AppTooltip variant="info" content="참고하면 좋은 부가 정보를 안내합니다." />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">성공(success)</span>
            <AppTooltip variant="success" content="정상적으로 처리되었음을 안내합니다." />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">경고(warning)</span>
            <AppTooltip variant="warning" content="입력 전 반드시 확인이 필요한 사항입니다." />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">오류(error)</span>
            <AppTooltip variant="error" content="허용되지 않는 값입니다. 다시 확인해 주세요." />
          </div>
        </div>
      </section>

      <!-- Section 4: 표시 방향 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">표시 방향</h2>
        <div class="text-gray-500">
          <code>side</code> 로 표시 방향을 지정합니다. 팝오버 영역이 화면을 벗어나지 않도록
          <code>collisionPadding</code> 이 적용되어 자동으로 위치가 보정됩니다.
        </div>

        <div class="flex flex-wrap items-center gap-4 py-6">
          <AppTooltip side="top" content="위쪽(top)에 표시됩니다.">
            <Button variant="outline">Top</Button>
          </AppTooltip>
          <AppTooltip side="right" content="오른쪽(right)에 표시됩니다.">
            <Button variant="outline">Right</Button>
          </AppTooltip>
          <AppTooltip side="bottom" content="아래쪽(bottom)에 표시됩니다.">
            <Button variant="outline">Bottom</Button>
          </AppTooltip>
          <AppTooltip side="left" content="왼쪽(left)에 표시됩니다.">
            <Button variant="outline">Left</Button>
          </AppTooltip>
        </div>
      </section>

      <!-- Section 5: 활성화 버튼 유형 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">활성화 버튼 유형</h2>
        <div class="text-gray-500">
          기본 슬롯에 원하는 요소를 넣어 활성화 버튼을 자유롭게 구성할 수 있습니다.
        </div>

        <div class="flex flex-wrap items-center gap-8 py-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">아이콘 버튼</span>
            <AppTooltip variant="info" content="아이콘 버튼을 활성화 버튼으로 사용합니다." />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm">텍스트 트리거</span>
            <AppTooltip content="밑줄 텍스트를 활성화 버튼으로 사용합니다.">
              <span class="cursor-help text-sm text-primary underline underline-offset-4 decoration-dotted">
                요금 안내
              </span>
            </AppTooltip>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm">버튼</span>
            <AppTooltip content="일반 버튼을 활성화 버튼으로 사용합니다.">
              <Button variant="secondary" size="sm">
                <CircleHelpIcon class="size-4" />
                도움말
              </Button>
            </AppTooltip>
          </div>
        </div>
      </section>

      <!-- Section 6: 사용 가이드 (Do / Don't) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">사용 가이드</h2>
        <div class="text-gray-500">툴팁을 사용할 때 지켜야 할 원칙입니다.</div>

        <div class="grid gap-4 md:grid-cols-2 pt-2">
          <div
            v-for="guide in guides"
            :key="guide.title"
            class="rounded-lg border p-4 space-y-2"
          >
            <h3 class="font-semibold">{{ guide.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ guide.desc }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleHelpIcon } from 'lucide-vue-next'
import { AppTooltip } from '@/components/custom/table/tooltip'
import { Button } from '@/components/ui/button'

/**
 * 이미지의 툴팁 사용 원칙(디자인 가이드)을 카드로 정리
 */
const guides = [
  {
    title: '툴팁 컴포넌트 사용을 우선적으로 고려한다.',
    desc:
      'HTML title 속성으로 제공되는 힌트 텍스트는 글자 크기·표시 위치를 수정할 수 없고, 스크린 리더 환경에 따라 음성으로 출력되지 않을 수 있으므로 툴팁 컴포넌트를 사용하는 것이 좋다.',
  },
  {
    title: '툴팁은 부가적인 정보를 전달하는 데 사용한다.',
    desc:
      '사용자가 반드시 확인해야 하는 필수 정보를 툴팁 팝오버에만 제공해서는 안 된다. 필수 정보는 별도의 상호작용 없이 본문에 표시하는 것이 적절하다.',
  },
  {
    title: '툴팁 영역(팝오버)이 화면을 벗어나지 않도록 표현한다.',
    desc:
      '팝오버 영역이 시각적으로 확인할 수 없는 화면 밖에 배치되어 내부 콘텐츠가 가려지지 않도록 한다. (collisionPadding 으로 자동 보정)',
  },
  {
    title: '툴팁 영역(팝오버)이 본문의 중요 콘텐츠를 가리지 않도록 표현한다.',
    desc:
      '팝오버 영역이 활성화 버튼과 부가 정보를 제공하려는 본문 콘텐츠 요소를 가리지 않도록 적절한 표시 방향(side)을 설정한다.',
  },
]
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

code {
  font-size: 0.85em;
  background: var(--muted);
  color: var(--foreground);
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
}
</style>
