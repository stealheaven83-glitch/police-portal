<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  name: string
  children?: { name: string }[]
}

defineProps<{
  items: MenuItem[]
}>()

const openIndex = ref(0)
const activeChild = ref('메모')

function toggleDepth1(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <div class="left-menu">
    <nav class="lnb">
      <h3 class="title">지역경찰</h3>
      <ul class="depth1">
        <li
          v-for="(item, index) in items"
          :key="item.name"
          class="depth1-item"
        >
          <button
            class="depth1-btn"
            :class="{ 'is-open': openIndex === index, 'no-child': !item.children }"
            type="button"
            @click="toggleDepth1(index)"
          >
            {{ item.name }}
          </button>
          <ul class="depth2">
            <li
              v-for="child in item.children"
              :key="child.name"
              class="depth2-item"
              :class="{ active: activeChild === child.name }"
            >
              <a href="" @click.prevent="activeChild = child.name"><span>{{ child.name }}</span></a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.left-menu {
  padding: 2.4rem 3.6rem;
  width: 31.6rem;
}
.left-menu .lnb {
  overflow: hidden;
}
.left-menu .lnb .title {
  border-radius: 2rem 2rem 0 0;
  height: 7.8rem;
  color: #fff;
  font-weight: 700;
  font-size: 2rem;
  background: var(--Base-secondary);
  text-align: center;
  align-content: center;
}
.left-menu .lnb .depth1 {
  padding: 1.2rem 2.4rem;
  border-radius: 0 0 1.2rem 1.2rem;
  border: 1px solid var(--Border_gray0);
}
.left-menu .lnb .depth1 .depth1-item {
  border-bottom: 1px solid var(--Border_gray03);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open {
  border-bottom: 2px solid var(--Border_primary);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn {
  position: relative;
  text-align: left;
  font-weight: 600;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.no-child:after, .left-menu .lnb .depth1 .depth1-item .depth1-btn.no-child::before {
  display: none;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::after, .left-menu .lnb .depth1 .depth1-item .depth1-btn::before {
  content: "";
  display: block;
  position: absolute;
  background: #33363d;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::after {
  top: 27px;
  right: 0;
  width: 12px;
  height: 2px;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::before {
  top: 22px;
  right: 5px;
  width: 2px;
  height: 12px;
  transition: all 0.5s;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open {
  color: var(--Base-primary);
  border-bottom: 2px solid var(--Border_primary);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open + .depth2 {
  max-height: none;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open::before {
  transform: rotate(-90deg);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn {
  padding: 1.6rem 2.8rem 1.6rem 0;
  width: 100%;
}
.left-menu .lnb .depth1 .depth2 {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease;
}
.left-menu .lnb .depth1 .depth2 .depth2-item:first-child {
  padding-top: 1.2rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item:last-child {
  margin-bottom: 1.2rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item a {
  position: relative;
  display: block;
  padding: 1.2rem 1.6rem;
  font-weight: 600;
}
.left-menu .lnb .depth1 .depth2 .depth2-item a.active a {
  background: var(--Surface-primary);
  color: var(--Base-primary);
  font-weight: 700;
  border-radius: 0.8rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item a:hover {
  background: var(--Surface-primary);
  color: var(--Base-primary);
  font-weight: 700;
  border-radius: 0.8rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item a:hover:after {
  content: "";
  display: block;
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--Border_primary);
  border-top: 2px solid var(--Border_primary);
  transform: rotate(45deg);
}
</style>
