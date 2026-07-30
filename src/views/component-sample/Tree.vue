<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Tree 샘플</h1>
      </div>

      <div class="text-gray-500 pb-8">
        <a
          href="https://github.com/phphe/he-tree"
          target="_blank"
          class="text-primary underline underline-offset-4"
        >
          he-tree (@he-tree/vue)
        </a>
        (v2.10) 를 이용한 드래그 앤 드롭 트리 예시 페이지입니다. 노드 접기/펼치기, 체크박스, 드래그 재정렬,
        노드 추가/삭제 기능을 아래 섹션별로 확인할 수 있습니다.
      </div>

      <!-- ============ 기능 지원 요약 ============ -->
      <section class="space-y-3 pb-10">
        <h2 class="text-2xl font-semibold">기능 지원 요약</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="border px-3 py-2 w-10">#</th>
                <th class="border px-3 py-2">기능</th>
                <th class="border px-3 py-2 w-24 text-center">지원</th>
                <th class="border px-3 py-2">구현 방식</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in supportMatrix" :key="i">
                <td class="border px-3 py-2 text-center">{{ i + 1 }}</td>
                <td class="border px-3 py-2">{{ row.feature }}</td>
                <td class="border px-3 py-2 text-center">
                  <span
                    :class="{
                      'text-green-600': row.level === 'ok',
                      'text-amber-500': row.level === 'partial',
                      'text-red-500': row.level === 'no',
                    }"
                    >{{ row.badge }}</span
                  >
                </td>
                <td class="border px-3 py-2 text-gray-600">{{ row.how }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 기본 드래그 트리 ============ -->
      <section class="space-y-4 pt-4">
        <h2 class="text-2xl font-semibold">기본 트리 (드래그 재정렬 · 체크박스)</h2>
        <div class="text-gray-500">
          노드 왼쪽 화살표로 하위 노드를 접고 펼칠 수 있습니다. 노드를 드래그해 순서를 바꾸거나 다른 노드의
          하위로 옮길 수 있습니다. 체크박스는 상위/하위가 연동됩니다.
        </div>

        <!-- 툴바 -->
        <div class="flex flex-wrap gap-2 items-center">
          <button class="btn" @click="addRootNode">루트 노드 추가</button>
          <button class="btn" @click="openAll">전체 펼치기</button>
          <button class="btn" @click="closeAll">전체 접기</button>
          <button class="btn" @click="printChecked">선택 노드 보기</button>
          <button class="btn" @click="resetTree">초기화</button>

          <span class="mx-1 h-5 w-px bg-gray-300" />

          <label class="inline-flex items-center gap-1 text-sm text-gray-600">
            <input type="checkbox" v-model="showTreeLine" />
            트리 라인 표시
          </label>
        </div>

        <div class="he-tree-host">
          <Draggable
            ref="mainTreeRef"
            v-model="treeData"
            :treeLine="showTreeLine"
            :indent="24"
            childrenKey="children"
          >
            <template #default="{ node, stat }">
              <div class="tree-node-row" :class="{ 'is-checked': stat.checked }">
                <!-- 접기/펼치기 아이콘 -->
                <OpenIcon
                  v-if="stat.children.length"
                  :open="stat.open"
                  class="mr-1 cursor-pointer"
                  @click="stat.open = !stat.open"
                />
                <span v-else class="inline-block w-4 mr-1" />

                <!-- 체크박스 (상/하위 연동) -->
                <input type="checkbox" class="mr-2" v-model="stat.checked" />

                <!-- 노드 라벨 -->
                <span class="node-label">{{ node.text }}</span>

                <!-- 노드별 액션 -->
                <span class="ml-auto flex gap-1 opacity-0 group-actions">
                  <button class="icon-btn" title="자식 추가" @click.stop="addChild(stat)">＋</button>
                  <button class="icon-btn text-red-500" title="삭제" @click.stop="removeNode(stat)">×</button>
                </span>
              </div>
            </template>
          </Draggable>
        </div>

        <p class="text-xs text-gray-400">
          · 노드에 마우스를 올리면 우측에 자식 추가(＋)/삭제(×) 버튼이 나타납니다. · 드래그 중에는 드롭 가능한
          위치에 플레이스홀더가 표시됩니다.
        </p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Draggable, OpenIcon } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'
import { toast } from 'vue-sonner'

/* ------------------------------------------------------------------ *
 * 기능 지원 요약 매트릭스
 * ------------------------------------------------------------------ */
