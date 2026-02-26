<template>
  <UPageCard :title="shownCase.title" variant="subtle">
    <div class="flex gap-1.5">
      <CaseTags
        :c="shownCase"
        @click:orgsector="(s) => emit('click:orgsector', s)"
        @click:orgtype="(s) => emit('click:orgtype', s)"
        @click:tag="(s) => emit('click:tag', s)"
      />
    </div>
    <p class="whitespace-pre-line">{{ shownCase.challengeDescription }}</p>
    <div class="text-right">
      <UButton
        variant="link"
        trailing-icon="mdi-chevron-right"
        :to="`/cases/${shownCase.id}`"
        class="cursor-pointer"
        >Se detaljer</UButton
      >
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
// NOTE: `case` is an invalid prop name
defineProps({
  shownCase: {
    type: Object as PropType<CaseSerialized>,
    required: true,
  },
});

const emit = defineEmits<{
  "click:orgsector": [OrganizationSector];
  "click:orgtype": [OrganizationType];
  "click:tag": [string];
}>();
</script>
