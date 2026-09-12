import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config.js';

const execAsync = promisify(exec);

export async function transcribe(audioFilePath: string): Promise<{ rawText: string; duration: number }> {
  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Fichier audio introuvable : ${audioFilePath}`);
  }

  const outputDir = path.dirname(audioFilePath);
  const baseName = path.basename(audioFilePath, path.extname(audioFilePath));
  
  const cmd = `${env.WHISPER_CMD} "${audioFilePath}" --language fr --model ${env.WHISPER_MODEL} --output_format json --output_dir "${outputDir}"`;
  
  console.log(`[LocalWhisper] Exécution de: ${cmd}`);
  await execAsync(cmd);
  
  const jsonFile = path.join(outputDir, `${baseName}.json`);
  if (!fs.existsSync(jsonFile)) {
    throw new Error("Le fichier de sortie JSON de Whisper n'a pas été généré.");
  }
  
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  const rawText = data.text ? data.text.trim() : '';
  let duration = 0;
  if (data.segments && data.segments.length > 0) {
    duration = data.segments[data.segments.length - 1].end;
  }
  
  return { rawText, duration };
}
