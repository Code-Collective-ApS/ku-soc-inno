<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <div class="flex justify-between">
      <UBreadcrumb
        separator-icon="i-lucide-arrow-right"
        :items="breadcrumb"
        class="mb-3"
      />
      <div class="flex gap-1.5">
        <UButton color="secondary" variant="outline" to="/cases/new"
          >Opret ny case</UButton
        >
        <UButton variant="outline" :to="`/cases/${caseId}/new-solution`"
          >Opret løsning på denne case</UButton
        >
      </div>
    </div>
    <div v-if="currentCase" class="[&>*>p]:font-bold flex flex-col gap-y-3">
      <div>
        <h1 class="text-3xl font-serif mt-6">Case: {{ currentCase.title }}</h1>
      </div>

      <div>
        <div class="flex gap-1.5">
          <div v-for="tag in currentCase.categoryTags" :key="tag.id">
            <UBadge
              size="md"
              variant="soft"
              color="secondary"
              :label="tag.tag"
            />
          </div>
        </div>
      </div>

      <div>
        <div class="inline-block">
          <div class="text-xs mt-3 mb-3 text-gray-500 grid grid-cols-2">
            <div>Oprettet:</div>
            <div>{{ prettyDate(currentCase.createdAt) }}</div>
            <div>Opdateret:</div>
            <div>{{ prettyDate(currentCase.updatedAt) }}</div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <p>Hvad er casens udfordring kort for talt ?</p>
        <div class="whitespace-pre-line">
          {{ currentCase.challengeDescription }}
        </div>
      </div>
      <div class="mb-3">
        <p>Hvorfor er denne udfordring vigtig at løse ?</p>
        <div class="whitespace-pre-line">
          {{ currentCase.importanceDescription }}
        </div>
      </div>
      <div class="mb-3">
        <p>Løsningsbarrierer</p>
        <div class="inline-block">
          <div class="flex flex-col gap-2">
            <div v-for="barrier in currentCase.barriers" :key="barrier.id">
              <div
                :key="barrier.id"
                class="bg-indigo-50 px-3 py-2 items-center flex justify-between rounded-lg border border-indigo-300"
              >
                <span>{{ barrier.barrier }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <p>Andet, der er relevant at nævne?</p>
        <div class="whitespace-pre-line">{{ currentCase.freeText }}</div>
      </div>
      <div>
        <p>Kontakt information</p>
        <div class="inline-block">
          <div class="grid grid-cols-2">
            <div>Navn</div>
            <div>{{ currentCase.contactName }}</div>
            <div>Titel</div>
            <div>{{ currentCase.contactTitle }}</div>
            <div>Organisation</div>
            <div>{{ currentCase.contactOrganization }}</div>
            <div>Email</div>
            <div>{{ currentCase.contactEmail }}</div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { prettyDate } from "~~/shared/utils/datetime";
import type { BreadcrumbItem } from "@nuxt/ui";
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
  },
]);
</script>
