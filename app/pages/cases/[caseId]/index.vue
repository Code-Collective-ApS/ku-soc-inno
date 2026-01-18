<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <div class="flex justify-between">
      <UBreadcrumb
        separator-icon="i-lucide-arrow-right"
        :items="breadcrumb"
        class="mb-3"
      />
    </div>
    <div v-if="currentCase">
      <CaseDetails :current-case="currentCase" />
    </div>
    <div v-if="currentCase">
      <div class="mt-9">
        <div class="flex justify-between items-center mb-9">
          <h3 class="text-3xl font-serif">Publicerede løsninger</h3>
          <UButton
            size="xl"
            variant="subtle"
            :to="`/cases/${caseId}/new-solution`"
            >Opret løsning på denne case</UButton
          >
        </div>
        <div class="flex flex-col gap-9">
          <SolutionCard
            v-for="s in currentCase?.solutions"
            :key="s.id"
            :case-id="currentCase.id"
            :solution="s"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
import { useCasesStore } from "~/stores/useCasesStore";
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");

if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    message: "Invalid case id",
    statusCode: 400,
  });
}

// fetch case on load
const casesStore = useCasesStore();
const { data } = await useAsyncData(
  "case",
  () => casesStore.fetchCase(caseId),
  {
    immediate: true,
    server: true,
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
  },
]);
</script>
