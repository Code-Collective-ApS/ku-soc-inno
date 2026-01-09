<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Opret nyt password"
    description="Skriv dit nye password her, så du kan få adgang til din bruger igen"
    class="max-w-xs"
    :ui="{
      header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
      title: 'text-highlighted font-medium',
      description: 'mt-2.5 text-muted text-sm',
      close: 'absolute top-3 end-3',
    }"
  >
    <template #body>
      <ResetPasswordForm :jwt="jwt" @close="() => emit('close', true)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps({
  jwt: {
    type: String,
    required: true,
  },
});
const emit = defineEmits<{ close: [boolean] }>();
</script>
