<template>
  <div class="flex gap-3">
    <UBadge
      v-for="s in solution.solutionCategories"
      :key="s.id"
      color="secondary"
      variant="soft"
      >{{ getPrettySolutionCategory(s.solutionCategory) }}</UBadge
    >
  </div>
</template>

<script setup lang="ts">
import { getPrettySolutionCategory } from "~~/shared/utils/solution_categories";

defineProps({
  solution: {
    required: true,
    type: Object as PropType<SolutionResponse | CaseResponseSolution>,
  },
});
</script>
