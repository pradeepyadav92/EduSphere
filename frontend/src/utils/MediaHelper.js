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
  
  // If it's a legacy local file, prepend the media link
  return `${process.env.REACT_APP_MEDIA_LINK}/${path}`;
};
