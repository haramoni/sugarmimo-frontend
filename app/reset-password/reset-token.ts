export function getResetToken(location: { hash: string; search: string }) {
  const fragmentToken = new URLSearchParams(location.hash.replace(/^#/, ""))
    .get("token")?.trim();
  const queryToken = new URLSearchParams(location.search).get("token")?.trim();

  return fragmentToken || queryToken || "";
}
