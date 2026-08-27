<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { TreeView, type TreeNode, type TreeStat } from '@/components/custom/tree'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/custom/checkbox'

/**
 * custom/tree 의 TreeView 사용 가이드 페이지.
 * 라이브러리를 직접 쓰지 않고 공통 컴포넌트만으로 어디까지 되는지 보여준다.
 */

/* ------------------------------------------------------------------ *
 * 기능 지원 요약
 * ------------------------------------------------------------------ */
type SupportRow = { feature: string; level: 'ok' | 'partial' | 'no'; badge: string; how: string }

const supportMatrix: SupportRow[] = [
  { feature: '노드 접기/펼치기', level: 'ok', badge: '지원', how: '기본 제공 (키보드 조작 가능)' },
  { feature: '드래그 재정렬(순서/계층 이동)', level: 'ok', badge: '지원', how: 'draggable 프롭' },
  { feature: '체크박스(상·하위 연동)', level: 'ok', badge: '지원', how: 'checkable 프롭 + @check-change' },
  { feature: '노드 추가/삭제', level: 'ok', badge: '지원', how: '#actions 슬롯 + v-model 데이터 직접 조작' },
  { feature: '노드 모양 커스터마이즈', level: 'ok', badge: '지원', how: '#label / #actions 슬롯' },
  { feature: '트리 라인 · 들여쓰기', level: 'ok', badge: '지원', how: 'treeLine · indent 프롭' },
  { feature: '전체 펼치기/접기', level: 'ok', badge: '지원', how: 'ref 로 openAll() · closeAll()' },
  {
    feature: '트리 간 노드 이동',
    level: 'no',
    badge: '미지원',
    how: '@he-tree/vue v2.10.5 라이브러리 제약. 한 트리 안에서의 이동만 가능',
  },
  { feature: '가상 리스트(대용량)', level: 'partial', badge: '부분', how: 'getTree() 로 원본 인스턴스 접근 후 별도 설정' },
]

/* ------------------------------------------------------------------ *
 * 예제 데이터
 * ------------------------------------------------------------------ */
interface MenuNode extends TreeNode {
  name: string
  open?: boolean
  children?: MenuNode[]
}

const makeInitialData = (): MenuNode[] => [
  {
    name: '지역경찰',
    open: true,
    children: [
      { name: '개인수첩', children: [{ name: '메모' }, { name: '근무일정 조회' }] },
      { name: '근무일지', children: [{ name: '근무일지(甲)' }, { name: '근무일지(乙)' }] },
    ],
  },
  {
    name: '시스템 관리',
    open: true,
    children: [
      { name: '게시판 관리' },
      { name: '팝업 관리' },
    ],
  },
  { name: '앱 관리' },
]

/* 1) 기본 */
const basicData = ref<MenuNode[]>(makeInitialData())

/* 2) 체크박스 */
const checkableData = ref<MenuNode[]>(makeInitialData())
const checkedNames = ref<string[]>([])

function onCheckChange(nodes: TreeNode[]) {
  checkedNames.value = nodes.map((node) => String(node.name))
}

/* 3) 노드 추가/삭제 + 옵션 토글 */
const editableData = ref<MenuNode[]>(makeInitialData())
const editableTreeRef = ref<InstanceType<typeof TreeView> | null>(null)
const showTreeLine = ref(true)
const enableDrag = ref(true)

let seq = 1

function addRoot() {
  editableData.value.push({ name: `새 메뉴 ${seq++}` })
}

/** stat.data 가 노드 원본이라 children 배열을 직접 만지면 된다 */
function addChild(stat: TreeStat) {
  const node = stat.data as MenuNode
  if (!node.children) node.children = []
  node.children.push({ name: `하위 메뉴 ${seq++}` })
  stat.open = true
}

/** 루트 노드는 부모가 없으므로 최상위 배열에서 지운다 */
function removeNode(stat: TreeStat) {
  const siblings = (stat.parent ? stat.parent.data.children : editableData.value) as MenuNode[]
  const index = siblings.indexOf(stat.data as MenuNode)
  if (index > -1) siblings.splice(index, 1)
}

