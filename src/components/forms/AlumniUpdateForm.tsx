"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "./Field";
import { site } from "@/content/site";

type Errors = Partial<Record<"name" | "batch" | "email" | "organization" | "linkedin", string>>;

export function AlumniUpdateForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const name = get("name");
    const batch = get("batch");
    const email = get("email");
    const branch = get("branch");
    const societyRole = get("societyRole");
    const title = get("title");
    const organization = get("organization");
    const linkedin = get("linkedin");
    const note = get("note");

    const next: Errors = {};
    if (!name) next.name = "Enter your name.";
    if (!/^\d{4}$/.test(batch)) next.batch = "Use a four-digit batch year, for example 2024.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!organization) next.organization = "Where are you now?";
    if (linkedin && !/^https?:\/\//.test(linkedin)) next.linkedin = "Start the link with https://";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const subject = encodeURIComponent(`Alumni update: ${name} (batch ${batch})`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Batch: ${batch}`,
        `Email: ${email}`,
        branch && `Branch: ${branch}`,
        societyRole && `Role in DataBiz: ${societyRole}`,
        title && `Current title: ${title}`,
        `Organization: ${organization}`,
        linkedin && `LinkedIn: ${linkedin}`,
        note && `\nNote:\n${note}`,
        "\nI understand the core reviews updates before anything is published.",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="alumni-name" label="Name" required error={errors.name}>
          <input
            id="alumni-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "alumni-name-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="alumni-batch" label="Batch (graduation year)" required error={errors.batch}>
          <input
            id="alumni-batch"
            name="batch"
            type="text"
            inputMode="numeric"
            maxLength={4}
            required
            aria-invalid={Boolean(errors.batch)}
            aria-describedby={errors.batch ? "alumni-batch-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="alumni-email" label="Email" required error={errors.email}>
          <input
            id="alumni-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "alumni-email-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="alumni-branch" label="Branch">
          <input id="alumni-branch" name="branch" type="text" className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="alumni-role" label="Role in DataBiz">
          <input id="alumni-role" name="societyRole" type="text" className={inputClass} />
        </Field>
        <Field id="alumni-title" label="Current title">
          <input id="alumni-title" name="title" type="text" className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="alumni-org" label="Organization" required error={errors.organization}>
          <input
            id="alumni-org"
            name="organization"
            type="text"
            autoComplete="organization"
            required
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={errors.organization ? "alumni-org-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="alumni-linkedin" label="LinkedIn" error={errors.linkedin}>
          <input
            id="alumni-linkedin"
            name="linkedin"
            type="url"
            placeholder="https://"
            aria-invalid={Boolean(errors.linkedin)}
            aria-describedby={errors.linkedin ? "alumni-linkedin-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id="alumni-note"
        label="Note for the community"
        hint="A line or two about what you do now, or advice for current members."
      >
        <textarea
          id="alumni-note"
          name="note"
          aria-describedby="alumni-note-hint"
          className={textareaClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="md">
          Send update
        </Button>
        <p className="text-xs text-steel">
          The core reviews every update before it appears on this page.
        </p>
      </div>
      {sent ? (
        <p className="text-sm text-signal-deep" role="status">
          Your mail app should open with the update ready. If it does not, write to {site.email}.
        </p>
      ) : null}
    </form>
  );
}
