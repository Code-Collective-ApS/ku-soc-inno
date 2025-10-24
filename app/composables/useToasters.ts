export function useToasters() {
  const route = useRoute();
  const toast = useToast();
  const _path = computed(() => route.path);
  const _query = computed(() => route.query);

  watch(
    [_path, _query],
    async ([path, query]) => {
      console.log({ query, path });
      if (query?.emailVerified === "1") {
        toast.add({
          title: "Account successfully verified",
          description: "Welcome to Soc-inno 😇",
          icon: "noto:party-popper",
        });
        await navigateTo(path);
      } else if (query?.emailVerified === "2") {
        toast.add({
          title: "Your account is already verified!",
          description: "Welcome to Soc-inno 😇",
          icon: "noto:party-popper",
        });
        await navigateTo(path);
      } else if (query?.logged_out === "1") {
        toast.add({
          title: "Successfully logged out!",
          icon: "mdi:information-circle-outline",
        });
        await navigateTo(path);
      }
    },
    { deep: true, immediate: true },
  );
}