function resetEditable() {
  editableData.value = makeInitialData()
  seq = 1
}

function showChecked() {
  const names = editableTreeRef.value?.getChecked().map((node) => String(node.name)) ?? []
  toast('선택된 노드', {
    description: names.length ? names.join(', ') : '선택된 노드가 없습니다.',
  })
}
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">TreeView 가이드</h1>
        <p class="mt-2 text-gray-500">
          <code class="rounded bg-gray-100 px-1">@/components/custom/tree</code> 의
          <code class="rounded bg-gray-100 px-1">TreeView</code> 사용법입니다.
          내부적으로
          <a
            href="https://github.com/phphe/he-tree"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary underline underline-offset-4"
          >he-tree (@he-tree/vue)</a>
          를 감싸고 있어, 화면에서는 라이브러리를 직접 import 하지 않습니다.
        </p>
      </header>

      <!-- ============ 기능 지원 요약 ============ -->
      <section class="space-y-3 pb-10" aria-labelledby="tree-support-title">
        <h2 id="tree-support-title" class="text-2xl font-semibold">기능 지원 요약</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <caption class="sr-only">TreeView 기능별 지원 여부와 구현 방식</caption>
            <thead>
              <tr class="bg-gray-50 text-left">
                <th scope="col" class="border px-3 py-2 w-10">#</th>
                <th scope="col" class="border px-3 py-2">기능</th>
                <th scope="col" class="border px-3 py-2 w-24 text-center">지원</th>
                <th scope="col" class="border px-3 py-2">구현 방식</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in supportMatrix" :key="row.feature">
                <td class="border px-3 py-2 text-center">{{ i + 1 }}</td>
                <td class="border px-3 py-2">{{ row.feature }}</td>
                <td class="border px-3 py-2 text-center">
                  <span
                    :class="{
                      'text-green-600': row.level === 'ok',
                      'text-amber-500': row.level === 'partial',
                      'text-red-500': row.level === 'no',
                    }"
                  >{{ row.badge }}</span>
                </td>
                <td class="border px-3 py-2 text-gray-600">{{ row.how }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 1. 기본 ============ -->
      <section class="space-y-4 pb-10" aria-labelledby="tree-basic-title">
        <h2 id="tree-basic-title" class="text-2xl font-semibold">1. 기본 사용</h2>
        <p class="text-gray-500">
          데이터만 <code class="rounded bg-gray-100 px-1">v-model</code> 로 넘기면 됩니다.
          노드 이름 키가 <code class="rounded bg-gray-100 px-1">name</code> 이 아니면
          <code class="rounded bg-gray-100 px-1">label-key</code> 로 지정합니다.
        </p>

        <TreeView v-model="basicData" />

        <pre class="rounded bg-gray-50 p-4 text-xs overflow-x-auto"><code>&lt;TreeView v-model="treeData" /&gt;</code></pre>
      </section>

      <!-- ============ 2. 체크박스 ============ -->
      <section class="space-y-4 pb-10" aria-labelledby="tree-check-title">
        <h2 id="tree-check-title" class="text-2xl font-semibold">2. 체크박스</h2>
        <p class="text-gray-500">
          <code class="rounded bg-gray-100 px-1">checkable</code> 을 주면 상·하위가 연동되는 체크박스가 붙습니다.
          체크가 바뀌면 <code class="rounded bg-gray-100 px-1">@check-change</code> 로 선택된 노드 목록이 넘어옵니다.
        </p>

        <TreeView v-model="checkableData" checkable @check-change="onCheckChange" />

        <p class="text-sm text-gray-500">
          선택된 노드: <strong>{{ checkedNames.length ? checkedNames.join(', ') : '없음' }}</strong>
        </p>

        <pre class="rounded bg-gray-50 p-4 text-xs overflow-x-auto"><code>&lt;TreeView v-model="treeData" checkable @check-change="onCheckChange" /&gt;</code></pre>
      </section>

      <!-- ============ 3. 노드 추가/삭제 ============ -->
      <section class="space-y-4 pb-10" aria-labelledby="tree-edit-title">
        <h2 id="tree-edit-title" class="text-2xl font-semibold">3. 노드 추가 · 삭제 · 옵션</h2>
        <p class="text-gray-500">
          노드 우측 버튼은 <code class="rounded bg-gray-100 px-1">#actions</code> 슬롯입니다.
          마우스를 올리거나 키보드 포커스가 들어오면 나타납니다.
          전체 펼치기/접기는 <code class="rounded bg-gray-100 px-1">ref</code> 로 호출합니다.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <Button type="button" variant="tertiary2" size="sm" @click="addRoot">루트 노드 추가</Button>
          <Button type="button" variant="tertiary2" size="sm" @click="editableTreeRef?.openAll()">
            전체 펼치기
          </Button>
          <Button type="button" variant="tertiary2" size="sm" @click="editableTreeRef?.closeAll()">
            전체 접기
          </Button>
          <Button type="button" variant="tertiary2" size="sm" @click="showChecked">선택 노드 보기</Button>
          <Button type="button" variant="tertiary2" size="sm" @click="resetEditable">초기화</Button>

          <span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

          <Checkbox v-model="showTreeLine" label="트리 라인" />
          <Checkbox v-model="enableDrag" label="드래그 이동" />
        </div>

        <TreeView
          ref="editableTreeRef"
          v-model="editableData"
          checkable
          :tree-line="showTreeLine"
          :draggable="enableDrag"
        >
          <template #actions="{ stat }">
            <Button
              type="button"
              variant="tertiary2"
              size="xxs"
              aria-label="하위 노드 추가"
              @click.stop="addChild(stat)"
            >
              ＋
            </Button>
            <Button
              type="button"
              variant="tertiary2"
              size="xxs"
              aria-label="노드 삭제"
              @click.stop="removeNode(stat)"
            >
              ×
            </Button>
          </template>
        </TreeView>
      </section>

      <!-- ============ Props ============ -->
      <section class="space-y-3" aria-labelledby="tree-props-title">
        <h2 id="tree-props-title" class="text-2xl font-semibold">Props · Slots · 메서드</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <caption class="sr-only">TreeView 의 props, 슬롯, 노출 메서드</caption>
            <thead>
              <tr class="bg-gray-50 text-left">
                <th scope="col" class="border px-3 py-2 w-40">이름</th>
                <th scope="col" class="border px-3 py-2 w-28">구분</th>
                <th scope="col" class="border px-3 py-2">설명</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">modelValue</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">트리 데이터 (v-model)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">labelKey</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">노드 이름 키 (기본 <code>name</code>)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">childrenKey</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">하위 배열 키 (기본 <code>children</code>)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">checkable</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">체크박스 표시 (상·하위 연동)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">draggable</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">드래그 이동 허용 (기본 true)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">treeLine · indent</th><td class="border px-3 py-2">prop</td><td class="border px-3 py-2">계층선 표시 · 들여쓰기(px)</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">#label</th><td class="border px-3 py-2">slot</td><td class="border px-3 py-2">라벨 영역 교체 <code>{ node, stat }</code></td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">#actions</th><td class="border px-3 py-2">slot</td><td class="border px-3 py-2">우측 버튼 영역 <code>{ node, stat }</code></td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">#default</th><td class="border px-3 py-2">slot</td><td class="border px-3 py-2">한 줄 전체를 직접 그릴 때</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">@node-click</th><td class="border px-3 py-2">event</td><td class="border px-3 py-2">라벨 클릭 <code>(node, stat)</code></td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">@check-change</th><td class="border px-3 py-2">event</td><td class="border px-3 py-2">체크된 노드 목록</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">openAll() · closeAll()</th><td class="border px-3 py-2">method</td><td class="border px-3 py-2">전체 펼치기 · 접기</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">getChecked()</th><td class="border px-3 py-2">method</td><td class="border px-3 py-2">체크된 노드 원본 배열</td></tr>
              <tr><th scope="row" class="border px-3 py-2 text-left font-mono">getTree()</th><td class="border px-3 py-2">method</td><td class="border px-3 py-2">he-tree 인스턴스 (예외 상황용)</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
