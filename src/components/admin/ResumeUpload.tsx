"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

const MAX_BYTES = 20 * 1024 * 1024;

type Props = {
  name?: string;
  defaultPublicId?: string;
};

export function ResumeUpload({
  name = "resumePublicId",
  defaultPublicId,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [publicId, setPublicId] = useState(defaultPublicId ?? "");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(undefined);

    const looksPdf =
      file.type === "application/pdf" ||
      file.type === "application/x-pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!looksPdf) {
      setError("Resume must be a PDF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Resume must be 20 MB or smaller.");
      return;
    }

    setPending(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean;
        publicId?: string;
        error?: string;
      } | null;

      if (!response.ok || !json?.ok || !json.publicId) {
        throw new Error(json?.error || `Upload failed (${response.status}).`);
      }

      setPublicId(json.publicId);
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
        id={`${name}-file`}
        label="Resume (PDF)"
        hint="Private Cloudinary upload · max 20 MB."
        error={error}
        required
      >
        <input
          ref={inputRef}
          id={`${name}-file`}
          type="file"
          accept="application/pdf,.pdf"
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
          disabled={pending || !publicId}
          onClick={() => {
            setPublicId("");
            setError(undefined);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Clear resume
        </Button>
        {pending ? (
          <p className="text-sm text-mute">Uploading…</p>
        ) : publicId ? (
          <p className="font-mono text-xs text-mute">Uploaded</p>
        ) : null}
      </div>
    </div>
  );
}
