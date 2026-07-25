import { useLogout } from "@/hooks/api/auth/useAuth";
import { clearStoredAuthUser } from "@/utils/authUser";

const clearSessionAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  clearStoredAuthUser();
  window.location.href = "/login";
};

export const useLogoutAndRedirect = () => {
  const logoutMutation = useLogout();

  return () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearSessionAndRedirect();
      return;
    }

    logoutMutation.mutate(
      { refreshToken },
      { onSettled: clearSessionAndRedirect },
    );
  };
};
