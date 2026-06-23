export const RefreshToken = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    const data = await response.json();
    if (!response.ok) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    sessionStorage.setItem("token", data.accessToken);
    return data;
  } catch {
    window.location.href = "/login";
  }
};
