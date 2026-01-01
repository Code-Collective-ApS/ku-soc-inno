<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <div class="flex justify-between">
      <UBreadcrumb
        separator-icon="i-lucide-arrow-right"
        :items="breadcrumb"
        class="mb-3"
      />
      <div class="flex gap-3">
        <UButton v-if="currentCase && user?.id === currentCase.userId" variant="subtle" color="neutral" icon="i-mdi-pencil" :to="`/cases/${currentCase.id}/edit`">
          Redigér case
        </UButton>
        <UButton color="secondary" variant="subtle" to="/cases/new"
          >Opret ny case</UButton
        >
      </div>
    </div>
    <div v-if="currentCase">
      <CaseDetails :current-case="currentCase" />
    </div>
    <div v-if="currentCase">
      <div class="mt-9">
        <div class="flex justify-between items-center mb-9">
          <h3 class="text-3xl font-serif">Publicerede løsninger</h3>
          <UButton size="xl" variant="subtle" :to="`/cases/${caseId}/new-solution`"
            >Opret løsning på denne case</UButton
          >
        </div>
        <div class="flex flex-col gap-9">
          <UPageCard
            v-for="s in currentCase?.solutions"
            :key="s.id"
            class="shadow-md"
            variant="subtle"
          >
            <div class="flex justify-between items-start">
              <div class="overflow-hidden -mr-3 pr-6 relative">
                <pre
                  class="font-sans text-sm w-full max-w-4xl whitespace-pre-line"
                  >{{
                    s.solutionDescription.length > 200
                      ? s.solutionDescription.slice(0, 640) + "..."
                      : s.solutionDescription
                  }}</pre
                >
              </div>
              <UButton
                variant="ghost"
                class="cursor-pointer"
                trailing-icon="mdi-chevron-right"
                :to="`/cases/${caseId}/solutions/${s.id}`"
                >Open</UButton
              >
            </div>
            <div class="flex gap-3">
              <UBadge
                v-for="cat in s.solutionCategories"
                :key="cat.id"
                color="secondary"
                variant="soft"
                >{{ cat.solutionCategory }}</UBadge
              >
            </div>
          </UPageCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
import { useCasesStore } from "~/stores/useCasesStore";
const { user } = useUserSession();
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");
if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    statusMessage: "Invalid case id",
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
