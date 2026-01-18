<template>
  <UPageCard class="shadow-md" variant="subtle">
    <div class="flex justify-between items-start">
      <h3>{{ solution?.title || "Ikke navngivet" }}</h3>
      <UButton
        variant="ghost"
        class="cursor-pointer"
        trailing-icon="mdi-chevron-right"
        :to="`/cases/${caseId}/solutions/${solution.id}`"
        >Open</UButton
      >
    </div>
    <SolutionTags :solution="solution" />
  </UPageCard>
</template>

<script setup lang="ts">
import type { CaseResponseSolution } from "~~/server/utils/resources/case";

defineProps({
  caseId: {
    type: Number,
    required: true,
  },
  solution: {
    type: Object as PropType<CaseResponseSolution>,
    required: true,
  },
});
</script>
