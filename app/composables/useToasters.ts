import { useRoute, useToast, computed, watch, navigateTo } from "#imports";
import type { LocationQuery } from "vue-router";

export function useToasters() {
  const route = useRoute();
  const toast = useToast();
  const _path = computed(() => route.path);
  const _query = computed(() => route.query);

  watch(
    [_path, _query],
    async ([path, query]: [string, LocationQuery]) => {
      if (!import.meta.client) {
        // don't do anything serverside (will create 2 weird toasts)
        return;
      }
      if (query?.emailVerified === "1") {
        toast.add({
          title: "Din email er nu verificeret",
          description: "Velkommen til Soc-inno 😇",
          icon: "noto:party-popper",
          color: "success",
        });
        await navigateTo(path);
      } else if (query?.emailVerified === "2") {
        toast.add({
          title: "Din konto er allerede verificeret!",
          description: "Velkommen til Soc-inno 😇",
          icon: "noto:party-popper",
          color: "success",
        });
        await navigateTo(path);
      } else if (query?.loggedOut === "1") {
        toast.add({
          title: "Du er logget ud",
          icon: "mdi:information-circle-outline",
          color: "success",
        });
        await navigateTo(path);
      } else if (query.resetPassword === "1") {
        toast.add({
          title: "Du kan nu logge ind med dit nye password",
          color: "info",
          icon: "mdi:information-circle-outline",
        });
      }
    },
    { immediate: true },
  );
}
