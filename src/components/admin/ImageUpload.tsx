"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  signPublicImageUpload,
  type SignUploadResult,
} from "@/app/actions/media";
import type { CloudinaryFolder } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  /** When set, stores the Cloudinary public id in a hidden form field. */
  name?: string;
  folder: CloudinaryFolder;
  label: string;
  hint?: string;
  defaultPublicId?: string;
  defaultPreviewUrl?: string;
  /** Called after a successful upload with the Cloudinary secure URL. */
  onUploaded?: (result: { publicId: string; url: string }) => void;
  clearLabel?: string;
  showPreview?: boolean;
};

export function ImageUpload({
  name,
  folder,
  label,
  hint = "Max 5 MB. JPG, PNG, or WebP.",
  defaultPublicId,
  defaultPreviewUrl,
  onUploaded,
  clearLabel = "Clear image",
  showPreview = true,
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
      setError("Images must be 5 MB or smaller.");
      return;
    }

    setPending(true);
    const signed: SignUploadResult = await signPublicImageUpload(folder);
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

      const url = json.secure_url || "";
      setPublicId(json.public_id);
      setPreviewUrl(url);
      onUploaded?.({ publicId: json.public_id, url });
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  const fieldId = `${name ?? folder}-file`;

  return (
    <div className="space-y-3">
      {name ? <input type="hidden" name={name} value={publicId} /> : null}
      <Field id={fieldId} label={label} hint={hint} error={error}>
        <input
          ref={inputRef}
          id={fieldId}
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
          {clearLabel}
        </Button>
        {pending ? (
          <p className="text-sm text-mute">Uploading…</p>
        ) : name && publicId ? (
          <p className="font-mono text-xs text-mute">{publicId}</p>
        ) : null}
      </div>
      {showPreview && previewUrl ? (
        <Image
          src={previewUrl}
          alt=""
          width={640}
          height={360}
          className="h-auto w-full max-w-md border border-line"
        />
      ) : null}
    </div>
  );
}
