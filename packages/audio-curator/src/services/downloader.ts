import ytDlp from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function downloadSource(url: string, workDir: string): Promise<string> {
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const tempId = randomUUID();
  const outputPath = path.join(workDir, `${tempId}_raw.mp3`);

  if (isYouTube) {
    console.log(`[Downloader] Téléchargement depuis YouTube: ${url}`);
    await ytDlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath,
      noPlaylist: true,
    });
    return outputPath;
  } else {
    console.log(`[Downloader] Téléchargement URL directe: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP lors du téléchargement: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return outputPath;
  }
}
