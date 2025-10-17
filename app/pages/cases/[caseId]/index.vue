<template>
  <div>case detail page, case {{ caseId }}</div>
</template>

<script setup lang="ts">
const route = useRoute();
const caseId = parseInt((route.params?.caseId as string) || "NaN");
if (isNaN(caseId)) {
  // TODO: report error
  throw createError({
    statusMessage: "Invalid case id",
    statusCode: 400,
  });
}
// fetch case on navigation
</script>
