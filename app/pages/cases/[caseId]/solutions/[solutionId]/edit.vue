<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>
      Redigér {{ currentSolution?.solution?.title }}
      <template #subtitle>
        <h2>
          Løsning på denne case:
          <a
            class="text-sky-600 hover:text-sky-400 cursor-pointer transition-colors"
            :href="`/cases/${currentCase?.case.id}`"
            >{{ currentCase?.case.title }}</a
          >
        </h2>
      </template>
    </PageTitle>

    <SolutionForm
      v-if="currentSolution?.solution && currentCase?.case"
      :solution="currentSolution.solution"
      :case-id="currentCase.case.id"
      @updated:solution="onSolutionUpdated"
    />
  </UContainer>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from "@nuxt/ui";
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");
const solutionId = parseInt((route.params?.solutionId as string) || "NaN");

if (isNaN(solutionId)) {
  // TODO: report error
  throw createError({
    message: "Invalid solution id",
    statusCode: 400,
  });
}
if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    message: "Invalid case id",
    statusCode: 400,
  });
}

useToasters();

// fetch cases on load
const casesStore = useCasesStore();
const { data: currentCase } = await useAsyncData(
  "case",
  () => casesStore.fetchCase(caseId),
  {
    immediate: true,
    server: false,
  },
);

// fetch solution on load
const solutionsStore = useSolutionsStore();
const { data: currentSolution, refresh: refreshSolution } = await useAsyncData(
  "solution",
  () => solutionsStore.fetchSolution(solutionId),
  {
    immediate: true,
    server: false,
  },
);

const breadcrumb = computed<BreadcrumbItem[]>(() => [
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases/browse",
  },
  {
    label: currentCase.value?.case.title,
    to: `/cases/${currentCase.value?.case.id}`,
  },
  {
    label: "Redigér",
  },
]);

function onSolutionUpdated() {
  refreshSolution();
}

definePageMeta({
  middleware: ["auth"],
});
</script>
