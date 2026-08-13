<script setup lang="ts">
import { ref } from 'vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import type { DistrictInfoForm, PatrolZoneSummary } from './useJurisdictionStatusForm'
import styles from './infoGrid.module.css'

defineProps<{
  modelValue: DistrictInfoForm
  patrolZones: PatrolZoneSummary[]
}>()

const dongEditOpen = ref(false)

const mapPreviewOpen = ref(false)
const mapPreviewZone = ref('')

function openMapPreview(code: string) {
  mapPreviewZone.value = code
  mapPreviewOpen.value = true
}
</script>

<template>
  <section :class="styles.section" aria-labelledby="district-info-heading">
    <div :class="styles.sectionHead">
      <h3 id="district-info-heading" :class="styles.sectionTitle">관내정보</h3>
    </div>

    <div :class="styles.grid">
      <!-- 관할면적 -->
      <div :class="styles.field">
        <span :class="styles.label" id="lbl-area">관할면적</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-area">
          <p :class="styles.staticValue">{{ modelValue.area }}</p>
          <Button type="button" variant="tertiary2" size="sm" @click="dongEditOpen = true">
            행정동 수정
          </Button>
        </div>
      </div>

      <!-- 인구 -->
      <div :class="styles.field">
        <span :class="styles.label" id="lbl-population">인구</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-population">
          <span :class="styles.hint">총인구 {{ modelValue.populationTotal ?? 0 }}명</span>
          <div :class="styles.miniField">
            <label class="text-[1.4rem] text-[var(--Text-body_1)]" for="district-population-male">남</label>
            <InputField2 id="district-population-male" v-model="modelValue.populationMale" size="sm" input-class="w-20" class="!space-y-0" />
          </div>
          <div :class="styles.miniField">
            <label class="text-[1.4rem] text-[var(--Text-body_1)]" for="district-population-female">여</label>
            <InputField2 id="district-population-female" v-model="modelValue.populationFemale" size="sm" input-class="w-20" class="!space-y-0" />
          </div>
        </div>
      </div>

      <!-- 가구 -->
      <div :class="[styles.field, styles.fieldFull]">
        <span :class="styles.label" id="lbl-households">가구</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-households">
          <div :class="styles.flexGroupRow">
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-households">가구</label>
              <InputField2 id="district-households" v-model="modelValue.households" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-row-houses">연립주택수</label>
              <InputField2 id="district-row-houses" v-model="modelValue.rowHouses" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-apartments">아파트동수</label>
              <InputField2 id="district-apartments" v-model="modelValue.apartmentBuildings" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-villas">빌라동수</label>
              <InputField2 id="district-villas" v-model="modelValue.villaBuildings" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-one-room">원룸수</label>
              <InputField2 id="district-one-room" v-model="modelValue.oneRoomUnits" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-cash-shops">벌집가수</label>
              <InputField2 id="district-cash-shops" v-model="modelValue.cashIntensiveShops" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
            <div :class="styles.miniField">
              <label :class="styles.miniLabel" for="district-entertainment-shops">풍속업소수</label>
              <InputField2 id="district-entertainment-shops" v-model="modelValue.entertainmentShops" size="sm" input-class="w-20" class="!space-y-0" />
            </div>
          </div>
        </div>
      </div>

      <!-- 전체 관할구역 -->
      <div :class="[styles.field, styles.fieldFull]">
        <span :class="styles.label" id="lbl-full-jurisdiction">전체 관할구역</span>
        <div :class="styles.controlColumn" role="group" aria-labelledby="lbl-full-jurisdiction">
          <p :class="styles.readonlyText">{{ modelValue.fullJurisdiction }}</p>
        </div>
      </div>

      <!-- 순찰차별 관할구역 -->
      <div :class="[styles.field, styles.fieldFull]">
        <span :class="styles.label" id="lbl-patrol-zones">순찰차별 관할구역</span>
        <div :class="styles.controlColumn" role="group" aria-labelledby="lbl-patrol-zones">
          <ul :class="styles.list">
            <li v-for="zone in patrolZones" :key="zone.code" :class="styles.listRow">
              <span :class="styles.listRowCode">{{ zone.code }}</span>
              <span :class="styles.listRowArea">{{ zone.area || '미지정' }}</span>
              <Button type="button" variant="text" size="xs" @click="openMapPreview(zone.code)">
                지도보기
              </Button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 지역특성 및 중점 추진사항 -->
      <div :class="[styles.field, styles.fieldFull]">
        <label :class="styles.label" for="district-characteristics">지역특성 및<br />중점 추진사항</label>
        <div :class="styles.controlColumn">
          <TextareaField
            id="district-characteristics"
            v-model="modelValue.characteristics"
            class="w-full !space-y-0"
            textarea-class="w-full"
            :height="120"
          />
        </div>
      </div>
    </div>

    <EmptyStubDialog v-model:open="dongEditOpen" title="행정동 수정" description="관할 법정동/행정동 구성을 수정합니다." />
    <EmptyStubDialog v-model:open="mapPreviewOpen" :title="`${mapPreviewZone} 지도보기`" description="순찰구역 지도를 표시합니다." />
  </section>
</template>
