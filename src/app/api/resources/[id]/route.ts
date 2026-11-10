import { NextResponse } from "next/server";
import { getAdminResource, mintResourceFileUrl } from "@/lib/resources";
import { getSession } from "@/lib/session";
import { hasMinRole } from "@/lib/roles";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const session = await getSession();
  if (!session || !hasMinRole(session.user.role, "member")) {
    return NextResponse.json({ error: "Members only." }, { status: 401 });
  }

  const { id } = await params;
  const resource = await getAdminResource(id);
  if (!resource) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (resource.url) {
    return NextResponse.redirect(resource.url);
  }

  if (!resource.publicId) {
    return NextResponse.json({ error: "No file attached." }, { status: 404 });
  }

  const url = await mintResourceFileUrl(resource.publicId);
  if (!url) {
    return NextResponse.json(
      { error: "Could not mint a download link." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(url);
}
