<template>
  <GenericDialog2
    :open="open"
    title="순찰구역 상세"
    :size="720"
    @update:open="emit('update:open', $event)"
  >
    <p class="lp-meta-nowrap">순찰구역명: <b class="lp-em-primary">{{ areaName }}</b></p>

    <LayoutSplite :count="2" class="lp-table-gap">
      <template #layout-1>
        <LayoutHeader title="순찰구역 상세관리" />
        <TabulatorGrid
          ref="gridRef"
          :columns="columns"
          :data="points"
          height="300px"
          selectable
          placeholder="등록된 지점이 없습니다"
          @row-click="onRowClick"
          @table-built="onTableBuilt"
        />
      </template>
      <template #layout-2>
        <LayoutHeader title="순찰구역 상세" />
        <div class="lp-pane-box">
          <InfoTable :columns="1" :size="80">
            <InfoField label="순서">
              <InputField2 v-model="form.order" size="sm" aria-label="순서" />
            </InfoField>
            <InfoField label="구역명">
              <InputField2 v-model="form.name" size="sm" aria-label="구역명" />
            </InfoField>
            <InfoField label="주소">
              <InputField2
                v-model="form.address"
                size="sm"
                placeholder="주소검색"
                aria-label="주소"
                :icon="searchIcon"
                @search="emit('search-address')"
              />
              <InputField2 v-model="form.addressDetail" size="sm" placeholder="상세주소" aria-label="상세주소" />
            </InfoField>
          </InfoTable>
        </div>
      </template>
    </LayoutSplite>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">닫기</Button>
      <Button v-if="picked" type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" variant="secondary" size="md" @click="onNew">신규</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/**
 * 순찰구역 상세 팝업(PC-LPO-0604).
 * 왼쪽 목록에서 지점을 고르면 오른쪽 폼에 값이 채워지고, 고르기 전에는 '삭제'가 없다.
 */
export interface PatrolPoint {
  id: number
  no: number
  name: string
  address: string
  addressDetail: string
}

defineProps<{ open: boolean; areaName: string }>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'search-address'): void
}>()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const points = ref<PatrolPoint[]>([
  { id: 1, no: 1, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대1동' },
  { id: 2, no: 2, name: '신원빌딩', address: '경기도 고양시 덕양구 신원로 5', addressDetail: '다대1동' },
  { id: 3, no: 3, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대2동' },
  { id: 4, no: 4, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대1동' },
  { id: 5, no: 5, name: '신원빌딩', address: '경기도 고양시 덕양구 신원로 5', addressDetail: '다대2동' },
])

const picked = ref<PatrolPoint | null>(null)
const form = reactive({ order: '', name: '', address: '', addressDetail: '' })

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/** 팝업 열림 애니메이션 중에 잰 폭 때문에 오른쪽이 비는 것을 막는다 */
function onTableBuilt() {
  const redraw = () => gridRef.value?.redraw(true)
  const dialogEl = (gridRef.value?.$el as HTMLElement | undefined)?.closest('[role="dialog"]')
  dialogEl?.addEventListener('animationend', redraw, { once: true })
  setTimeout(redraw, 250)
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
  { title: '구역명', field: 'name', hozAlign: 'center', minWidth: 100, widthGrow: 2 },
  { title: '주소', field: 'address', hozAlign: 'center', minWidth: 180, widthGrow: 4 },
  { title: '주소상세', field: 'addressDetail', hozAlign: 'center', minWidth: 90, widthGrow: 1 },
]

function onRowClick(_event: unknown, row: { getData: () => PatrolPoint }) {
  const data = row.getData()
  picked.value = data
  form.order = String(data.no)
  form.name = data.name
  form.address = data.address
  form.addressDetail = data.addressDetail
}

function onNew() {
  picked.value = null
  form.order = ''
  form.name = ''
  form.address = ''
  form.addressDetail = ''
}

async function onDelete() {
  if (!picked.value) return
  const id = picked.value.id
  points.value = points.value.filter((p) => p.id !== id)
  onNew()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  if (!form.name.trim() || !form.address.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  if (picked.value) {
    const id = picked.value.id
    points.value = points.value.map((p) =>
      p.id === id
        ? { ...p, no: Number(form.order) || p.no, name: form.name, address: form.address, addressDetail: form.addressDetail }
        : p,
    )
  } else {
    const nextId = points.value.length ? Math.max(...points.value.map((p) => p.id)) + 1 : 1
    points.value = [
      ...points.value,
      {
        id: nextId,
        no: Number(form.order) || points.value.length + 1,
        name: form.name,
        address: form.address,
        addressDetail: form.addressDetail,
      },
    ]
  }
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}
</script>
