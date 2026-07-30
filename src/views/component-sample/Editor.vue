<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">TOAST UI Editor 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        <a
          href="https://github.com/nhn/tui.editor"
          target="_blank"
          class="text-primary underline underline-offset-4"
        >
          @toast-ui/editor
        </a>
        (v3.2) 를 이용한 마크다운 / WYSIWYG 에디터 예시 페이지입니다. 대한민국(ko) 언어가 적용되어 있으며,
        vanilla 인스턴스를 <code>onMounted</code> 시점에 생성/파괴하는 방식으로 통합했습니다.
      </div>

      <!-- ============ Section 1: 에디터 ============ -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">마크다운 / WYSIWYG 에디터</h2>
        <div class="text-gray-500">
          툴바 · 마크다운↔WYSIWYG 모드 전환 · 미리보기 스타일 전환 · 이미지/링크/표/코드블록 등을 지원합니다.
        </div>

        <!-- 툴바(외부 컨트롤) -->
        <div class="flex flex-wrap gap-2 items-center">
          <button class="btn" @click="changeMode('markdown')">마크다운 모드</button>
          <button class="btn" @click="changeMode('wysiwyg')">WYSIWYG 모드</button>

          <span class="mx-1 h-5 w-px bg-gray-300" />

          <label class="text-sm text-gray-600">미리보기:</label>
          <select
            class="border rounded px-2 py-1 text-sm"
            v-model="previewStyle"
            @change="applyPreviewStyle"
          >
            <option value="vertical">분할(vertical)</option>
            <option value="tab">탭(tab)</option>
          </select>

          <span class="mx-1 h-5 w-px bg-gray-300" />

          <button class="btn" @click="loadSample">샘플 불러오기</button>
          <button class="btn" @click="clearContent">내용 비우기</button>
        </div>

        <!-- 에디터 마운트 지점 -->
        <div ref="editorEl" />
      </section>

      <!-- ============ Section 2: 저장 결과 확인 ============ -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">저장 결과 확인</h2>
        <div class="text-gray-500">
          <code>getMarkdown()</code> / <code>getHTML()</code> 로 현재 내용을 추출하고,
          그 결과를 아래 Viewer 로 렌더링합니다.
        </div>

        <div class="flex flex-wrap gap-2 items-center">
          <button class="btn" @click="extract">현재 내용 가져오기 → 렌더링</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium mb-1">Markdown 원본</div>
            <pre class="output-box">{{ markdownOutput || '(내용 없음 — 가져오기 버튼을 눌러주세요)' }}</pre>
          </div>
          <div>
            <div class="text-sm font-medium mb-1">HTML 원본</div>
            <pre class="output-box">{{ htmlOutput || '(내용 없음 — 가져오기 버튼을 눌러주세요)' }}</pre>
          </div>
        </div>
      </section>

      <!-- ============ Section 3: Viewer ============ -->
      <section class="space-y-4 pt-10 pb-6">
        <h2 class="text-2xl font-semibold">Viewer (읽기 전용 렌더링)</h2>
        <div class="text-gray-500">
          <code>Editor.factory({ viewer: true })</code> 로 생성한 읽기 전용 뷰어입니다. 위에서 가져온
          마크다운을 그대로 렌더링합니다.
        </div>
        <div ref="viewerEl" class="border rounded-lg p-4" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/ko-kr'

type EditorType = 'markdown' | 'wysiwyg'
type PreviewStyle = 'vertical' | 'tab'

/** 샘플 마크다운 초기값 */
const sampleMarkdown = [
  '# TOAST UI Editor',
  '',
  '> NHN 에서 만든 **마크다운 / WYSIWYG** 에디터입니다.',
  '',
  '## 주요 기능',
  '',
  '- 마크다운 ↔ WYSIWYG 실시간 전환',
  '- 표, 이미지, 링크, 코드 블록 지원',
  '- 문법 하이라이트 미리보기',
  '',
  '### 코드 예시',
  '',
  '```ts',
  'const editor = new Editor({ el, initialEditType: "markdown" })',
  '```',
  '',
  '### 표 예시',
  '',
  '| 기능 | 지원 |',
  '| --- | :---: |',
  '| 마크다운 | ✅ |',
  '| WYSIWYG | ✅ |',
  '| Viewer | ✅ |',
  '',
  '[프로젝트 저장소](https://github.com/nhn/tui.editor)',
].join('\n')

const editorEl = ref<HTMLElement | null>(null)
const viewerEl = ref<HTMLElement | null>(null)

let editor: Editor | null = null
// Editor.factory 는 viewer 인스턴스를 반환 (Editor | Viewer)
let viewer: ReturnType<typeof Editor.factory> | null = null

const previewStyle = ref<PreviewStyle>('vertical')
const markdownOutput = ref('')
const htmlOutput = ref('')

/** 마크다운 ↔ WYSIWYG 모드 전환 */
function changeMode(mode: EditorType) {
  editor?.changeMode(mode)
}

/** 미리보기 스타일(분할/탭) 적용 */
function applyPreviewStyle() {
  editor?.changePreviewStyle(previewStyle.value)
}

/** 샘플 마크다운 로드 */
function loadSample() {
  editor?.setMarkdown(sampleMarkdown)
}

/** 에디터 내용 비우기 */
function clearContent() {
  editor?.setMarkdown('')
}

/** 현재 에디터 내용을 추출해 하단 Viewer 로 렌더링 */
function extract() {
  if (!editor) return
  markdownOutput.value = editor.getMarkdown()
  htmlOutput.value = editor.getHTML()
  viewer?.setMarkdown(markdownOutput.value)
}

onMounted(() => {
  editor = new Editor({
    el: editorEl.value as HTMLElement,
    height: '480px',
    initialEditType: 'markdown', // 시작은 마크다운 모드
    previewStyle: previewStyle.value, // 분할 미리보기
    initialValue: sampleMarkdown,
    language: 'ko-KR',
    usageStatistics: false, // 사용 통계 전송 비활성화
    placeholder: '내용을 입력하세요...',
  })

  // 읽기 전용 뷰어 생성 (viewer: true)
  viewer = Editor.factory({
    el: viewerEl.value as HTMLElement,
    viewer: true,
    initialValue: sampleMarkdown,
  })
})

onBeforeUnmount(() => {
  editor?.destroy()
  viewer?.destroy()
})
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

.output-box {
  min-height: 8rem;
  max-height: 20rem;
  overflow: auto;
  padding: 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}
</style>
