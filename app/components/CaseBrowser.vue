<template>
  <div>
    <div class="flex gap-6 flex-col">
      <div v-for="c in cases" :key="c.id">
        <UPageCard :title="c.title" variant="subtle">
          <div class="flex gap-1.5">
            <CaseTags :c="c" />
          </div>
          <p class="whitespace-pre-line">{{ c.challengeDescription }}</p>
          <div class="text-right">
            <UButton
              variant="link"
              trailing-icon="mdi-chevron-right"
              :to="`/cases/${c.id}`"
              class="cursor-pointer"
              >Open</UButton
            >
          </div>
        </UPageCard>
      </div>
      <div v-if="cases.length === 0">
        <UEmpty
          icon="i-lucide-file"
          title="Der er ikke oprettet nogle cases endnu."
          description="Det ser ud til at der ikke eksisterer nogle cases i databasen. Du er velkommen til at oprette den første case."
          :actions="
            [
              {
                icon: 'i-lucide-plus',
                label: 'Opret den første case',
                color: 'success' as const,
                class: 'cursor-pointer',
                to: '/cases/new',
              },
              {
                icon: 'i-lucide-refresh-cw',
                label: 'Opdatér',
                color: 'neutral',
                variant: 'subtle' as const,
                class: 'cursor-pointer',
                onClick: async () => {
                  await refreshCases();
                  toast.add({
                    title: 'Cases blev opdateret',
                  });
                },
              },
            ] satisfies ButtonProps[]
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from "#ui/types";

defineProps({
  cases: {
    type: Array as PropType<CaseSerialized[]>,
    required: false,
    default: () => [],
  },
  refreshCases: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
});

const toast = useToast();
</script>
