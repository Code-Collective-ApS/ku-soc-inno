<template>
  <div
    :key="barrier"
    class="bg-indigo-50 py-1 px-2 items-center flex justify-between rounded-lg border border-indigo-300"
  >
    <span>{{ barrier }} </span>
    <UButton
      v-if="removable"
      class="rounded-full bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-200 active:bg-indigo-300 cursor-pointer"
      icon="i-mdi-close"
      size="xs"
      @click="() => emit('barrier:remove')"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  removable: {
    type: Boolean,
    required: false,
    default: () => false,
  },
  barrier: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  "barrier:remove": [];
}>();
</script>
