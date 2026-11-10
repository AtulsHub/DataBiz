export const CLOUDINARY_FOLDERS = {
  posters: "posters",
  blog: "blog",
  show: "show",
  gallery: "gallery",
  avatars: "avatars",
  sponsors: "sponsors",
  resumes: "resumes",
  resources: "resources",
} as const;

export type CloudinaryFolder =
  (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];
