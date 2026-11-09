"use client";

import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = {
  name?: string;
  defaultPublicId?: string;
  defaultPreviewUrl?: string;
};

export function PosterUpload({
  name = "posterPublicId",
  defaultPublicId,
  defaultPreviewUrl,
}: Props) {
  return (
    <ImageUpload
      name={name}
      folder={CLOUDINARY_FOLDERS.posters}
      label="Poster image"
      hint="Uploads to Cloudinary folder posters/ (max 5 MB)."
      defaultPublicId={defaultPublicId}
      defaultPreviewUrl={defaultPreviewUrl}
      clearLabel="Clear poster"
    />
  );
}
