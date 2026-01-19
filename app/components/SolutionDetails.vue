<template>
  <div class="[&>*>p]:font-bold flex flex-col gap-y-3">
    <div class="flex justify-between mt-3 items-center">
      <div class="flex flex-col">
        <h1 class="text-3xl font-serif">
          {{ solution.title }}
        </h1>
        <h2>
          Løsning på
          <a
            class="text-sky-600 hover:text-sky-400 cursor-pointer transition-colors"
            :href="`/cases/${relatedCase.id}`"
            >{{ relatedCase.title }}</a
          >
        </h2>
      </div>
      <div class="flex gap-1.5">
        <UButton
          v-if="solution && solution.isOwned"
          variant="subtle"
          color="neutral"
          icon="i-mdi-pencil"
          :to="`/cases/${relatedCase.id}/solutions/${solution.id}/edit`"
        >
          Redigér løsning
        </UButton>
        <UButton
          variant="subtle"
          color="secondary"
          icon="i-mdi-arrow-up-left"
          class="cursor-pointer"
          :to="`/cases/${relatedCase.id}`"
          >Gå til case</UButton
        >
      </div>
    </div>

    <div>
      <SolutionTags :solution="solution" />
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

    <div v-if="illustrationUrls.length > 0" class="flex flex-col gap-9 mb-12">
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

    <div v-if="solution.freeText" class="mb-3">
      <p>Opmærksomhedspunkter omkring test og/eller implementering</p>
      <div class="whitespace-pre-line">
        {{ solution?.freeText }}
      </div>
    </div>

    <div v-if="pdfs.length > 0">
      <div class="flex items-center gap-1 mt-3 mb-1.5">
        <UIcon class="text-lg" name="mdi:file-pdf-outline" />
        <p class="font-bold">Rapport (PDF)</p>
      </div>
      <div v-for="pdf in pdfs" :key="pdf.id">
        <UButton
          :to="pdf.url"
          variant="subtle"
          color="neutral"
          class="mt-1.5"
          target="_blank"
          icon="material-symbols:download-rounded"
        >
          Download pdf
        </UButton>
      </div>
    </div>

    <div v-if="attachments.length > 0">
      <div class="flex items-center gap-1 mt-3 mb-1.5">
        <UIcon class="text-lg" name="mdi:file-multiple-outline" />
        <p class="font-bold">Andre bilag</p>
      </div>
      <div v-for="att in attachments" :key="att.id">
        <UButton
          :to="att.url"
          variant="subtle"
          color="neutral"
          class="mt-1.5"
          target="_blank"
          icon="material-symbols:download-rounded"
        >
          {{ att.fileName }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaseSerialized } from "~~/server/utils/resources/case";
import type { SolutionSerialized } from "~~/server/utils/resources/solution";

const props = defineProps({
  solution: {
    type: Object as PropType<SolutionSerialized>,
    required: true,
  },
  relatedCase: {
    type: Object as PropType<CaseSerialized>,
    required: true,
  },
});

const origin = useRequestURL().origin;

const illustrationUrls = computed<string[]>(
  () =>
    props.solution.illustrations?.map(
      (illu: SolutionIllustrationSerialized) => {
        return (
          origin +
          `/api/solutions/${props.solution.id}/illustrations/${illu.id}`
        );
      },
    ) || [],
);

const pdfs = computed(
  () =>
    props.solution.solutionPdfs?.map((pdf: SolutionPdfSerialized) => ({
      ...pdf,
      url: origin + `/api/solutions/${props.solution.id}/pdfs/${pdf.id}`,
    })) || [],
);

const attachments = computed(
  () =>
    props.solution.attachments?.map((att: SolutionAttachmentSerialized) => ({
      ...att,
      url: origin + `/api/solutions/${props.solution.id}/attachments/${att.id}`,
    })) || [],
);
</script>
