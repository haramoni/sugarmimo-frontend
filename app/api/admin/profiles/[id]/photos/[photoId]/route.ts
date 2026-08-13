import { forwardAdminRequest } from "../../../../_proxy";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await context.params;

  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`,
    { method: "DELETE" },
  );
}
