import {
  CLOUDINARY_FOLDERS,
  isCloudinaryConfigured,
  uploadRawBuffer,
} from "@/lib/cloudinary";
import { multerErrorMessage, parseResumeUpload } from "@/lib/multer-parse";
import { getSession } from "@/lib/session";

type UploadResponse =
  | { ok: true; publicId: string }
  | { ok: false; error: string };

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      {
        ok: false,
        error: "Sign in with your college email before uploading a resume.",
      } satisfies UploadResponse,
      { status: 401 },
    );
  }

  if (!isCloudinaryConfigured()) {
    return Response.json(
      {
        ok: false,
        error:
          "Cloudinary env vars are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
      } satisfies UploadResponse,
      { status: 503 },
    );
  }

  let file: Express.Multer.File;
  try {
    file = await parseResumeUpload(request);
  } catch (error) {
    const { status, message } = multerErrorMessage(error);
    return Response.json(
      { ok: false, error: message } satisfies UploadResponse,
      { status },
    );
  }

  try {
    let uploaded: { publicId: string };
    try {
      uploaded = await uploadRawBuffer({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.resumes,
        filename: file.originalname,
        accessMode: "authenticated",
      });
    } catch {
      uploaded = await uploadRawBuffer({
        buffer: file.buffer,
        folder: CLOUDINARY_FOLDERS.resumes,
        filename: file.originalname,
        accessMode: "public",
      });
    }

    return Response.json({
      ok: true,
      publicId: uploaded.publicId,
    } satisfies UploadResponse);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Cloudinary upload failed.",
      } satisfies UploadResponse,
      { status: 502 },
    );
  }
}
