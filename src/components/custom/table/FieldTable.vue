<template>
  <table class="lp-field-table">
    <caption v-if="caption" class="blind">{{ caption }}</caption>
    <colgroup>
      <col v-for="column in columns" :key="column.key" :style="column.width ? { width: column.width } : undefined">
    </colgroup>
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in items" :key="index">
        <td
          v-for="column in columns"
          :key="column.key"
          :class="column.align === 'center' ? 'lp-field-table-center' : undefined"
        >
          <slot :name="`cell-${column.key}`" :item="item" :column="column" :index="index">
            {{ item[column.key] }}
          </slot>
        </td>
      </tr>
      <tr v-if="!items.length">
        <td :colspan="columns.length" class="lp-field-table-empty">{{ placeholder }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * InfoField 값 칸 안에 들어가는 정적 표.
 *
 * `TableWrapper` 와 헷갈리지 않는다 — 둘 다 "기능 없는 정적 표"지만 놓이는 자리가 다르다.
 * - `TableWrapper` : 본문에 단독으로 놓이는 표. 상단 진한 선 + 흰 헤더 + 행 hover 강조 + 가운데 정렬.
 * - `FieldTable`(이 파일) : **InfoTable 의 한 칸 안**에 들어가는 표. 회색 헤더(라벨 칸과 같은 톤),
 *   상단 진한 선 없음, hover 강조 없음, 셀 왼쪽 정렬 — InfoField 와 이어 붙었을 때 한 덩어리로 보인다.
 *
 * 값 칸에 딱 붙이려면 호출부의 InfoField 에 `class="lp-field-flush"` 를 같이 준다
 * (InfoField 의 기본 안쪽 여백을 없앤다).
 *
 * 사용: PC-LPO-0601 관내현황 › 순찰차별 관할구역
 */
export interface FieldTableColumn {
  /** 행 객체에서 값을 꺼낼 키. `cell-{key}` 슬롯 이름이기도 하다 */
  key: string
  /** 헤더에 표시할 문구 */
  label: string
  /** 컬럼 폭 (예: '20rem'). 안 주면 남는 폭을 나눠 갖는다 */
  width?: string
  /** 셀 정렬. 기본은 왼쪽 — 코드처럼 짧은 값만 가운데로 준다 */
  align?: 'left' | 'center'
}

withDefaults(
  defineProps<{
    columns: FieldTableColumn[]
    /** 행 배열. 슬롯의 `item` 이 이 타입 그대로 넘어온다(제네릭 T) */
    items: T[]
    /** 행이 없을 때 보여줄 문구 */
    placeholder?: string
    /** 스크린리더용 표 설명 (화면에는 안 보인다) */
    caption?: string
  }>(),
  {
    placeholder: '등록된 내용이 없습니다',
    caption: undefined,
  },
)
</script>
