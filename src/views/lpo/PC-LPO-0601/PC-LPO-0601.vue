<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import DepartmentToolbar from './components/DepartmentToolbar.vue'
import DepartmentInfoSection from './components/DepartmentInfoSection.vue'
import DistrictInfoSection from './components/DistrictInfoSection.vue'
import { useJurisdictionStatusForm } from './composable/useJurisdictionStatusForm.ts'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'

useSideMenuSetup({ ...localPoliceMenu, openIndex: 4, activeChild: '관내현황' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '관내현황' },
]

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'eulji' })
const updatedAt = '2024-09-01'
const updatedBy = '홍길동'

const { departmentInfo, districtInfo, patrolZones, workTypeOptions, regionOptions, jurisdictionPostOptions } =
  useJurisdictionStatusForm()
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="관내현황" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <DepartmentToolbar
    v-model:department="department"
    :updated-at="updatedAt"
    :updated-by="updatedBy"
  />

  <DepartmentInfoSection
    :model-value="departmentInfo"
    :work-type-options="workTypeOptions"
    :region-options="regionOptions"
    :jurisdiction-post-options="jurisdictionPostOptions"
  />

  <DistrictInfoSection :model-value="districtInfo" :patrol-zones="patrolZones" />
</template>
