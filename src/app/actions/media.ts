"use server";

import {
  CLOUDINARY_FOLDERS,
  isCloudinaryConfigured,
  signBrowserUpload,
  signedPrivateFileUrl,
} from "@/lib/cloudinary";
import type { CloudinaryFolder } from "@/lib/cloudinary-folders";
import { canAccessAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "image" | "raw" | "auto";
  accessMode: "public" | "authenticated";
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
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user.role)) {
    return { ok: false, error: "Admin sign-in required to upload images." };
  }

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

export async function signResumeUpload(): Promise<SignUploadResult> {
  // Never redirect from this action — client upload callers expect a result object.
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      error:
        "Sign in with your college email before uploading a resume.",
    };
  }

  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Cloudinary env vars are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    };
  }

  try {
    // Prefer authenticated access_mode; if the cloud rejects it, caller can retry.
    const upload = signBrowserUpload({
      folder: CLOUDINARY_FOLDERS.resumes,
      resourceType: "raw",
      accessMode: "authenticated",
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

/** Fallback signer without access_mode for clouds that reject authenticated uploads. */
export async function signResumeUploadPublicRaw(): Promise<SignUploadResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      error:
        "Sign in with your college email before uploading a resume.",
    };
  }
  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Cloudinary env vars are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    };
  }
  try {
    const upload = signBrowserUpload({
      folder: CLOUDINARY_FOLDERS.resumes,
      resourceType: "raw",
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

export async function mintResumeUrl(
  publicId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in required." };
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "Cloudinary is not configured." };
  }

  try {
    return { ok: true, url: signedPrivateFileUrl(publicId) };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not mint file URL.",
    };
  }
}
