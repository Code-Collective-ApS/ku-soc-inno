<template>
  <div class="[&>*>p]:font-bold flex flex-col gap-y-3">
    <div>
      <h1 class="text-3xl font-serif mt-6">Case: {{ currentCase.title }}</h1>
    </div>

    <div>
      <div class="flex gap-1.5">
        <div v-for="tag in currentCase.categoryTags" :key="tag.id">
          <UBadge size="md" variant="soft" color="secondary" :label="tag.tag" />
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
</template>
<script lang="ts" setup>
defineProps({
  currentCase: {
    type: Object as PropType<CaseSerialized>,
    required: true,
  },
});
</script>
