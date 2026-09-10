<template>
  <div class="lp-page-scroll">
    <article class="board-detail">
      <p class="board-badges">
        <Badge v-if="spec.hasPinned && post.pinned" color="primary" variant="solid" size="md" shape="sm">
          공지
        </Badge>
        <Badge v-if="spec.hasCategory && post.category" color="grayLighter" variant="outline" size="md" shape="sm">
          {{ post.category }}
        </Badge>
        <Badge v-if="spec.hasOpenState && post.mine" color="grayLighter" variant="outline" size="md" shape="sm">
          내가 쓴 글
        </Badge>
        <Badge
          v-if="spec.hasOpenState"
          :color="post.open ? 'grayLighter' : 'tertiary'"
          variant="outline"
          size="md"
          shape="sm"
        >
          {{ post.open ? '공개' : '비공개' }}
        </Badge>
        <span v-if="spec.hasDept" class="board-dept">{{ post.dept }}</span>
        <span v-if="spec.hasProvince" class="board-dept">{{ post.province }}</span>
        <span v-if="spec.hasWeek" class="board-dept">{{ post.week }}</span>
      </p>

      <h2 class="board-title">{{ post.title }}</h2>

      <div class="board-meta lp-row-between">
        <span class="lp-meta-nowrap">
          {{ post.writer }} ｜ {{ post.createdAt }} ｜ 조회수 {{ post.viewCount }}
        </span>
        <Button
          v-if="spec.hasRecommend"
          type="button"
          variant="tertiary2"
          size="sm"
          @click="emit('recommend')"
        >
          <ThumbsUp :size="16" aria-hidden="true" />
          추천수 <b class="lp-em-primary">{{ post.recommendCount }}</b>
        </Button>
      </div>

      <!-- 본문 대표 이미지 자리 — Figma 는 회색 박스로만 그려져 있다 -->
      <div class="board-thumb" aria-hidden="true"></div>

      <div class="board-body">
        <p v-for="(line, i) in contentLines" :key="i" class="lp-body-text">{{ line }}</p>
      </div>

      <div v-if="post.files.length" class="lp-file-boxes">
        <FileUpload
          v-for="file in post.files"
          :key="file.id"
          :file-name="file.name"
          readonly
          @download="onDownload(file.name)"
          @preview="onPreview(file.name)"
        />
      </div>

      <!-- 댓글 영역은 화면이 넣는다(게시판마다 스토어가 다르다) -->
      <slot />

      <div class="lp-row-between board-detail-actions">
        <Button type="button" variant="tertiary2" size="md" @click="emit('list')">목록</Button>
        <span class="group-gap2">
          <Button type="button" variant="tertiary2" size="md" @click="emit('remove')">삭제</Button>
          <Button type="button" variant="primary" size="md" @click="emit('edit')">수정</Button>
        </span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { ThumbsUp } from 'lucide-vue-next'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import type { BoardPost, BoardSpec } from '../composable/board'

/**
 * 게시판 글 상세 공용 본문(PM-COM-1102 ~ 2102).
 * 배지·부서·추천 버튼처럼 게시판마다 있고 없는 칸은 BoardSpec 의 has* 로 가른다.
 */
const props = defineProps<{
  spec: BoardSpec
  post: BoardPost
}>()

const emit = defineEmits<{
  (e: 'list'): void
  (e: 'edit'): void
  (e: 'remove'): void
  (e: 'recommend'): void
}>()

const contentLines = computed(() => props.post.content.split('\n'))

/** 실제 다운로드/미리보기는 개발팀 몫 — 화면에서는 눌린 것만 알린다 */
function onDownload(name: string) {
  toast.success(`${name} 다운로드를 시작합니다.`)
}

function onPreview(name: string) {
  toast.info(`${name} 을(를) 새 창에서 엽니다.`)
}
</script>
