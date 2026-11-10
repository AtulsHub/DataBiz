"use client";

import { useActionState, useRef, useState } from "react";
import { createPost, updatePost } from "@/app/actions/posts";
import type { ActionResult } from "@/app/actions/events";
import type { PostItem } from "@/lib/posts";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishActions } from "@/components/admin/PublishActions";

type Props = { post?: PostItem };

type ImageLayout = "full" | "half" | "wide" | "card";

const initial: ActionResult = { ok: false };

const LAYOUTS: {
  id: ImageLayout;
  label: string;
  hint: string;
}[] = [
  {
    id: "full",
    label: "Full",
    hint: "One image across the article column",
  },
  {
    id: "half",
    label: "Half",
    hint: "Insert two halves for a side-by-side pair",
  },
  {
    id: "wide",
    label: "Wide",
    hint: "Breaks out wider than the text",
  },
  {
    id: "card",
    label: "Inset",
    hint: "Smaller image with breathing room",
  },
];

export function PostEditorForm({ post }: Props) {
  const action = post ? updatePost.bind(null, post.id!) : createPost;
  const [state, formAction, pending] = useActionState(action, initial);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [layout, setLayout] = useState<ImageLayout>("full");
  const [caption, setCaption] = useState("");
  const [pendingHalfUrl, setPendingHalfUrl] = useState<string | null>(null);
  const [insertNote, setInsertNote] = useState("");
  const isPublished = post?.status === "published";

  function insertIntoBody(snippet: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const lead = before.length > 0 && !before.endsWith("\n") ? "\n\n" : before.endsWith("\n\n") || before.length === 0 ? "" : "\n";
    const trail = after.length > 0 && !after.startsWith("\n") ? "\n\n" : "\n\n";
    const block = `${lead}${snippet}${trail}`;
    el.value = `${before}${block}${after}`;
    const cursor = before.length + block.length;
    el.focus();
    el.setSelectionRange(cursor, cursor);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function imageMarkdown(url: string, imageCaption: string, imageLayout: ImageLayout) {
    const alt = imageCaption.trim() || "Image";
    if (imageLayout === "full") return `![${alt}](${url})`;
    return `![${alt}](${url} "${imageLayout}")`;
  }

  function onBodyImageUploaded(url: string) {
    const label = caption.trim();

    if (layout === "half") {
      if (!pendingHalfUrl) {
        setPendingHalfUrl(url);
        setInsertNote(
          "First half saved. Upload a second image — both will insert as a side-by-side pair at your cursor.",
        );
        return;
      }

      const left = imageMarkdown(pendingHalfUrl, label || "Image", "half");
      const right = imageMarkdown(url, label || "Image", "half");
      insertIntoBody(`${left}\n${right}`);
      setPendingHalfUrl(null);
      setInsertNote("Side-by-side pair inserted at the cursor.");
      setCaption("");
      return;
    }

    insertIntoBody(imageMarkdown(url, label, layout));
    setInsertNote(
      `${LAYOUTS.find((item) => item.id === layout)?.label ?? "Image"} inserted at the cursor. Place the cursor where the next image should go, then upload again.`,
    );
    setCaption("");
  }

  function insertSnippet(kind: "heading" | "quote" | "divider") {
    if (kind === "heading") {
      insertIntoBody("## Section title\n\nWrite this section…");
      return;
    }
    if (kind === "quote") {
      insertIntoBody("> A short pull quote that earns the space.");
      return;
    }
    insertIntoBody("---");
  }

  return (
    <form action={formAction} className="space-y-8">
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

      <section className="space-y-5 border border-line bg-paper-elevated p-5 sm:p-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
            Meta
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            Post details
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="title" label="Title" required error={state.fieldErrors?.title}>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              className={inputClass}
            />
          </Field>
          <Field id="slug" label="Slug" hint="Leave blank to generate from the title.">
            <input id="slug" name="slug" defaultValue={post?.slug} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="authorName"
            label="Author"
            required
            error={state.fieldErrors?.authorName}
          >
            <input
              id="authorName"
              name="authorName"
              required
              defaultValue={post?.author}
              className={inputClass}
            />
          </Field>
          <Field
            id="status"
            label="Status"
            hint="Draft stays private. Use Publish to open /blog/[slug]."
          >
            <select
              id="status"
              name="status"
              defaultValue={post?.status ?? "draft"}
              className={inputClass}
            >
              <option value="draft">Draft — not public</option>
              <option value="published">Published — live on /blog</option>
            </select>
          </Field>
        </div>

        <Field id="excerpt" label="Excerpt">
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt}
            className={textareaClass}
          />
        </Field>

        <Field id="tags" label="Tags" hint="Comma-separated">
          <input
            id="tags"
            name="tags"
            defaultValue={post?.tags?.join(", ")}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-5 border border-line bg-paper-elevated p-5 sm:p-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
            Cover
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            Hero image
          </h2>
          <p className="mt-1 text-sm text-mute">
            One cover for the top of the post — separate from images inside the body.
          </p>
        </div>
        <ImageUpload
          name="coverPublicId"
          folder={CLOUDINARY_FOLDERS.blog}
          label="Cover image"
          hint="Shown as the article hero. Uploads to Cloudinary blog/."
          defaultPublicId={post?.coverPublicId}
          defaultPreviewUrl={post?.coverUrl}
          clearLabel="Clear cover"
        />
      </section>

      <section className="space-y-5 border border-line bg-paper-elevated p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
              Body
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              Write & place images
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-mute">
              Click in the body where the next image should sit, pick a layout,
              then upload. Images go at the cursor — not stacked at the end.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertSnippet("heading")}
            >
              + Section
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertSnippet("quote")}
            >
              + Quote
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertSnippet("divider")}
            >
              + Divider
            </Button>
          </div>
        </div>

        <Field
          id="body"
          label="Article body (markdown)"
          hint="Headings, lists, links, code. Place the caret, then use Insert image below."
        >
          <textarea
            ref={bodyRef}
            id="body"
            name="body"
            rows={18}
            defaultValue={post?.body}
            className={`${textareaClass} min-h-[22rem] font-mono text-[0.92rem] leading-relaxed`}
          />
        </Field>

        <div className="space-y-4 border border-dashed border-line-strong bg-paper p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium text-ink">Insert image at cursor</p>
            <p className="mt-1 text-xs text-mute">
              Choose a layout first. For Half, upload two photos to make a pair.
            </p>
          </div>

          <div
            className="grid gap-2 sm:grid-cols-4"
            role="radiogroup"
            aria-label="Image layout"
          >
            {LAYOUTS.map((item) => {
              const active = layout === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setLayout(item.id);
                    setPendingHalfUrl(null);
                    setInsertNote("");
                  }}
                  className={
                    active
                      ? "rounded-sm border border-ember bg-ember-soft px-3 py-2.5 text-left"
                      : "rounded-sm border border-line bg-paper-elevated px-3 py-2.5 text-left hover:border-ink"
                  }
                >
                  <span className="block text-sm font-medium text-ink">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[0.7rem] leading-snug text-mute">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <Field
            id="imageCaption"
            label="Caption (optional)"
            hint="Shown under the image on the public post."
          >
            <input
              id="imageCaption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className={inputClass}
              placeholder="e.g. Workshop demos at MANIT"
            />
          </Field>

          {pendingHalfUrl ? (
            <p className="rounded-sm border border-ember/40 bg-ember-soft px-3 py-2 text-sm text-ink">
              Waiting for the second half of the pair…
              <button
                type="button"
                className="ml-2 text-ember underline"
                onClick={() => {
                  setPendingHalfUrl(null);
                  setInsertNote("");
                }}
              >
                Cancel
              </button>
            </p>
          ) : null}

          {insertNote ? (
            <p className="text-sm text-signal-deep" role="status">
              {insertNote}
            </p>
          ) : null}

          <ImageUpload
            folder={CLOUDINARY_FOLDERS.blog}
            label={
              layout === "half" && pendingHalfUrl
                ? "Second half image"
                : "Upload & insert"
            }
            hint="Max 5 MB. JPG, PNG, or WebP. Inserts markdown at the current caret."
            clearLabel="Reset uploader"
            showPreview={false}
            onUploaded={({ url }) => onBodyImageUploaded(url)}
          />
        </div>
      </section>

      <PublishActions
        pending={pending}
        cancelHref={post ? undefined : "/admin/posts"}
        publicHref={isPublished ? `/blog/${post!.slug}` : undefined}
      />
    </form>
  );
}
