export default defineNuxtRouteMiddleware((to, _from) => {
  const sess = useUserSession();
  const loggedIn = sess?.loggedIn?.value;
  const user = sess?.user.value;
  const emailVerifiedAt = user?.emailVerifiedAt;
  console.log("loggedIn:", loggedIn);
  console.log("user:", user);
  console.log("email_verified_at:", emailVerifiedAt);

  // redirect the user to the login screen if they're not authenticated
  if (!loggedIn) {
    console.log(
      "auth middleware: not logged in, trying to visit:",
      to.fullPath,
    );
    return navigateTo("/login?redirectTo=" + to.fullPath);
  }

  // redirect to email verification page if needed
  const isVerificationPage = [
    "/account-needs-verification",
    "/account-verification",
  ].includes(to.path);
  if (loggedIn && !emailVerifiedAt && !isVerificationPage) {
    // TODO: report error
    console.error(
      `auth middleware: [user:${user?.email}] email is not verified but user has session`,
    );
    return navigateTo("/account-needs-verification");
  }
});
