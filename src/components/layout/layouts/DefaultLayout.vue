<template>
  <div class="flex flex-col min-h-screen">    
    <!-- Main content area with RouterView -->
    <main class="flex-1">
      <slot name="main">
        <!-- Default main content if no slot content provided -->
        <h1>Default Main</h1>
      </slot>
    </main>

  </div>
</template>

<script setup lang="ts">
defineSlots<{
  main: () => any
}>()
</script>
