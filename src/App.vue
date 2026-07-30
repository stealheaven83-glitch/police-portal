<template>
  <Layout/>
  <Toaster richColors position="top-center"/>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from './components/layout/Layout.vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import httpInterceptor from './modules/interceptor/http-interceptors'

onMounted(()=>{
  httpInterceptor.setupInterceptor()
})
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>