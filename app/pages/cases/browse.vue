<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16 pb-14">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>Browse cases</PageTitle>
    <CaseBrowser />
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "#ui/types";
useToasters();
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases/browse",
  },
  {
    label: "Browse",
  },
]);
</script>
