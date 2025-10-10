<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Log in"
    description="Required if you want to publish cases and/or solutions."
    class="max-w-xs"
    :ui="{
      header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
      title: 'text-highlighted font-medium',
      description: 'mt-2.5 text-muted text-sm',
      close: 'absolute top-3 end-3',
    }"
  >
    <template #body>
      <LoginForm @close="(ok) => emit('close', ok)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();
</script>
