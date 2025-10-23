<template>
  <div class="w-full max-w-md space-y-4">
    <div v-if="value.length > 0" class="flex flex-col gap-2">
      <div v-for="barrier in value" :key="barrier">
        <div
          :key="barrier"
          class="bg-indigo-50 p-3 items-center flex justify-between rounded-lg border border-indigo-300"
        >
          <span>{{ barrier }} </span>
          <UButton
            class="rounded-full bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-200 active:bg-indigo-300 cursor-pointer"
            icon="i-mdi-close"
            size="xs"
            @click="() => removeBarrier(barrier)"
          />
        </div>
      </div>
    </div>

    <!-- Optional button to add a brand‑new barrier from the input field -->
    <div class="flex items-center gap-2">
      <UInput
        ref="input"
        v-model="search"
        type="text"
        class="min-w-80"
        placeholder="F.eks økonomi, risikotilbageholdenhed, tid, .."
        @keyup.prevent.enter="
          addBarrier(search);
          search = '';
        "
      />
      <UButton
        size="sm"
        color="secondary"
        class="bg-indigo-500"
        icon="i-mdi-plus"
        @click="
          addBarrier(search);
          search = '';
          input?.inputRef?.focus();
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

function addBarrier(barrier: string) {
  const trimmed = barrier.trim();
  if (!trimmed) return;

  if (!value.value?.includes(trimmed)) {
    value.value.push(trimmed);
    emit("update:modelValue", value.value);
  }
}

function removeBarrier(barrier: string) {
  const index = value.value.findIndex((b) => b === barrier);
  if (index !== -1) {
    value.value.splice(index, 1);
    emit("update:modelValue", toRaw([...value.value]));
  } else {
    console.warn("category tag does not exist, so not removed");
  }
}
</script>
