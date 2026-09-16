<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { X } from "lucide-vue-next"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { deviceStyle, type DeviceMode } from "@/lib/deviceStyle"
import { Button } from "@/components/custom/button"
import Icon from "@/components/custom/icon/Icon.vue"

/** 추천검색어 한 줄. trend 는 전 회차 대비 순위 변동(없으면 '-' 로 그린다) */
export interface RecommendedKeyword {
  keyword: string
  /** 'up' | 'down' | 'none' */
  trend?: "up" | "down" | "none"
  /** 변동 폭. trend 가 up/down 일 때만 쓴다 */
  diff?: number
}

/**
 * 검색어를 입력하기 전에 보여주는 두 칸짜리 안내 영역 —
 * 왼쪽 "최근검색어"(칩, 개별/전체 삭제), 오른쪽 "추천검색어"(순위 + 변동).
 * Figma: 최근검색어(11722:93550) + 인기검색어(11722:93570)
 *
 * 쓰는 화면: PM-COM-0801(통합검색) · PM-IRC-0101(사건대응 시나리오)
 */
interface Props {
  recent?: string[]
  recommended?: RecommendedKeyword[]
  class?: HTMLAttributes["class"]
  /** 기기 정책. 'responsive'(기본) 폭 따라 / 'pc' 고정 / 'mobile' 고정 */
  device?: DeviceMode
}

const props = withDefaults(defineProps<Props>(), {
  recent: () => [],
  recommended: () => [],
  class: undefined,
  device: "responsive",
})

/** 두 칸의 좌우 여백 — 모바일은 화면 폭을 꽉 쓴다 */
const sectionClass = computed(() => deviceStyle({ pc: "px-6", mobile: "px-0" }, props.device))

const emit = defineEmits<{
  /** 검색어(칩·순위)를 눌렀다 — 화면이 그 값으로 검색을 건다 */
  (e: "select", keyword: string): void
  /** 최근검색어 하나를 지웠다 */
  (e: "remove", keyword: string): void
  /** 최근검색어 전체 삭제 */
  (e: "clear"): void
}>()
</script>

<template>
  <div :class="cn('grid w-full grid-cols-1 gap-[4rem] lg:grid-cols-2', props.class)">
    <!-- 최근검색어 -->
    <section :class="sectionClass">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-[1.9rem] leading-[1.5] font-bold text-[var(--Text-body_0)]">최근검색어</h2>
        <Button
          v-if="recent.length"
          type="button"
          variant="text"
          size="xs"
          class="min-w-0 text-[var(--Text-body_1)]"
          @click="emit('clear')"
        >
          전체 삭제
          <Icon name="deleteCircle" size="1.6rem" />
        </Button>
      </div>

      <ul v-if="recent.length" class="mt-4 flex flex-wrap gap-2">
        <li v-for="keyword in recent" :key="keyword">
          <span
            class="flex h-[4rem] items-center gap-1 rounded-full border border-[var(--Border_gray02)] bg-white pr-3 pl-4 text-[1.5rem] text-[var(--Text-body_0)]"
          >
            <button type="button" class="max-w-[20rem] truncate" @click="emit('select', keyword)">
              {{ keyword }}
            </button>
            <button
              type="button"
              class="flex size-6 items-center justify-center text-[var(--Text-body_1)]"
              @click="emit('remove', keyword)"
            >
              <span class="blind">{{ keyword }} 삭제</span>
              <X class="size-[1.6rem]" aria-hidden="true" />
            </button>
          </span>
        </li>
      </ul>
      <p v-else class="mt-4 text-[1.9rem] text-[var(--Text-body_2)]">최근검색어가 없습니다.</p>
    </section>

    <!-- 추천검색어 -->
    <section :class="sectionClass">
      <h2 class="text-[1.9rem] leading-[1.5] font-bold text-[var(--Text-body_0)]">추천검색어</h2>
      <ol class="mt-4 flex flex-col gap-4">
        <li v-for="(item, index) in recommended" :key="item.keyword" class="flex items-center gap-2">
          <span class="w-[2rem] shrink-0 text-[1.7rem] text-[var(--Text-body_0)]">{{ index + 1 }}</span>
          <button
            type="button"
            class="flex-1 truncate text-left text-[1.7rem] text-[var(--Text-body_0)] hover:underline"
            @click="emit('select', item.keyword)"
          >
            {{ item.keyword }}
          </button>
          <span class="flex w-[4.3rem] shrink-0 items-center justify-center gap-1 text-[1.5rem]">
            <template v-if="item.trend === 'up' || item.trend === 'down'">
              <span
                aria-hidden="true"
                class="size-0 border-x-[0.5rem] border-x-transparent"
                :class="
                  item.trend === 'up'
                    ? 'border-b-[0.7rem] border-b-[var(--Base--point)]'
                    : 'border-t-[0.7rem] border-t-[var(--Base-primary)]'
                "
              />
              <span
                :class="item.trend === 'up' ? 'text-[var(--Base--point)]' : 'text-[var(--Base-primary)]'"
              >
                <span class="blind">{{ item.trend === "up" ? "상승" : "하락" }}</span>
                {{ item.diff }}
              </span>
            </template>
            <span v-else class="text-[var(--Text-body_1)]">
              <span class="blind">변동 없음</span>-
            </span>
          </span>
        </li>
      </ol>
    </section>
  </div>
</template>
