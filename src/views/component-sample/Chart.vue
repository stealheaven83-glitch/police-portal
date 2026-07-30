<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6 ">
        <h1 class="text-2xl font-bold ">차트 샘플</h1>
        <Button @click="refreshData">데이터 갱신</Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bar Chart -->
        <div class="p-4 border rounded-lg shadow-sm">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">막대 차트 (Bar Chart)</h2>
          <div class="h-[300px]">
            <v-chart class="chart" :option="barOption" autoresize />
          </div>
        </div>

        <!-- Line Chart -->
        <div class="p-4 border rounded-lg shadow-sm">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">꺾은선 차트 (Line Chart)</h2>
          <div class="h-[300px]">
            <v-chart class="chart" :option="lineOption" autoresize />
          </div>
        </div>

        <!-- Pie Chart -->
        <div class="p-4 border rounded-lg shadow-sm">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">파이 차트 (Pie Chart)</h2>
          <div class="h-[300px]">
            <v-chart class="chart" :option="pieOption" autoresize />
          </div>
        </div>

        <!-- Scatter Chart -->
        <div class="p-4 border rounded-lg shadow-sm">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">산점도 차트 (Scatter Chart)</h2>
          <div class="h-[300px]">
            <v-chart class="chart" :option="scatterOption" autoresize />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// ECharts 모듈 등록
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
])

const barOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['월', '화', '수', '목', '금', '토', '일']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '판매량',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
      itemStyle: { color: '#3b82f6' }
    }
  ]
})

const lineOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['1월', '2월', '3월', '4월', '5월', '6월']
  },
  yAxis: { type: 'value' },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330],
      type: 'line',
      smooth: true,
      color: '#10b981'
    }
  ]
})

const pieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      name: '접속 경로',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '검색 엔진' },
        { value: 735, name: '직접 접속' },
        { value: 580, name: '이메일' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const scatterOption = ref({
  xAxis: {},
  yAxis: {},
  series: [
    {
      symbolSize: 20,
      data: [
        [10.0, 8.04],
        [8.07, 6.95],
        [13.0, 7.58],
        [9.05, 8.81],
        [11.0, 8.33],
        [14.0, 9.96],
        [6.0, 7.24],
        [4.0, 4.26],
        [12.0, 10.84],
        [7.0, 4.82],
        [5.0, 5.68]
      ],
      type: 'scatter',
      color: '#f59e0b'
    }
  ]
})

const refreshData = () => {
  barOption.value.series[0].data = barOption.value.series[0].data.map(() => Math.floor(Math.random() * 300))
  lineOption.value.series[0].data = lineOption.value.series[0].data.map(() => Math.floor(Math.random() * 1500))
}

onMounted(() => {
  console.log('Chart component mounted')
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.chart {
  height: 100%;
}
</style>
