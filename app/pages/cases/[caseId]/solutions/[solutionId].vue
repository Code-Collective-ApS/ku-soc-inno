<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <div class="flex justify-between">
      <UBreadcrumb
        separator-icon="i-lucide-arrow-right"
        :items="breadcrumb"
        class="mb-3"
      />
    </div>
    <div
      v-if="
        !solutionPending &&
        !casePending &&
        !caseError &&
        !solutionError &&
        currentSolution &&
        currentCase
      "
    >
      <SolutionDetails
        :solution="currentSolution"
        :related-case="currentCase"
      />
    </div>
    <div
      v-if="!solutionPending && !casePending && (caseError || solutionError)"
      class="my-6 text-red-500"
    >
      {{ caseError || solutionError }}
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from "@nuxt/ui";
import { useCasesStore } from "~/stores/useCasesStore";
import { useSolutionsStore } from "~/stores/useSolutionsStore";
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");
const solutionId = parseInt((route.params?.solutionId as string) || "NaN");

if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    message: "Invalid case id",
    statusCode: 400,
  });
}
if (isNaN(solutionId)) {
  // TODO: report error
  throw createError({
    message: "Invalid solution id",
    statusCode: 400,
  });
}

// fetch case on load
const casesStore = useCasesStore();
const {
  data: caseData,
  error: caseError,
  pending: casePending,
} = await useAsyncData("case", () => casesStore.fetchCase(caseId), {
  immediate: true,
  server: true,
});
const currentCase = computed(() => caseData?.value?.case);

// fetch case on load
const solutionsStore = useSolutionsStore();
const {
  data: solutionData,
  error: solutionError,
  pending: solutionPending,
} = await useAsyncData(
  "solution",
  () => solutionsStore.fetchSolution(solutionId),
  {
    immediate: true,
    server: true,
  },
);

const currentSolution = computed(() => solutionData?.value?.solution);
const breadcrumb = computed<BreadcrumbItem[]>(() => [
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases/browse",
  },
  {
    label: currentCase.value?.title,
    to: `/cases/${caseId}`,
  },
  {
    label: `Solution #${solutionId}`,
  },
]);
</script>
