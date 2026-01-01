<template>
<div class="flex gap-1.5">
  <div v-if="c">
    <UBadge
      size="md"
      variant="soft"
      color="info"
      :label="getPrettySector(c.sector as OrganizationSector)"
    />
  </div>
  <div v-if="c">
    <UBadge
      size="md"
      variant="soft"
      color="info"
      :label="getPrettyOrgType(c.organizationType as OrganizationType)"
    />
  </div>
  <div v-for="tag in (c?.categoryTags || [])" :key="tag.id">
    <UBadge size="md" variant="soft" color="secondary" :label="tag.tag" />
  </div>
</div>
</template>

<script lang="ts" setup>
defineProps({
  c: {
    type: Object as PropType<CaseSerialized>,
    required: false,
    default: () => undefined,
  },
});
</script>
