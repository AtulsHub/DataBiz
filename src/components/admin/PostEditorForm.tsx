"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPost, updatePost } from "@/app/actions/posts";
import type { ActionResult } from "@/app/actions/events";
import type { PostItem } from "@/lib/posts";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type Props = { post?: PostItem };

const initial: ActionResult = { ok: false };

export function PostEditorForm({ post }: Props) {
  const action = post ? updatePost.bind(null, post.id!) : createPost;
  const [state, formAction, pending] = useActionState(action, initial);

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
        <Field id="status" label="Status" required>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
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

      <Field id="body" label="Body (markdown)">
        <textarea
          id="body"
          name="body"
          rows={16}
          defaultValue={post?.body}
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

      <Field id="coverPublicId" label="Cover public id" hint="Optional Cloudinary public id">
        <input
          id="coverPublicId"
          name="coverPublicId"
          defaultValue={post?.coverPublicId}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : post ? "Save post" : "Create post"}
        </Button>
        {post ? (
          <Button href={`/blog/${post.slug}`} variant="ghost">
            View public page
          </Button>
        ) : (
          <Link href="/admin/posts" className="text-sm text-mute hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
