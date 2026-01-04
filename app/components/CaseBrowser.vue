<template>
  <div>
    <!-- Search form -->
    <div class="mb-12 xl:mb-16">
      <div
        class="w-full relative grid grid-cols-1 gap-2 lg:grid-cols-[1fr_260px_280px_100px]"
        size="xl"
      >
        <UInput
          v-model="payload.text"
          size="xl"
          placeholder="Indtast fritekst søgning"
          @keyup.enter="search"
        />
        <OrganizationSectorInput v-model="payload.sector" size="xl" />
        <OrganizationTypeInput
          v-model="payload.organization_type"
          size="xl"
          class="lg:-ml-px!"
        />
        <UButton
          icon="i-mdi-search"
          size="xl"
          color="secondary"
          class="text-center lg:-ml-0.5! cursor-pointer"
          :loading="loading"
          @click="search"
        >
          Søg
        </UButton>
      </div>
    </div>

    <!-- Search result meta text -->
    <p v-if="!errorMsg" class="text-sm text-muted mb-3">
      Viser {{ (page - 1) * pageSize }}-{{ Math.min(page * pageSize, total) }} ud af
      {{ total }} resultater
    </p>
    <p v-if="errorMsg" class="text-sm text-error-500 mb-3">{{ errorMsg }}</p>

    <!-- Search results -->
    <div class="flex gap-6 flex-col">
      <div v-for="c in searchResult" :key="c.id">
        <CaseSearchResultCard :shown-case="c" />
      </div>
      <div v-if="searchResult?.length" class="flex justify-center">
        <UPagination
          v-model:page="page"
          size="lg"
          color="neutral"
          active-color="secondary"
          active-variant="solid"
          variant="subtle"
          :items-per-page="pageSize"
          :default-page="1"
          :total="total"
        />
      </div>
      <div v-if="searchResult.length === 0 && !loading">
        <UEmpty
          icon="i-lucide-file"
          title="Der er ikke oprettet nogle cases endnu."
          description="Det ser ud til at der ikke eksisterer nogle cases i databasen. Du er velkommen til at oprette den første case."
          :actions="
            [
              {
                icon: 'i-lucide-plus',
                label: 'Opret den første case',
                color: 'success' as const,
                class: 'cursor-pointer',
                to: '/cases/new',
              },
            ] satisfies ButtonProps[]
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from "#ui/types";
import type { CaseSerialized } from "~~/server/utils/resources/case";

const payload = reactive({
  text: "",
  sector: undefined,
  organization_type: undefined,
});

const total = ref(0);
const pageSize = ref(5);
const searchResult = ref<CaseSerialized[]>([]);
const lastSearchTookMs = ref(0);
const loading = ref(true);
const errorMsg = ref("");
const page = ref(1);

async function search() {
  loading.value = true;
  const beginTime = Date.now();
  await $fetch(`/api/cases/search`, {
    query: {
      text: payload.text || "",
      sector: payload.sector || null,
      organization_type: payload.organization_type || null,
      page: page.value,
    },
    onResponse: async (ctx) => {
      if (ctx.response.status !== 200) {
        const msg = await parseApiError(ctx.error || ctx.response._data);
        errorMsg.value = msg;
        loading.value = false;
      } else {
        const resultTime = Date.now();
        lastSearchTookMs.value = Math.floor(resultTime - beginTime) / 1000;
        setTimeout(() => {
          total.value = ctx.response._data.total;
          searchResult.value = ctx.response._data.cases;
          loading.value = false;
        }, 50);
      }
    },
    onResponseError: async (ctx) => {
      errorMsg.value = await parseApiError(ctx.error || ctx.response._data);
      loading.value = false;
    },
  });
}

watch(page, search);

onMounted(async () => {
  await search();
});
</script>
