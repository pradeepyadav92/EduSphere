const normalizeUrl = (value) => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

export const baseApiURL = () => {
  const envUrl = normalizeUrl(process.env.REACT_APP_BASE_URL);

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/`;
  }

  return "/api/";
};
