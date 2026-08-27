import { forwardAdminRequest } from "../../../../_proxy";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await context.params;
  const body = await request.text();

  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`,
    {
      method: "DELETE",
      body,
      headers: { "Content-Type": "application/json" },
    },
  );
}
