<template>
  <UHeader class="bg-gray-100">
    <template #title>
      <div class="flex gap-2 justify-center">
        <p class="font-light text-2xl font-sans">Soc-inno</p>
      </div>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <div class="flex items-center gap-1.5">
        <UButton
          v-if="!loggedIn"
          class="cursor-pointer"
          color="secondary"
          variant="subtle"
          @click="
            () => {
              openLoginModal();
            }
          "
          >Log in</UButton
        >
        <UButton
          v-if="!loggedIn"
          class="cursor-pointer"
          color="primary"
          variant="subtle"
          to="/create-account"
          >Create account</UButton
        >
        <UPopover
          v-if="loggedIn"
          :content="{ align: 'end', side: 'top', sideOffset: 8 }"
        >
          <UButton
            class="rounded-full bg-white hover:bg-white cursor-pointer hover:border-gray-400 border border-gray-300 transition-colors"
            color="neutral"
            variant="ghost"
            icon="material-symbols:person-2-outline-rounded"
            aria-label="Profile menu"
          />
          <template #content>
            <UNavigationMenu
              orientation="vertical"
              :items="profileItems"
              class="data-[orientation=vertical]:w-48"
            />
          </template>
        </UPopover>
      </div>
    </template>
    <template #body>
      <div>
        <!-- mobile menu -->
        <UNavigationMenu
          :items="navItems"
          orientation="vertical"
          class="-mx-2.5"
        />
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const { clear, loggedIn } = useUserSession();
const { openLoginModal } = useLoginModal();

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Cases",
    to: "/cases",
    icon: "i-lucide-book-open",
    active: route.path.startsWith("/cases"),
  },
  {
    label: "About",
    to: "/about",
    icon: "i-lucide-info",
    active: route.path.startsWith("/about"),
  },
]);

const profileItems = ref<NavigationMenuItem[][]>([
  [
    {
      label: "My account",
      icon: "i-lucide-box",
      to: "/profile",
      active: route.path.startsWith("/profile"),
    },
    {
      label: "Log out",
      icon: "lucide:log-out",
      class: "cursor-pointer",
      onSelect: async () => {
        await clear();
        navigateTo("/cases?logged_out=1"); // TODO: implement noti
      },
    },
  ],
]);
</script>
