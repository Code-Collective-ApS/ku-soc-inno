<template>
  <UPageCard class="shadow-md" variant="subtle">
    <div class="flex justify-between items-start">
      <!--div class="overflow-hidden -mr-3 pr-6 relative">
        <pre class="font-sans text-sm w-full max-w-4xl whitespace-pre-line">{{
          solution.solutionDescription.length > 200
            ? solution.solutionDescription.slice(0, 640) + "..."
            : solution.solutionDescription
        }}</pre>
        </div>-->
      <h3>{{ solution?.title || "halløj" }}</h3>
      <UButton
        variant="ghost"
        class="cursor-pointer"
        trailing-icon="mdi-chevron-right"
        :to="`/cases/${caseId}/solutions/${solution.id}`"
        >Open</UButton
      >
    </div>
    <div class="flex gap-3">
      <UBadge
        v-for="cat in solution.solutionCategories"
        :key="cat.id"
        color="secondary"
        variant="soft"
        >{{ cat.solutionCategory }}</UBadge
      >
    </div>
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
