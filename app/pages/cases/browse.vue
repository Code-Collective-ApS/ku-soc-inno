<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>Browse cases</PageTitle>
    <div class="flex gap-3 flex-col">
      <div v-for="c in cases" :key="c.id">
        <UPageCard :title="c.title" variant="subtle">
          <p>{{ c.challengeDescription }}</p>
          <NuxtLink :to="`/cases/${c.id}`">Open</NuxtLink>
        </UPageCard>
      </div>
    </div>
    <div v-if="error" class="text-error-500" v-text="error" />
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
useToasters();
const casesStore = useCasesStore();
const { cases } = storeToRefs(casesStore);
const casesOffset = ref(0);
const casesTake = ref(6);
const { error } = await useAsyncData(
  "cases",
  () => casesStore.fetchCases(casesTake, casesOffset),
  {
    immediate: true,
    server: false,
  },
);
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases",
  },
  {
    label: "Browse",
  },
]);
</script>
