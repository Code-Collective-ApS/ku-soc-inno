<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Opret konto"
    description="Påkrævet hvis du vil offentliggøre cases eller løsninger på cases."
    class="max-w-sm w-full"
    :ui="{
      header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
      title: 'text-highlighted font-medium',
      description: 'mt-2.5 text-muted text-sm',
      close: 'absolute top-3 end-3',
    }"
  >
    <template #body>
      <CreateAccountForm />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();
</script>
