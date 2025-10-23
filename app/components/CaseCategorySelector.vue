<template>
  <div class="w-full max-w-md space-y-4">
    <div v-if="value.length > 0" class="flex gap-2">
      <div v-for="tag in value" :key="tag">
        <UBadge
          :key="tag"
          size="md"
          variant="soft"
          color="secondary"
          :label="tag"
        >
          <template #trailing>
            <UButton
              variant="ghost"
              class="p-0 text-gray-400 transition-all hover:text-gray-600 cursor-pointer"
              size="xs"
              icon="i-mdi-close"
              @click="() => removeTag(tag)"
            />
          </template>
        </UBadge>
      </div>
    </div>

    <!-- Optional button to add a brand‑new tag from the input field -->
    <div class="flex items-center gap-2">
      <UInput
        ref="input"
        v-model="search"
        type="text"
        placeholder="Indtast nøgleord"
        @keyup.prevent.enter="
          () => {
            addTag(search);
            search = '';
          }
        "
      />
      <UButton
        size="sm"
        color="secondary"
        @click="
          () => {
            addTag(search);
            search = '';
            input?.inputRef?.focus();
          }
        "
      >
        Tilføj
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { UButton } from "#components"; // Nuxt UI components

const value = defineModel<string[]>({ default: [] });
const input = useTemplateRef("input");

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

const search = ref("");

function addTag(tag: string) {
  const trimmed = tag.trim();
  if (!trimmed) return;

  if (!value.value?.includes(trimmed)) {
    value.value.push(trimmed);
    emit("update:modelValue", toRaw([...value.value]));
  } else {
    console.warn("category tag already exists");
  }
}

function removeTag(tag: string) {
  const index = value.value.findIndex((t) => t === tag);
  if (index !== -1) {
    value.value.splice(index, 1);
    emit("update:modelValue", toRaw([...value.value]));
  } else {
    console.warn("category tag does not exist, so not removed");
  }
}
</script>
