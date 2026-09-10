<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in visibleItems" 
        :key="index" 
        class="breadcrumb__item"
      >
        <router-link 
          v-if="item.path" 
          :to="item.path"
          class="breadcrumb__link"
        >
        <span v-if="index === 0" class="icon-home" aria-hidden="true"> <img
          v-if="index === 0"
          :src="homeIcon"
          alt=""
          class="w-4 h-4"
        /></span>
          {{ item.label }}
        </router-link>
        <span 
          v-else 
          class="breadcrumb__link"
        >
          <span v-if="index === 0" class="icon-home" aria-hidden="true"> <img
          v-if="index === 0"
          :src="homeIcon"
          alt=""
          class="w-4 h-4"
        /></span>
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import homeIcon from '/portal/asset/images/icon/ico_home.svg'
const props = defineProps({
  items: { type: Array, required: true }
})
// 마지막 항목(현재 페이지명)은 표시하지 않는다 — 화면은 navItems 를 그대로 넘기면 된다
const visibleItems = computed(() => props.items.slice(0, -1))
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: #666;
}
.breadcrumb__item{
  display: flex;
  align-items: center;

}
.breadcrumb__item .breadcrumb__link{
  display: flex;
  align-items: center;
  line-height:1;
}
.breadcrumb__item .breadcrumb__link .icon-home{
  display:flex;
  align-items: center;
  margin-right: 0.5rem;
}
.breadcrumb__item + .breadcrumb__item::before {
  content: "";
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  margin: 0 9px;
  background: url(/portal/asset/images/icon/ico_bread_arrow.svg) no-repeat center / 1.2rem auto;
}

.breadcrumb__link{
}

.breadcrumb__current {
  font-weight: 600;
  color: #333;
}
</style>