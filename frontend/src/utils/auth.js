export const clearStoredSession = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userType");
};

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return true;
    }

    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

    if (!decodedPayload.exp) {
      return false;
    }

    return decodedPayload.exp * 1000 <= Date.now();
  } catch (error) {
    return true;
  }
};

export const getValidStoredSession = () => {
  const userToken = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");

  if (!userToken || !userType || isTokenExpired(userToken)) {
    clearStoredSession();
    return null;
  }

  return { userToken, userType };
};
