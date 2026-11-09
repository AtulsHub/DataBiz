"use server";

import {
  CLOUDINARY_FOLDERS,
  isCloudinaryConfigured,
  signBrowserUpload,
} from "@/lib/cloudinary";
import type { CloudinaryFolder } from "@/lib/cloudinary-folders";
import { requireAdmin } from "@/lib/session";

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "image" | "raw" | "auto";
};

export type SignUploadResult =
  | { ok: true; upload: SignedUpload }
  | { ok: false; error: string };

const PUBLIC_IMAGE_FOLDERS = new Set<CloudinaryFolder>([
  CLOUDINARY_FOLDERS.posters,
  CLOUDINARY_FOLDERS.blog,
  CLOUDINARY_FOLDERS.show,
  CLOUDINARY_FOLDERS.gallery,
  CLOUDINARY_FOLDERS.avatars,
  CLOUDINARY_FOLDERS.sponsors,
]);

export async function signPublicImageUpload(
  folder: CloudinaryFolder,
): Promise<SignUploadResult> {
  await requireAdmin();

  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Cloudinary env vars are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    };
  }

  if (!PUBLIC_IMAGE_FOLDERS.has(folder)) {
    return { ok: false, error: "That folder is not available for this upload." };
  }

  try {
    const upload = signBrowserUpload({
      folder,
      resourceType: "image",
    });
    return { ok: true, upload };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not sign the upload.",
    };
  }
}

export async function signEventPosterUpload(): Promise<SignUploadResult> {
  return signPublicImageUpload(CLOUDINARY_FOLDERS.posters);
}
