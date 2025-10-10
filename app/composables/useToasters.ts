export function useToasters() {
  const route = useRoute();
  const toast = useToast();
  onBeforeMount(async () => {
    const path = route.path;
    console.log({ route, path });
    if (route.query?.emailVerified === "1") {
      toast.add({
        title: "Account successfully verified",
        description: "Welcome to Soc-inno 😇",
        icon: "noto:party-popper",
      });
      await navigateTo(path);
    } else if (route.query?.emailVerified === "2") {
      toast.add({
        title: "Your account is already verified!",
        description: "Welcome to Soc-inno 😇",
        icon: "noto:party-popper",
      });
      await navigateTo(path);
    } else if (route.query?.logged_out === "1") {
      toast.add({
        title: "Successfully logged out!",
        icon: "mdi:information-circle-outline",
      });
      await navigateTo(path);
    }
  });
}
