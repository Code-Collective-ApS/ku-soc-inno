<template>
  <div class="[&>*>p]:font-bold flex flex-col gap-y-3">
    <div>
      <h1 class="text-3xl font-serif mt-6">Case: {{ currentCase.title }}</h1>
    </div>

    <div>
      <div class="flex gap-1.5">
        <CaseTags :c="currentCase" />
      </div>
    </div>

    <div>
      <div class="inline-block">
        <div
          class="text-xs mt-3 mb-3 text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1.5"
        >
          <div class="flex items-center gap-1 mt-1">
            <UIcon class="shrink-0 text-md" name="mdi:briefcase" />
            <p>Sektor:</p>
          </div>
          <div class="mt-1">{{ getPrettySector(currentCase.sector) }}</div>
          <div class="flex items-center gap-1">
            <UIcon class="shrink-0 text-md" name="mdi:account-supervisor" />
            <p>Type af organisation:</p>
          </div>
          <div>{{ getPrettyOrgType(currentCase.organizationType) }}</div>
          <div class="mt-1">Oprettet:</div>
          <div class="mt-1">{{ prettyDate(currentCase.createdAt) }}</div>
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
      <p class="mb-3">Løsningsbarrierer</p>
      <div class="inline-block">
        <div class="flex flex-col gap-3">
          <div v-for="barrier in currentCase.barriers" :key="barrier.id">
            <div
              :key="barrier.id"
              class="bg-indigo-50 px-2 py-1 items-center flex justify-between rounded-lg border border-indigo-300"
            >
              <span>{{ barrier.barrier }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <p>Dataindsamling</p>
      <div class="whitespace-pre-line">{{ currentCase.dataText }}</div>
    </div>
    <div class="mb-3">
      <p>Andet, der er relevant at nævne?</p>
      <div class="whitespace-pre-line">{{ currentCase.freeText }}</div>
    </div>
    <div v-if="!currentCase.contactPublic || (user && currentCase.isOwned)">
      <p>Kontakt information</p>
      <div>
        Kontaktinformationer er kun tilgængelige for Københavns Universitet
      </div>
    </div>
    <div v-else>
      <p>Kontakt information</p>
      <div class="inline-block">
        <div class="grid grid-cols-2 mt-1.5">
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
</template>
<script lang="ts" setup>
defineProps({
  currentCase: {
    type: Object as PropType<CaseSerialized>,
    required: true,
  },
});
const { user } = useUserSession();
</script>
