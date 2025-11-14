<template>
  <div
    class="h-64 w-[360px] relative transition-all rounded-md cursor-pointer overflow-hidden group shadow-sm hover:shadow-md"
    @click="onImgClick"
  >
    <img
      :src="src"
      class="absolute -z-10 h-64 w-full object-cover object-center"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const { openFancyImageModal } = useModals();

function onImgClick() {
  openFancyImageModal(props.src);
}
</script>
