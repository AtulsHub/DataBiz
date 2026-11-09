import { createHash } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_FOLDERS,
  type CloudinaryFolder,
} from "@/lib/cloudinary-folders";

export { CLOUDINARY_FOLDERS, type CloudinaryFolder };

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Cloudinary signed-upload signature (SHA-1 of sorted params + api_secret). */
export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string,
) {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export function signBrowserUpload(input: {
  folder: CloudinaryFolder;
  resourceType?: "image" | "raw" | "auto";
  /** Private delivery; use for resumes / OA files. */
  accessMode?: "public" | "authenticated";
}) {
  ensureConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: input.folder,
  };
  if (input.accessMode === "authenticated") {
    paramsToSign.access_mode = "authenticated";
  }

  const signature = signCloudinaryParams(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    folder: input.folder,
    signature,
    resourceType: input.resourceType ?? "image",
    accessMode: input.accessMode ?? "public",
  };
}

/** Short-lived signed URL for authenticated resume / OA files. */
export function signedPrivateFileUrl(
  publicId: string,
  options?: { expiresInSeconds?: number },
) {
  ensureConfigured();
  const expiresAt =
    Math.round(Date.now() / 1000) + (options?.expiresInSeconds ?? 60 * 10);

  // Prefer authenticated delivery URL; fall back to a signed raw URL.
  try {
    return cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      secure: true,
      expires_at: expiresAt,
    });
  } catch {
    return cloudinary.utils.private_download_url(publicId, "", {
      resource_type: "raw",
      type: "upload",
      expires_at: expiresAt,
    });
  }
}

/** Server-side raw upload (resumes / OA PDFs) via the authenticated Cloudinary SDK. */
export function uploadRawBuffer(input: {
  buffer: Buffer;
  folder: CloudinaryFolder;
  filename: string;
  accessMode?: "public" | "authenticated";
}): Promise<{ publicId: string }> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: input.folder,
        resource_type: "raw",
        access_mode: input.accessMode ?? "authenticated",
        filename_override: input.filename,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.public_id) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({ publicId: result.public_id });
      },
    );
    stream.end(input.buffer);
  });
}
