import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

export async function uploadFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (STORAGE_PROVIDER === "r2") {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return `${process.env.R2_PUBLIC_BASE_URL}/${filename}`;
  }

  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/api/uploads/${filename}`;
}

export function isR2Storage(): boolean {
  return STORAGE_PROVIDER === "r2";
}
