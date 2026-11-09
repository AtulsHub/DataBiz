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

export function signBrowserUpload(input: {
  folder: CloudinaryFolder;
  resourceType?: "image" | "raw" | "auto";
}) {
  ensureConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: input.folder,
  };

  const signature = cloudinary.utils.api_sign_request(
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
  };
}
