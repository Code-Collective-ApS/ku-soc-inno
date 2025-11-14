<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    class="lg:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl"
  >
    <template #body>
      <div>
        <img class="w-full h-auto" :src="src" />
      </div>
    </template>
    <template #footer>
      <div class="flex gap-1.5">
        <UButton
          variant="outline"
          class="cursor-pointer"
          color="secondary"
          @click="copyLink"
          >Copy link</UButton
        >
        <UButton
          variant="outline"
          class="cursor-pointer"
          color="neutral"
          :to="src"
          target="_blank"
          >Open in new tab</UButton
        >
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToast } from "#imports";
const emit = defineEmits<{ close: [boolean] }>();
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const toast = useToast();

function copyLink() {
  // retrieve link to copy
  let prefix = "";
  if (props.src.startsWith("/")) {
    prefix = window.location.origin;
  }
  const url = new URL(prefix + props.src);
  const txt = url.href;

  // save link to clipboard
  navigator.clipboard.writeText(txt);
  toast.add({
    title: "Image link copied to clipboard",
    icon: "i-mdi-check",
    color: "success",
  });

  console.log("props.src is", props.src);
  console.log("url is", url);
}
</script>
