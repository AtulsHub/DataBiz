"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createPathway,
  updatePathway,
} from "@/app/actions/pathways";
import type { ActionResult } from "@/app/actions/events";
import type { PathwayItem } from "@/lib/pathways";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type ModuleDraft = {
  key: string;
  id?: string;
  title: string;
  description: string;
  url: string;
};

type Props = { pathway?: PathwayItem };

const initial: ActionResult = { ok: false };

function toDrafts(pathway?: PathwayItem): ModuleDraft[] {
  if (!pathway?.modules.length) {
    return [
      {
        key: crypto.randomUUID(),
        title: "",
        description: "",
        url: "",
      },
    ];
  }
  return pathway.modules.map((mod) => ({
    key: mod.id,
    id: mod.id,
    title: mod.title,
    description: mod.description,
    url: mod.url,
  }));
}

export function PathwayEditorForm({ pathway }: Props) {
  const action = pathway
    ? updatePathway.bind(null, pathway.id)
    : createPathway;
  const [state, formAction, pending] = useActionState(action, initial);
  const [modules, setModules] = useState<ModuleDraft[]>(() => toDrafts(pathway));
  const isPublished = pathway?.status === "published";

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="modulesJson"
        value={JSON.stringify(
          modules
            .filter((m) => m.title.trim() || m.url.trim())
            .map((m, index) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              url: m.url,
              sortOrder: index + 1,
            })),
        )}
      />

      {state.error ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-signal-deep" role="status">
          Saved.
        </p>
      ) : null}
      {state.fieldErrors?.modules || state.fieldErrors?.["modules.0.url"] ? (
        <p className="text-sm text-danger" role="alert">
          {state.fieldErrors.modules ||
            state.fieldErrors["modules.0.url"] ||
            "Check module URLs."}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Title" required error={state.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            defaultValue={pathway?.title}
            className={inputClass}
          />
        </Field>
        <Field id="slug" label="Slug" hint="Leave blank to generate from the title.">
          <input
            id="slug"
            name="slug"
            defaultValue={pathway?.slug}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="summary" label="Summary">
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={pathway?.summary}
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="discipline" label="Discipline">
          <select
            id="discipline"
            name="discipline"
            defaultValue={pathway?.discipline ?? "data"}
            className={inputClass}
          >
            <option value="data">Data</option>
            <option value="ml">ML</option>
            <option value="ai">AI</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field id="status" label="Status">
          <select
            id="status"
            name="status"
            defaultValue={pathway?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field id="sortOrder" label="Sort order">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={pathway?.sortOrder ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="space-y-4 border border-line bg-paper-elevated p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Modules</p>
            <p className="mt-1 text-xs text-mute">
              External readings and problem sets. Nothing is rehosted.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setModules((prev) => [
                ...prev,
                {
                  key: crypto.randomUUID(),
                  title: "",
                  description: "",
                  url: "",
                },
              ])
            }
          >
            Add module
          </Button>
        </div>

        <ul className="space-y-4">
          {modules.map((mod, index) => (
            <li
              key={mod.key}
              className="grid gap-3 border border-line bg-paper p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Field id={`mod-title-${mod.key}`} label={`Module ${index + 1} title`}>
                <input
                  id={`mod-title-${mod.key}`}
                  value={mod.title}
                  onChange={(e) =>
                    setModules((prev) =>
                      prev.map((row) =>
                        row.key === mod.key
                          ? { ...row, title: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`mod-url-${mod.key}`} label="URL">
                <input
                  id={`mod-url-${mod.key}`}
                  value={mod.url}
                  onChange={(e) =>
                    setModules((prev) =>
                      prev.map((row) =>
                        row.key === mod.key
                          ? { ...row, url: e.target.value }
                          : row,
                      ),
                    )
                  }
                  placeholder="https://"
                  className={inputClass}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={modules.length <= 1}
                  onClick={() =>
                    setModules((prev) => prev.filter((row) => row.key !== mod.key))
                  }
                >
                  Remove
                </Button>
              </div>
              <Field
                id={`mod-desc-${mod.key}`}
                label="Description"
                className="sm:col-span-3"
              >
                <textarea
                  id={`mod-desc-${mod.key}`}
                  rows={2}
                  value={mod.description}
                  onChange={(e) =>
                    setModules((prev) =>
                      prev.map((row) =>
                        row.key === mod.key
                          ? { ...row, description: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={textareaClass}
                />
              </Field>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : pathway ? "Save pathway" : "Create pathway"}
        </Button>
        {isPublished ? (
          <Button href={`/learn/${pathway!.slug}`} variant="ghost">
            View public page
          </Button>
        ) : (
          <Link href="/admin/learn" className="text-sm text-mute hover:text-ink">
            Back to list
          </Link>
        )}
      </div>
    </form>
  );
}
