<template>
  <div>
    <div class="flex gap-6 flex-col">
      <div v-for="c in cases" :key="c.id">
        <UPageCard :title="c.title" variant="subtle">
          <div class="flex gap-1.5">
            <div v-for="tag in c.categoryTags" :key="tag.id">
              <UBadge
                size="md"
                variant="soft"
                color="secondary"
                :label="tag.tag"
              />
            </div>
          </div>
          <p>{{ c.challengeDescription }}</p>
          <div class="text-right">
            <UButton
              variant="link"
              trailing-icon="mdi-chevron-right"
              :to="`/cases/${c.id}`"
              >Open</UButton
            >
          </div>
        </UPageCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cases: {
    type: Array as PropType<CaseResponse[]>,
    required: false,
    default: () => [],
  },
});
</script>
