<template>
  <UFooter class="bg-secondary-50 py-12">
    <div class="flex flex-col gap-12">
      <div class="flex flex-col items-center gap-3">
        <UTooltip text="Open GitHub repository in new tab">
          <p class="text-sm text-gray-500">
            This application is open source, and you are welcome to help
            improving this web app.
          </p>
          <p class="text-sm text-gray-500">
            The collaboration is taking place on
            <UButton
              class="opacity-90"
              color="neutral"
              variant="outline"
              size="xs"
              to="https://github.com/Code-Collective-ApS/ku-soc-inno"
              target="_blank"
              icon="mdi:github"
              aria-label="GitHub repository"
            >
              Github
            </UButton>
          </p>
        </UTooltip>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <KULogo />
        <ClientOnly>
          <div class="flex gap-x-6 xl:gap-x-12 mt-3">
            <div
              v-if="dataIsClear"
              class="flex flex-col text-center text-xs text-gray-500"
            >
              <p class="mb-1">Administrator:</p>
              <p>{{ name }}</p>
              <p>{{ email }}</p>
            </div>
            <div
              v-if="dataIsClear"
              class="flex flex-col text-center text-xs text-gray-500"
            >
              <p class="mb-1">Webmaster:</p>
              <p>
                <a :href="webmasterLink" target="_blank">
                  {{ webmasterName }}
                </a>
              </p>
              <p>{{ webmasterEmail }}</p>
            </div>
          </div>
        </ClientOnly>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-500">
          Soc-inno &copy;
          <span v-text="new Date().getFullYear()" />
          Københavns Universitet
        </p>
      </div>
    </div>
  </UFooter>
</template>

<script setup lang="ts">
const dataIsClear = ref(false);
const config = useRuntimeConfig().public;
const name = ref(btoa(config.adminName));
const email = ref(btoa(config.adminEmail));
const webmasterName = ref(btoa(config.webmasterName));
const webmasterEmail = ref(btoa(config.webmasterEmail));
const webmasterLink = ref(config.webmasterLink);

onBeforeMount(() => {
  email.value = atob(email.value);
  name.value = atob(name.value);
  webmasterEmail.value = atob(webmasterEmail.value);
  webmasterName.value = atob(webmasterName.value);
  dataIsClear.value = true;
});
</script>
