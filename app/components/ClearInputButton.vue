<template>
  <div class="h-full absolute right-9 z-10">
    <span
      class="h-full flex items-center text-xl cursor-pointer hover:text-dimmed text-dimmed/80 transition-all"
      @click="() => emit('click')"
    >
      <UIcon name="lucide:circle-x" />
    </span>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'click': [],
}>();
</script>
