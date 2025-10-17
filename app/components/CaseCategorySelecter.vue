<template>
  <div class="w-full max-w-md space-y-4">
    <div class="flex gap-2">
      <div v-for="tag in value" :key="tag">
        <UBadge
          :key="tag"
          closable
          size="md"
          variant="soft"
          color="secondary"
          :label="tag"
          @close="value = value.filter((t) => t !== tag)"
        />
      </div>
    </div>

    <!-- Optional button to add a brand‑new tag from the input field -->
    <div class="flex items-center gap-2">
      <UInput
        :ref="inputRef"
        v-model="search"
        type="text"
        placeholder="Enter a new tag"
        @keyup.prevent.enter="
          addTag(search);
          search = '';
        "
      />
      <UButton
        size="sm"
        color="secondary"
        @click="
          addTag(search);
          search = '';
          inputRef?.focus();
        "
      >
        Add Tag
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { UButton } from "#components"; // Nuxt UI components

const value = defineModel<string[]>({ default: [] });
const inputRef = ref();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

const search = ref("");

function addTag(tag: string) {
  const trimmed = tag.trim();
  if (!trimmed) return;

  if (!value.value?.includes(trimmed)) {
    value.value.push(trimmed);
    emit("update:modelValue", value.value);
  }
}
</script>
