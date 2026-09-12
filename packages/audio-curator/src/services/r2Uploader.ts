import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config.js';

const s3Client = new S3Client({
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export async function uploadAudio(filePath: string, fileName: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable pour upload : ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);
  const uploadKey = `audio/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: uploadKey,
    Body: fileStream,
    ContentType: 'audio/mpeg',
  });

  console.log(`[R2Uploader] Téléversement de ${fileName} vers Cloudflare R2...`);
  await s3Client.send(command);

  let pUrl = env.R2_PUBLIC_URL;
  if (pUrl.endsWith('/')) {
    pUrl = pUrl.slice(0, -1);
  }

  const finalUrl = `${pUrl}/audio/${fileName}`;
  console.log(`[R2Uploader] Succès. URL: ${finalUrl}`);
  return finalUrl;
}
