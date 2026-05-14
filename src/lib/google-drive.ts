import { google } from "googleapis";

function getDrive() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth });
}

export async function copyTemplate(
  templateFileId: string,
  copyName: string
): Promise<{ driveFileId: string; driveUrl: string }> {
  const drive = getDrive();

  const copy = await drive.files.copy({
    fileId: templateFileId,
    requestBody: { name: copyName },
    fields: "id,webViewLink",
  });

  const driveFileId = copy.data.id!;
  const driveUrl = copy.data.webViewLink!;

  // Anyone with the link can edit (Option A)
  await drive.permissions.create({
    fileId: driveFileId,
    requestBody: { type: "anyone", role: "writer" },
  });

  return { driveFileId, driveUrl };
}
