<template>
  <div>
    <UFileUpload
      v-model="value"
      multiple
      required
      variant="button"
      layout="list"
      color="neutral"
      class="grid grid-cols-2 2xl:grid-cols-3"
      description="PNG or JPG (max. 3MB)"
      accept="image/jpg,image/png"
      :ui="{
        base: [
          'w-full flex-1 bg-default border cursor-pointer border-gray-400 flex flex-col gap-2 items-stretch justify-center rounded-lg focus-visible:outline-2',
          'transition-[background]',
        ],
        fileTrailingButton: 'cursor-pointer',
      }"
    />
  </div>
</template>
<script setup lang="ts">
defineProps({
  min: {
    type: Number,
    required: false,
    default: 1,
  },
  max: {
    type: Number,
    required: false,
    default: 5,
  },
});
const value = defineModel<File[]>();
</script>
