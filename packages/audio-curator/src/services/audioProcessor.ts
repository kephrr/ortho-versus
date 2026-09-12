import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { randomUUID } from 'crypto';

export async function getSilences(audioPath: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const silences: number[] = [];
    ffmpeg(audioPath)
      .audioFilters('silencedetect=n=-30dB:d=0.4')
      .format('null')
      .on('stderr', (line: string) => {
        const match = line.match(/silence_start: (\d+\.?\d*)/);
        if (match) {
          silences.push(parseFloat(match[1]));
        }
      })
      .on('end', () => resolve(silences))
      .on('error', reject)
      .output('NUL')
      .run();
  });
}

export async function sliceAndNormalize(rawAudioPath: string, targetDuration: number, outputDir: string): Promise<string[]> {
  console.log(`[AudioProcessor] Analyse des silences pour ${rawAudioPath}...`);
  const silences = await getSilences(rawAudioPath);
  
  if (silences.length === 0) {
    console.warn("[AudioProcessor] Aucun silence détecté, utilisation de découpes strictes.");
  }

  const totalDuration = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(rawAudioPath, (err: Error | null, data: ffmpeg.FfprobeData) => {
      if (err) return reject(err);
      if (!data.format.duration) {
        return reject(new Error('Impossible de déterminer la durée du fichier audio'));
      }
      resolve(data.format.duration);
    });
  });

  const segments: { start: number; end: number }[] = [];
  let currentStart = 0;
  
  while (currentStart < totalDuration - 45) { // min tail
    let idealEnd = currentStart + targetDuration;
    if (idealEnd > totalDuration) idealEnd = totalDuration;

    let bestEnd = idealEnd;
    if (silences.length > 0) {
      let closestDistance = Infinity;
      for (const silence of silences) {
        if (silence > currentStart + 45 && silence < currentStart + 90) {
          const distance = Math.abs(silence - idealEnd);
          if (distance < closestDistance) {
            closestDistance = distance;
            bestEnd = silence;
          }
        }
      }
    }

    if (bestEnd - currentStart < 45 || bestEnd - currentStart > 90) {
      bestEnd = idealEnd > totalDuration ? totalDuration : currentStart + targetDuration;
    }

    segments.push({ start: currentStart, end: bestEnd });
    currentStart = bestEnd;
    
    if (currentStart >= totalDuration) break;
  }

  const outputFiles: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const { start, end } = segments[i];
    const duration = end - start;
    if (duration < 45 || duration > 90) {
      continue;
    }
    
    const outPath = path.join(outputDir, `${randomUUID()}_seg${i}.mp3`);
    console.log(`[AudioProcessor] Extraction du segment ${i} (${start}s -> ${end}s)...`);
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(rawAudioPath)
        .setStartTime(start)
        .setDuration(duration)
        .audioChannels(1)
        .audioBitrate('128k')
        .audioFilters('loudnorm')
        .save(outPath)
        .on('end', () => resolve())
        .on('error', reject);
    });

    outputFiles.push(outPath);
  }

  return outputFiles;
}
