import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import multer from "multer";

const MAX_BYTES = 20 * 1024 * 1024;

type MulterRequest = IncomingMessage & {
  file?: Express.Multer.File;
  body?: Record<string, unknown>;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter(_req, file, cb) {
    const looksPdf =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/x-pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!looksPdf) {
      cb(new Error("Resume must be a PDF."));
      return;
    }
    cb(null, true);
  },
});

/** Run multer against a Web Fetch `Request` (App Router). */
export async function parseResumeUpload(
  request: Request,
): Promise<Express.Multer.File> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("Expected multipart/form-data.");
  }

  const body = Buffer.from(await request.arrayBuffer());
  const readable = Readable.from(body) as MulterRequest;
  readable.headers = {
    "content-type": contentType,
    "content-length": String(body.length),
  };

  const res = {
    end() {},
    write() {},
    writeHead() {},
  } as unknown as ServerResponse;

  await new Promise<void>((resolve, reject) => {
    upload.single("file")(readable as never, res as never, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  const file = readable.file;
  if (!file?.buffer?.length) {
    throw new Error("Choose a PDF to upload.");
  }
  return file;
}

export function multerErrorMessage(error: unknown): {
  status: number;
  message: string;
} {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return { status: 413, message: "Resume must be 20 MB or smaller." };
    }
    return { status: 400, message: error.message };
  }
  if (error instanceof Error) {
    return { status: 400, message: error.message };
  }
  return { status: 400, message: "Could not read the upload." };
}
