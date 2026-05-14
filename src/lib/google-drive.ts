async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!res.ok) throw new Error(`Google OAuth error: ${data.error ?? res.status}`);
  return data.access_token!;
}

export async function copyTemplate(
  templateFileId: string,
  copyName: string
): Promise<{ driveFileId: string; driveUrl: string }> {
  const token = await getAccessToken();

  // Copy the file
  const copyRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${templateFileId}/copy?fields=id,webViewLink`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: copyName }),
    }
  );
  const copy = await copyRes.json() as { id?: string; webViewLink?: string; error?: unknown };
  if (!copyRes.ok) throw new Error(`Drive copy error: ${JSON.stringify(copy.error)}`);

  const driveFileId = copy.id!;
  const driveUrl = copy.webViewLink!;

  // Anyone with the link can edit
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveFileId}/permissions`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "anyone", role: "writer" }),
    }
  );
  if (!permRes.ok) {
    const err = await permRes.json() as unknown;
    throw new Error(`Drive permission error: ${JSON.stringify(err)}`);
  }

  return { driveFileId, driveUrl };
}