type SupportRow = { feature: string; level: 'ok' | 'partial' | 'no'; badge: string; how: string }
const supportMatrix: SupportRow[] = [
  { feature: '노드 접기/펼치기', level: 'ok', badge: '지원', how: 'OpenIcon + stat.open 토글' },
  { feature: '드래그 재정렬(순서/계층 이동)', level: 'ok', badge: '지원', how: 'Draggable(Drag and Drop API 기반)' },
  { feature: '체크박스(상/하위 연동)', level: 'ok', badge: '지원', how: 'stat.checked 양방향 바인딩' },
  { feature: '노드 추가/삭제', level: 'ok', badge: '지원', how: 'v-model 데이터 직접 조작' },
  {
    feature: '트리 간 노드 이동',
    level: 'no',
    badge: '미지원',
    how: 'v2.10.5 기준 동작하지 않음(라이브러리 내부 isMoved 게이트가 항상 falsy). 트리 내 이동만 가능',
  },
  { feature: '트리 라인 표시', level: 'ok', badge: '지원', how: 'treeLine 프롭' },
  { feature: '들여쓰기 조정', level: 'ok', badge: '지원', how: 'indent 프롭(px)' },
  { feature: '가상 리스트(대용량)', level: 'partial', badge: '부분', how: 'virtualization 옵션(별도 설정 필요)' },
  { feature: '테이블 트리 모드', level: 'ok', badge: '지원', how: 'BaseTree + 테이블 슬롯 구성' },
  { feature: 'SSR / TypeScript', level: 'ok', badge: '지원', how: '패키지 기본 지원' },
]

/* ------------------------------------------------------------------ *
 * 트리 데이터 타입 및 초기값
 * ------------------------------------------------------------------ */
type TreeItem = {
  text: string
  open?: boolean
  checked?: boolean
  children?: TreeItem[]
}

const makeInitialData = (): TreeItem[] => [
  {
    text: '프로젝트',
    open: true,
    children: [
      {
        text: '프론트엔드',
        open: true,
        children: [{ text: 'Vue' }, { text: 'TypeScript' }, { text: 'Tailwind' }],
      },
      {
        text: '백엔드',
        children: [{ text: 'Node.js' }, { text: 'PostgreSQL' }],
      },
    ],
  },
  {
    text: '문서',
    children: [{ text: '요구사항' }, { text: '디자인 가이드' }],
  },
  { text: '기타' },
]

const treeData = ref<TreeItem[]>(makeInitialData())
const mainTreeRef = ref<any>(null)
const showTreeLine = ref(true)

/* ------------------------------------------------------------------ *
 * 툴바 / 노드 액션
 * ------------------------------------------------------------------ */
let seq = 1

function addRootNode() {
  treeData.value.push({ text: `새 노드 ${seq++}` })
}

/* stat.data === 해당 노드 원본 객체. children 배열에 직접 추가 */
function addChild(stat: any) {
  const node = stat.data as TreeItem
  if (!node.children) node.children = []
  node.children.push({ text: `자식 ${seq++}` })
  stat.open = true
}

/* 부모 children(또는 루트)에서 해당 노드 제거 */
function removeNode(stat: any) {
  const parentChildren: TreeItem[] = stat.parent ? stat.parent.data.children : treeData.value
  const idx = parentChildren.indexOf(stat.data)
  if (idx > -1) parentChildren.splice(idx, 1)
}

function openAll() {
  mainTreeRef.value?.openAll()
}

function closeAll() {
  mainTreeRef.value?.closeAll()
}

/* 체크된 노드 목록 조회 */
function printChecked() {
  const checked = mainTreeRef.value?.getChecked() ?? []
  const names = checked.map((s: any) => s.data.text)
  toast('선택된 노드', {
    description: names.length ? names.join(', ') : '선택된 노드가 없습니다.',
  })
}

function resetTree() {
  treeData.value = makeInitialData()
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: background-color 0.15s ease;
}
.btn:hover {
  background-color: #f9fafb;
}

/* 트리 컨테이너 */
.he-tree-host {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fff;
}

/* 노드 한 줄 레이아웃 */
.tree-node-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.25rem 0.375rem;
  border-radius: 0.375rem;
}
.tree-node-row:hover {
  background-color: #f3f4f6;
}
.tree-node-row.is-checked .node-label {
  color: #2563eb;
  font-weight: 600;
}
.node-label {
  font-size: 0.9rem;
}

/* 호버 시 노출되는 액션 버튼 */
.tree-node-row:hover .group-actions {
  opacity: 1;
}
.icon-btn {
  width: 1.25rem;
  height: 1.25rem;
  line-height: 1;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 0.85rem;
}
.icon-btn:hover {
  background: #f3f4f6;
}

/* 드래그 플레이스홀더(드롭 위치 표시) 색상 커스텀 */
:deep(.he-tree-drag-placeholder) {
  background-color: #dbeafe;
  border: 1px dashed #3b82f6;
}
</style>
