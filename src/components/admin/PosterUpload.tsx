"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { signEventPosterUpload } from "@/app/actions/media";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

const MAX_BYTES = 5 * 1024 * 1024;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [publicId, setPublicId] = useState(defaultPublicId ?? "");
  const [previewUrl, setPreviewUrl] = useState(defaultPreviewUrl ?? "");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setError(undefined);

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Posters must be 5 MB or smaller.");
      return;
    }

    setPending(true);
    const signed = await signEventPosterUpload();
    if (!signed.ok) {
      setPending(false);
      setError(signed.error);
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signed.upload.apiKey);
    body.append("timestamp", String(signed.upload.timestamp));
    body.append("signature", signed.upload.signature);
    body.append("folder", signed.upload.folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.upload.cloudName}/${signed.upload.resourceType}/upload`,
        { method: "POST", body },
      );
      const json = (await response.json()) as {
        public_id?: string;
        secure_url?: string;
        error?: { message?: string };
      };

      if (!response.ok || !json.public_id) {
        throw new Error(json.error?.message || "Upload failed.");
      }

      setPublicId(json.public_id);
      setPreviewUrl(json.secure_url || "");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={publicId} />
      <Field
        id="poster-file"
        label="Poster image"
        hint="Uploads to Cloudinary folder posters/ (max 5 MB)."
        error={error}
      >
        <input
          ref={inputRef}
          id="poster-file"
          type="file"
          accept="image/*"
          disabled={pending}
          onChange={(e) => void onFileChange(e.target.files)}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending || (!publicId && !previewUrl)}
          onClick={() => {
            setPublicId("");
            setPreviewUrl("");
            setError(undefined);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Clear poster
        </Button>
        {pending ? (
          <p className="text-sm text-mute">Uploading…</p>
        ) : publicId ? (
          <p className="font-mono text-xs text-mute">{publicId}</p>
        ) : null}
      </div>
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Event poster preview"
          width={640}
          height={360}
          className="h-auto w-full max-w-md border border-line"
        />
      ) : null}
    </div>
  );
}
