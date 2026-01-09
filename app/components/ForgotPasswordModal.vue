<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Glemt password"
    description="Vi kan sende dig en email med et link til at oprette en nyt password."
    class="max-w-xs"
    :ui="{
      header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
      title: 'text-highlighted font-medium',
      description: 'mt-2.5 text-muted text-sm',
      close: 'absolute top-3 end-3',
    }"
  >
    <template #body>
      <ForgotPasswordForm @close="(ok: boolean) => emit('close', ok)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();
</script>
