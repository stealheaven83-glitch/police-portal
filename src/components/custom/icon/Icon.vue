<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './icons'

interface Props {
  name: IconName
  size?: number | string
  color?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

const sizeValue = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)

</script>

<template>
  <component
    :is="icons[props.name]"
    :style="{
      width: sizeValue,
      height: sizeValue,
      color: props.color,
    }"
    :aria-hidden="props.ariaLabel ? undefined : 'true'"
    :aria-label="props.ariaLabel"
    focusable="false"
  />
</template>
