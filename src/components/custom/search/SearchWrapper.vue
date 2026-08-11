<template>
  <div class="w-full flex justify-between items-stretch bg-[var(--Background-gray01)] py-5 px-6 rounded-[12px]">
    <div class="flex flex-col items-center">
      <slot name="form" />
    </div>
    <div class="flex items-end">
      <slot name="btns" />
    </div>
  </div> 
</template>

<script setup lang="ts">

</script>



<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
