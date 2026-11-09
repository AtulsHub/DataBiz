"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { createPost, updatePost } from "@/app/actions/posts";
import type { ActionResult } from "@/app/actions/events";
import type { PostItem } from "@/lib/posts";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { post?: PostItem };

const initial: ActionResult = { ok: false };

export function PostEditorForm({ post }: Props) {
  const action = post ? updatePost.bind(null, post.id!) : createPost;
  const [state, formAction, pending] = useActionState(action, initial);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const isPublished = post?.status === "published";

  function insertIntoBody(snippet: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const needsLeadingNewline = before.length > 0 && !before.endsWith("\n");
    const needsTrailingNewline = after.length > 0 && !after.startsWith("\n");
    const block = `${needsLeadingNewline ? "\n\n" : ""}${snippet}${
      needsTrailingNewline ? "\n\n" : ""
    }`;
    el.value = `${before}${block}${after}`;
    const cursor = before.length + block.length;
    el.focus();
    el.setSelectionRange(cursor, cursor);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <form action={formAction} className="space-y-6">
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

      <ImageUpload
        name="coverPublicId"
        folder={CLOUDINARY_FOLDERS.blog}
        label="Cover image"
        hint="Shown at the top of the public post. Uploads to Cloudinary blog/."
        defaultPublicId={post?.coverPublicId}
        defaultPreviewUrl={post?.coverUrl}
        clearLabel="Clear cover"
      />

      <Field
        id="body"
        label="Body (markdown)"
        hint="Supports headings, lists, links, code, and images. Use the uploader below to insert a picture."
      >
        <textarea
          ref={bodyRef}
          id="body"
          name="body"
          rows={16}
          defaultValue={post?.body}
          className={textareaClass}
        />
      </Field>

      <ImageUpload
        folder={CLOUDINARY_FOLDERS.blog}
        label="Insert image into body"
        hint="Uploads an image and inserts markdown at the cursor in the body."
        clearLabel="Reset"
        showPreview={false}
        onUploaded={({ url }) => {
          insertIntoBody(`![Image](${url})`);
        }}
      />

      <Field id="tags" label="Tags" hint="Comma-separated">
        <input
          id="tags"
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          name="intent"
          value="publish"
          variant="ember"
          disabled={pending}
        >
          {pending ? "Saving…" : "Publish"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="ghost"
          disabled={pending}
        >
          Save draft
        </Button>
        {isPublished ? (
          <Button href={`/blog/${post!.slug}`} variant="ghost">
            View public page
          </Button>
        ) : post ? (
          <p className="text-sm text-mute">
            Public URL opens after you click{" "}
            <span className="font-medium text-ink">Publish</span>.
          </p>
        ) : (
          <Link href="/admin/posts" className="text-sm text-mute hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
