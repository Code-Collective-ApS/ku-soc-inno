<template>
  <UModal
    :title="title"
    :close="{ onClick: () => emit('close', false) }"
    :description="description || undefined"
    @update:open="(o: boolean) => !o && emit('close', false)"
  >
    <template #footer>
      <div class="flex items-center gap-x-2 justify-end w-full">
        <UButton
          class="cursor-pointer"
          variant="subtle"
          :color="color"
          @click="() => emit('close', true)"
        >
          Bekræft
        </UButton>
        <UButton
          class="cursor-pointer"
          variant="subtle"
          color="neutral"
          @click="() => emit('close', false)"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
// NOTE: for some reason it is required in this file for `yarn nuxt typecheck`
import type { PropType } from "vue";
type _Color =
  | "error"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "neutral";

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String as PropType<_Color | undefined>,
    required: false,
    default: () => "error",
  },
});

const emit = defineEmits<{
  close: [boolean];
  "update:open": [];
}>();
</script>
