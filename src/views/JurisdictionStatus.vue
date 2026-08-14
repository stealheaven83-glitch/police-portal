<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/Bread-crumb/Breadcrumb.vue'
import DepartmentToolbar from './jurisdiction-status/DepartmentToolbar.vue'
import DepartmentInfoSection from './jurisdiction-status/DepartmentInfoSection.vue'
import DistrictInfoSection from './jurisdiction-status/DistrictInfoSection.vue'
import { useJurisdictionStatusForm } from './jurisdiction-status/useJurisdictionStatusForm'

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '관내현황' },
]

const headquarters = ref('hq')
const division = ref('central-report')
const unit = ref('eulji')
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
    v-model:headquarters="headquarters"
    v-model:division="division"
    v-model:unit="unit"
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
