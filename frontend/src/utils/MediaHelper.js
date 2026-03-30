/**
 * Helper to determine the correct URL for media assets (profile pictures, materials, etc.)
 * Handles both legacy local storage and new Cloudinary URLs.
 */
export const getMediaSource = (path) => {
  if (!path) return "default.png";
  
  // If it's already a full URL (Cloudinary), return as is
  if (path.startsWith("http")) {
    return path;
  }

  const envMediaLink = process.env.REACT_APP_MEDIA_LINK?.trim();
  const mediaBase = envMediaLink
    ? (envMediaLink.endsWith("/") ? envMediaLink.slice(0, -1) : envMediaLink)
    : (typeof window !== "undefined"
        ? `${window.location.origin}/media`
        : "/media");

  // If the path already includes /media or media, we need to be careful
  if (path.startsWith("/media")) {
    // Extract everything after /media
    const relativePath = path.replace("/media", "");
    return `${mediaBase}${relativePath}`;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${mediaBase}${cleanPath}`;
};
