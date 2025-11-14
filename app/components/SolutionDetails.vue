<template>
  <div class="[&>*>p]:font-bold flex flex-col gap-y-3">
    <div>
      <h1 class="text-3xl font-serif mt-6">
        Løsning på case: {{ relatedCase.title }}
        {{ relatedCase.title }}
      </h1>
    </div>

    <div>
      <div class="flex gap-1.5">
        <UBadge
          size="md"
          variant="soft"
          color="secondary"
          :label="solution?.solutionCategory"
        />
      </div>
    </div>

    <div class="mb-6">
      <div class="inline-block">
        <div
          v-if="solution"
          class="text-xs mt-3 mb-3 text-gray-500 grid grid-cols-2"
        >
          <div>Løsning oprettet:</div>
          <div>{{ prettyDate(solution.createdAt) }}</div>
          <div>Løsning opdateret:</div>
          <div>{{ prettyDate(solution.updatedAt) }}</div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-9 mb-12">
      <UCarousel
        v-slot="{ item }"
        :arrows="illustrationUrls.length > 3"
        :items="illustrationUrls"
        :ui="{ item: 'sm:basis-1/2 lg:basis-1/3' }"
      >
        <FancyImage :src="item" />
      </UCarousel>
    </div>

    <div class="mb-3">
      <p>Beskrivelse af løsningen</p>
      <div class="whitespace-pre-line">
        {{ solution?.solutionDescription }}
      </div>
    </div>

    <div class="mb-3">
      <p>Fri tekst</p>
      <div class="whitespace-pre-line">
        {{ solution?.freeText }}
      </div>
    </div>

    <div class="mb-3">
      <p>Er løsningen testet ?</p>
      {{ solution?.isTested ? "Ja" : "Nej" }}
    </div>

    <div class="mb-3">
      <p>
        {{
          solution?.isTested
            ? "Hvordan er løsningen testet?"
            : "Hvordan kan løsningen testes?"
        }}
      </p>
      <div class="whitespace-pre-line">
        {{ solution?.testingText }}
      </div>
    </div>

    <div v-if="pdfs.length > 0">
      <p>Hovedopgave</p>
      <div v-for="pdf in pdfs" :key="pdf.id">
        <UButton
          :to="pdf.url"
          variant="subtle"
          size="lg"
          color="secondary"
          class="mt-1.5"
          target="_blank"
          icon="i-mdi-download-outline"
        >
          Download
        </UButton>
      </div>
    </div>

    <div v-if="attachments.length > 0">
      <p>Bilag</p>
      <div v-for="att in attachments" :key="att.id">
        <UButton
          :to="att.url"
          variant="subtle"
          size="lg"
          color="secondary"
          class="mt-1.5"
          target="_blank"
          icon="i-mdi-download-outline"
        >
          {{ att.fileName }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SolutionResponse } from "~~/server/utils/resources/solution";

const props = defineProps({
  solution: {
    type: Object as PropType<SolutionResponse>,
    required: true,
  },
  relatedCase: {
    type: Object as PropType<CaseResponse>,
    required: true,
  },
});

const illustrationUrls = computed<string[]>(
  () =>
    props.solution.illustrations?.map((illu) => {
      return (
        window.location.origin +
        `/api/solutions/${props.solution.id}/illustrations/${illu.id}`
      );
    }) || [],
);

const pdfs = computed(
  () =>
    props.solution.solutionPdfs?.map((pdf) => ({
      ...pdf,
      url:
        window.location.origin +
        `/api/solutions/${props.solution.id}/pdfs/${pdf.id}`,
    })) || [],
);

const attachments = computed(
  () =>
    props.solution.attachments?.map((att) => ({
      ...att,
      url:
        window.location.origin +
        `/api/solutions/${props.solution.id}/attachments/${att.id}`,
    })) || [],
);
</script>
