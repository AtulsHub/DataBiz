/**
 * Re-upload all Neon-referenced Cloudinary assets into the current cloud,
 * preserving public_ids where possible and rewriting full URLs in post bodies.
 *
 * Usage: node scripts/migrate-cloudinary.mjs
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

config({ path: ".env.local" });

const OLD_CLOUDS = ["dek7i9kwx", "dvil2pqgj"];
const NEW_CLOUD = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^"|"$/g, "").trim();
const API_KEY = process.env.CLOUDINARY_API_KEY?.replace(/^"|"$/g, "").trim();
const API_SECRET = process.env.CLOUDINARY_API_SECRET?.replace(/^"|"$/g, "").trim();

if (!NEW_CLOUD || !API_KEY || !API_SECRET) {
  throw new Error("Missing Cloudinary env vars in .env.local");
}

cloudinary.config({
  cloud_name: NEW_CLOUD,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const sql = neon(process.env.DATABASE_URL);

function parseCloudinaryUrl(url) {
  const match = String(url).match(
    /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.(jpg|jpeg|png|webp|gif|svg|pdf))?$/i,
  );
  if (!match) return null;
  return {
    cloud: match[1],
    resourceType: match[2],
    publicId: match[3],
    format: match[4]?.toLowerCase(),
    url,
  };
}

function candidateUrls(publicIdOrUrl) {
  if (/^https?:\/\//i.test(publicIdOrUrl)) return [publicIdOrUrl];

  const urls = [];
  for (const cloud of OLD_CLOUDS) {
    urls.push(`https://res.cloudinary.com/${cloud}/image/upload/${publicIdOrUrl}`);
    urls.push(`https://res.cloudinary.com/${cloud}/image/upload/${publicIdOrUrl}.jpg`);
    urls.push(`https://res.cloudinary.com/${cloud}/image/upload/${publicIdOrUrl}.png`);
    urls.push(`https://res.cloudinary.com/${cloud}/image/upload/${publicIdOrUrl}.webp`);
  }
  return urls;
}

async function fetchFirstWorking(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 32) continue;
      const contentType = response.headers.get("content-type") || "";
      return { url, buffer, contentType };
    } catch {
      // try next
    }
  }
  return null;
}

async function uploadBuffer(buffer, publicId, contentType) {
  const dataUri = `data:${contentType || "image/jpeg"};base64,${buffer.toString("base64")}`;
  return cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
}

async function migrateAsset(label, publicIdOrUrl) {
  const parsed = /^https?:\/\//i.test(publicIdOrUrl)
    ? parseCloudinaryUrl(publicIdOrUrl)
    : null;
  const targetPublicId = parsed?.publicId || publicIdOrUrl;

  // Skip if already on the new cloud as a full URL.
  if (parsed?.cloud === NEW_CLOUD) {
    return { ok: true, skipped: true, publicId: targetPublicId, source: publicIdOrUrl };
  }

  const found = await fetchFirstWorking(candidateUrls(publicIdOrUrl));
  if (!found) {
    return { ok: false, publicId: targetPublicId, error: "Could not download from old cloud(s)" };
  }

  try {
    const uploaded = await uploadBuffer(
      found.buffer,
      targetPublicId,
      found.contentType,
    );
    return {
      ok: true,
      publicId: uploaded.public_id,
      source: found.url,
      secureUrl: uploaded.secure_url,
    };
  } catch (error) {
    return {
      ok: false,
      publicId: targetPublicId,
      error: error?.message || String(error),
      source: found.url,
    };
  }
}

const results = [];

const events = await sql`
  select id, slug, poster_public_id
  from events
  where poster_public_id is not null
`;
for (const event of events) {
  const result = await migrateAsset(`event:${event.slug}`, event.poster_public_id);
  results.push({ kind: "event", id: event.id, slug: event.slug, ...result });
  if (result.ok && result.publicId && event.poster_public_id !== result.publicId) {
    await sql`update events set poster_public_id = ${result.publicId} where id = ${event.id}`;
  }
}

const posts = await sql`select id, slug, cover_public_id, body from posts`;
for (const post of posts) {
  if (post.cover_public_id) {
    const result = await migrateAsset(`post-cover:${post.slug}`, post.cover_public_id);
    results.push({ kind: "post-cover", id: post.id, slug: post.slug, ...result });
    if (result.ok && result.publicId && post.cover_public_id !== result.publicId) {
      await sql`update posts set cover_public_id = ${result.publicId} where id = ${post.id}`;
    }
  }

  let body = String(post.body || "");
  const urls = [...body.matchAll(/https?:\/\/res\.cloudinary\.com\/[^)\s"']+/g)].map(
    (m) => m[0],
  );
  let changed = false;
  for (const url of urls) {
    const result = await migrateAsset(`post-body:${post.slug}`, url);
    results.push({ kind: "post-body", id: post.id, slug: post.slug, ...result });
    if (result.ok && result.secureUrl) {
      body = body.split(url).join(result.secureUrl);
      changed = true;
    } else if (result.ok && result.publicId) {
      const next = `https://res.cloudinary.com/${NEW_CLOUD}/image/upload/${result.publicId}`;
      body = body.split(url).join(next);
      changed = true;
    }
  }
  if (changed) {
    await sql`update posts set body = ${body} where id = ${post.id}`;
  }
}

const photos = await sql`select id, public_id from event_photos`;
for (const photo of photos) {
  const result = await migrateAsset(`gallery:${photo.id}`, photo.public_id);
  results.push({ kind: "gallery", id: photo.id, ...result });
  if (result.ok && result.publicId && photo.public_id !== result.publicId) {
    await sql`update event_photos set public_id = ${result.publicId} where id = ${photo.id}`;
  }
}

const alumni = await sql`
  select id, name, photo_public_id
  from alumni_profiles
  where photo_public_id is not null
`;
for (const person of alumni) {
  const result = await migrateAsset(`alumni:${person.name}`, person.photo_public_id);
  results.push({ kind: "alumni", id: person.id, ...result });
  if (result.ok && result.publicId && person.photo_public_id !== result.publicId) {
    await sql`update alumni_profiles set photo_public_id = ${result.publicId} where id = ${person.id}`;
  }
}

const team = await sql`
  select id, name, photo_public_id
  from team_members
  where photo_public_id is not null
`;
for (const person of team) {
  const result = await migrateAsset(`team:${person.name}`, person.photo_public_id);
  results.push({ kind: "team", id: person.id, ...result });
  if (result.ok && result.publicId && person.photo_public_id !== result.publicId) {
    await sql`update team_members set photo_public_id = ${result.publicId} where id = ${person.id}`;
  }
}

const ok = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);

console.log(
  JSON.stringify(
    {
      cloud: NEW_CLOUD,
      migrated: ok,
      failed: failed.length,
      results,
    },
    null,
    2,
  ),
);

if (failed.length > 0) {
  process.exitCode = 1;
}
