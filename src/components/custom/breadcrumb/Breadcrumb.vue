<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumb__item"
      >
        <router-link 
          v-if="item.path && index !== items.length - 1" 
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
          :aria-current="index === items.length - 1 ? 'page' : undefined"
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
import homeIcon from '/portal/asset/images/icon/ico_home.svg'
defineProps({
  items: { type: Array, required: true }
});
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