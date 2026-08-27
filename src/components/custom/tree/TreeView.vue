<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { Draggable, OpenIcon } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'
import { File, Folder, FolderOpen } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/custom/checkbox'

/**
 * 트리 뷰 (@he-tree/vue 래퍼).
 *
 * 화면마다 Draggable 을 직접 조립하지 않도록 감싼 공통 컴포넌트다.
 * 노드 모양이 특별한 화면은 #default 슬롯으로 한 줄을 통째로 그리고,
 * 라벨 옆에 버튼만 붙이면 되는 화면은 #actions 슬롯만 쓰면 된다.
 *
 * 주의: v2.10.5 기준 '서로 다른 두 트리 사이의 드래그 이동'은 라이브러리가 지원하지 않는다.
 * 한 트리 안에서의 순서·계층 이동만 가능하다.
 */
export interface TreeNode {
  [key: string]: any
  children?: TreeNode[]
}

/** he-tree 가 노드마다 들고 있는 상태 객체 */
export interface TreeStat {
  data: TreeNode
  open: boolean
  checked: boolean
  children: TreeStat[]
  parent: TreeStat | null
  level: number
}

interface Props {
  /** 트리 데이터 (v-model) */
  modelValue: TreeNode[]
  /** 노드 이름이 담긴 키 */
  labelKey?: string
  /** 하위 노드 배열이 담긴 키 */
  childrenKey?: string
  /** 노드마다 체크박스를 표시(상·하위 연동) */
  checkable?: boolean
  /** 드래그로 순서·계층을 바꿀 수 있게 할지 */
  draggable?: boolean
  /** 계층을 잇는 선 표시 */
  treeLine?: boolean
  /** 단계별 들여쓰기(px) */
  indent?: number
  /** 하위가 있으면 폴더, 없으면 문서 아이콘을 노드 앞에 표시 */
  showIcon?: boolean
  /** 선택된 노드 (v-model:selected). 선택 항목은 색으로 구분된다 */
  selected?: TreeNode | null
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: 'name',
  childrenKey: 'children',
  checkable: false,
  draggable: true,
  treeLine: true,
  indent: 24,
  showIcon: false,
  selected: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TreeNode[]): void
  (e: 'update:selected', value: TreeNode | null): void
  /** 노드 라벨 클릭 */
  (e: 'node-click', node: TreeNode, stat: TreeStat): void
  /** 체크 상태가 바뀐 뒤의 체크된 노드 목록 */
  (e: 'check-change', nodes: TreeNode[]): void
}>()

const treeRef = ref<any>(null)

const treeData = computed({
  get: () => props.modelValue,
  set: (value: TreeNode[]) => emit('update:modelValue', value),
})

function labelOf(node: TreeNode) {
  return String(node[props.labelKey] ?? '')
}

function onToggle(stat: TreeStat) {
  stat.open = !stat.open
}

function onSelect(node: TreeNode, stat: TreeStat) {
  emit('update:selected', node)
  emit('node-click', node, stat)
}

function onCheckChange() {
  emit('check-change', getCheckedNodes())
}

function getCheckedNodes(): TreeNode[] {
  const stats = (treeRef.value?.getChecked() ?? []) as TreeStat[]
  return stats.map((stat) => stat.data)
}

defineExpose({
  /** 전체 펼치기 */
  openAll: () => treeRef.value?.openAll(),
  /** 전체 접기 */
  closeAll: () => treeRef.value?.closeAll(),
  /** 체크된 노드의 원본 데이터 목록 */
  getChecked: getCheckedNodes,
  /** he-tree 인스턴스를 직접 다뤄야 할 때 */
  getTree: () => treeRef.value,
})
</script>

<template>
  <div :class="cn('treeView', props.class)">
    <Draggable
      ref="treeRef"
      v-model="treeData"
      :tree-line="treeLine"
      :indent="indent"
      :children-key="childrenKey"
      :each-droppable="() => draggable"
      :each-draggable="() => draggable"
    >
      <template #default="{ node, stat }">
        <div class="treeRow" :class="{ 'is-selected': selected === node }">
          <!--
            접기/펼치기는 실제 button 이어야 키보드로 조작할 수 있다.
            하위가 없는 노드는 자리만 비워 라벨 시작 위치를 맞춘다.
          -->
          <button
            v-if="stat.children.length"
            type="button"
            class="treeToggle"
            :aria-expanded="stat.open"
            :aria-label="`${labelOf(node)} ${stat.open ? '접기' : '펼치기'}`"
            @click.stop="onToggle(stat)"
          >
            <OpenIcon :open="stat.open" />
          </button>
          <span v-else class="treeToggle treeToggle--empty" aria-hidden="true" />

          <Checkbox
            v-if="checkable"
            v-model="stat.checked"
            :aria-label="labelOf(node)"
            @update:model-value="onCheckChange"
          />

          <slot name="label" :node="node" :stat="stat">
            <button type="button" class="treeLabel" @click="onSelect(node, stat)">
              <!--
                하위가 있으면 폴더(펼침 상태에 따라 열린/닫힌), 없으면 문서 아이콘.
                장식이라 스크린리더가 읽지 않게 감춘다.
              -->
              <component
                :is="stat.children.length ? (stat.open ? FolderOpen : Folder) : File"
                v-if="showIcon"
                class="treeIcon"
                aria-hidden="true"
              />
              <span class="treeLabelText">{{ labelOf(node) }}</span>
            </button>
          </slot>

          <span v-if="$slots.actions" class="treeActions">
            <slot name="actions" :node="node" :stat="stat" />
          </span>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.treeView {
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--Border_gray03);
  border-radius: 0.8rem;
  background: #fff;
}

.treeRow {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.4rem 0.6rem;
  border-radius: 0.6rem;
}

.treeRow:hover {
  background: var(--Surface-primary);
}

.treeToggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  cursor: pointer;
}

.treeToggle--empty {
  cursor: default;
}

.treeToggle:focus-visible,
.treeLabel:focus-visible {
  outline: 2px solid var(--Border_primary);
  outline-offset: 2px;
  border-radius: 0.4rem;
}

.treeLabel {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.5rem;
  text-align: left;
  color: var(--Text-body_0);
  cursor: pointer;
}

.treeLabelText {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.treeIcon {
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  color: var(--Text-body_2);
}

/* 선택된 노드는 색으로 구분한다 */
.treeRow.is-selected {
  background: var(--Surface-primary);
}

.treeRow.is-selected .treeLabel,
.treeRow.is-selected .treeIcon {
  color: var(--Base-primary);
  font-weight: 700;
}

/*
 * 액션 버튼은 마우스를 올렸을 때만 보이되, 키보드 포커스가 들어오면 반드시 보여야 한다.
 * (display:none 으로 감추면 포커스 자체가 못 들어간다)
 */
.treeActions {
  display: flex;
  gap: 0.4rem;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.treeRow:hover .treeActions,
.treeActions:focus-within {
  opacity: 1;
}

/* 드래그 중 드롭 위치 표시 */
:deep(.he-tree-drag-placeholder) {
  background: var(--Surface-primary);
  border: 1px dashed var(--Border_primary);
}
</style>
