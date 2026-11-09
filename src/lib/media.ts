/** Resolve a stored poster id or absolute URL for <Image>. */
export function mediaUrl(publicIdOrUrl: string | null | undefined) {
  if (!publicIdOrUrl) return undefined;
  if (/^https?:\/\//i.test(publicIdOrUrl)) return publicIdOrUrl;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloud) return undefined;
  return `https://res.cloudinary.com/${cloud}/image/upload/${publicIdOrUrl}`;
}
