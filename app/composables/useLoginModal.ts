import LoginModal from "~/components/LoginModal.vue";

export function useLoginModal() {
  const overlay = useOverlay();
  const loginModal = overlay.create(LoginModal);

  async function openLoginModal(): Promise<boolean> {
    console.log("login modal opening!");
    const modalInstance = loginModal.open({});
    const result = await modalInstance.result;
    console.log("login modal close with reuslt:", result);
    return result;
  }

  return {
    openLoginModal,
  };
}
