export const prepareAuthHeaders = (headers) => {
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};