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
      <CaseDetails
        :current-case="currentCase"
        @click:orgsector="(s) => handleSectorClick(s)"
        @click:orgtype="(s) => handleOrgClick(s)"
        @click:tag="(s) => handleTagClick(s)"
      />
    </div>
    <div v-if="currentCase">
      <div class="mt-9">
        <div class="flex justify-between items-center mb-9">
          <h3 class="text-3xl font-serif">Publicerede løsninger</h3>
          <UButton
            size="xl"
            variant="subtle"
            :to="`/cases/${caseId}/new-solution`"
          >
            Opret løsning på denne case
          </UButton>
        </div>
        <div v-if="currentCase?.solutions.length" class="flex flex-col gap-9">
          <SolutionCard
            v-for="s in currentCase?.solutions"
            :key="s.id"
            :case-id="currentCase.id"
            :solution="s"
          />
        </div>
        <div v-else>
          <UAlert
            icon="i-mdi-information-circle-outline"
            title="Der er ingen publicerede løsninger på denne case"
            variant="subtle"
            color="info"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
import { captureException } from "@sentry/nuxt";
import { useCasesStore } from "~/stores/useCasesStore";
const route = useRoute();
const router = useRouter();
const caseId = parseInt((route.params?.caseId as string) || "NaN");

if (isNaN(caseId)) {
  const err = createError({
    message: "Invalid case id",
    statusCode: 400,
  });
  captureException(err);
  throw err;
}

// fetch case on load
const casesStore = useCasesStore();
const { data, refresh, pending } = await useAsyncData(
  "case",
  () => casesStore.fetchCase(caseId),
  {
    immediate: true,
    server: true,
  },
);

onMounted(() => {
  if (!pending.value) {
    refresh();
  }
});

function handleSectorClick(s: OrganizationSector) {
  const newQuery = { sector: s };
  router.push({
    path: "/cases/browse",
    query: newQuery,
  });
}
function handleOrgClick(s: OrganizationType) {
  const newQuery = { organization_type: s };
  router.push({
    path: "/cases/browse",
    query: newQuery,
  });
}
function handleTagClick(s: string) {
  const newQuery = { query: s };
  router.push({
    path: "/cases/browse",
    query: newQuery,
  });
}

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
