<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>Opret ny løsning</PageTitle>
    <SolutionForm :case-id="caseId" @created:solution="onSolutionCreated" />
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");
if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    message: "Invalid case id",
    statusCode: 400,
  });
}

useToasters();

// fetch case on load
const casesStore = useCasesStore();
const { data, refresh } = await useAsyncData(
  "case",
  () => casesStore.fetchCase(caseId),
  {
    immediate: true,
    server: false,
  },
);
const currentCase = computed(() => data?.value?.case);

const breadcrumb = computed<BreadcrumbItem[]>(() => [
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases/browse",
  },
  {
    label: currentCase.value?.title,
    to: `/cases/${currentCase.value?.id}`,
  },
  {
    label: "Opret ny løsning",
  },
]);

// refetch case if solution was created
function onSolutionCreated() {
  refresh();
}

definePageMeta({
  middleware: ["auth"],
});
</script>
