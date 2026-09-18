<script setup lang="ts">
import { computed, useId, useSlots, Comment, Text } from 'vue'
import { cn } from '@/lib/utils'
import styles from './InfoTable.module.css'

/**
 * InfoTable 안에서 쓰는 라벨+값 한 칸.
 * - `for` 를 주면 단일 입력 요소와 연결되는 진짜 <label for> 로 렌더링한다.
 * - `for` 가 없으면(체크박스+드롭다운 조합처럼 값 영역에 컨트롤이 여러 개인 경우)
 *   라벨은 <span id>, 값 영역은 role="group" aria-labelledby 로 묶어 접근성을 유지한다.
 *
 * 클래스는 세 자리로 나눠 받는다 — `class`(칸 전체) · `labelClass`(제목) · `valueClass`(값).
 * InfoTable.module.css 는 @layer 밖이라 여기서 이미 정한 속성(라벨 폭·테두리 등)은
 * police-*.css 의 클래스로 못 덮는다. 폭은 `--info-label-w` 변수로 바꾼다(CLAUDE.md §1).
 */
interface Props {
  label?: string
  for?: string
  full?: boolean
  /**
   * 세로로 두 행을 차지한다(주소처럼 값 영역에 입력이 두 줄 들어가는 칸).
   * 옆 칸들은 CSS Grid 자동 배치로 알아서 다음 행에 채워진다. 1열로 접히는 좁은 화면에서는 해제된다.
   */
  rowSpan?: 2
  /** **값 영역 안쪽**을 세로로 쌓는다(폭과 무관). 라벨과 값 사이를 가르는 건 `mo` 다 */
  layout?: 'row' | 'column'
  /**
   * 모바일(폭 1600 미만)에서 라벨을 어디에 둘지. **기본 `'row'`** — PC 와 같이 한 줄에 나란히 선다.
   * 라벨을 값 **위로** 올릴 칸에 `mo="col"` 을 직접 준다.
   *
   * 표의 열 수(`InfoTable` 의 `mo-columns`)와 달리 기본값을 켜 두지 않는다 — 칸마다 값 영역
   * 생김새가 달라(입력 하나 / 체크박스 여러 개 / 주소 두 줄) 일괄로 올리면 어색한 칸이 생긴다.
   *
   * `layout` 과 다른 축이다 — `layout` 은 **값 영역 안쪽**을 세로로 쌓는 것이고(폭과 무관),
   * 이건 **라벨과 값 사이**를 가른다(모바일에서만). 둘을 같이 줘도 된다.
   */
  mo?: 'row' | 'col'
  /** 칸 전체(라벨+값을 감싸는 바깥) */
  class?: string
  /** 라벨(제목) 쪽. `for` 유무로 <label>/<span> 이 갈리는데 양쪽 다 붙는다 */
  labelClass?: string
  /** 값(정보) 쪽 */
  valueClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'row',
  mo: 'row',
})

const uid = useId()
const labelId = computed(() => `info-field-label-${uid}`)

const slots = useSlots()

/**
 * 값 영역에 컨트롤 없이 글자만 들어왔는지 판별한다.
 * 글자만 있으면 페이지마다 span 에 클래스를 붙이지 않아도 공통 텍스트 스타일이 자동으로 붙는다.
 * (슬롯 내용은 반응형 소스가 아니라 computed 로 캐싱하면 갱신되지 않으므로 렌더마다 계산한다)
 */
function isTextOnly() {
  const nodes = slots.default?.() ?? []
  const meaningful = nodes.filter(
    (node) => node.type !== Comment && !(node.type === Text && !String(node.children ?? '').trim()),
  )
  return meaningful.length > 0 && meaningful.every((node) => node.type === Text)
}
</script>

<template>
  <div
    :class="cn(
      styles.field,
      props.full && styles.fieldFull,
      props.rowSpan === 2 && styles.fieldRowSpan2,
      props.mo === 'col' && styles['field-mo-col'],
      props.class,
    )"
  >
    <label v-if="props.for" :class="cn(styles.label, props.labelClass)" :for="props.for">
      <slot name="label">{{ label }}</slot>
    </label>
    <span v-else :class="cn(styles.label, props.labelClass)" :id="labelId">
      <slot name="label">{{ label }}</slot>
    </span>

    <div
      :class="cn(layout === 'column' ? styles.controlColumn : styles.control, props.valueClass)"
      v-bind="!props.for ? { role: 'group', 'aria-labelledby': labelId } : {}"
    >
      <span v-if="isTextOnly()" :class="styles['info-table-txt']"><slot /></span>
      <slot v-else />
    </div>
  </div>
</template>
