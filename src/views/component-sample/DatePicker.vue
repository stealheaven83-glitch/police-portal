<template>
<DatePicker 
  type="range" 
  v-model="dateRange" 
  startPlaceholder="시작일 선택"
  endPlaceholder="종료일 선택"
/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataPicker } from '@vuepic/vue-datepicker'

  
</script>