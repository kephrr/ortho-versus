import fs from 'node:fs'
import path from 'node:path'
import ffmpeg from 'fluent-ffmpeg'
import type { ProcessedAudioSegment } from '../types.js'

export class AudioProcessor {
  /**
   * Retrieves audio duration and format details using ffprobe.
   */
  async getAudioMetadata(filePath: string): Promise<{ duration: number; sampleRate: number; channels: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          return reject(new Error(`Erreur ffprobe sur ${filePath}: ${err.message}`))
        }

        const duration = metadata.format.duration || 0
        const audioStream = metadata.streams.find((s) => s.codec_type === 'audio')
        const sampleRate = audioStream?.sample_rate ? Number(audioStream.sample_rate) : 44100
        const channels = audioStream?.channels ? Number(audioStream.channels) : 2

        resolve({
          duration,
          sampleRate,
          channels,
        })
      })
    })
  }

  /**
   * Parses time offset input (e.g., "01:30", "00:02:15", or 90) into total seconds.
   */
  static parseTimeToSeconds(time: string | number | undefined): number {
    if (typeof time === 'number') return Math.max(0, time)
    if (!time) return 0

    const parts = time.trim().split(':').map(Number)
    if (parts.some(isNaN)) return 0

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    if (parts.length === 1) {
      return parts[0]
    }

    return 0
  }

  /**
   * Slices and normalizes audio segments using ffmpeg loudnorm and mono conversion.
   */
  async normalizeAndSegment(options: {
    inputPath: string
    outputDir: string
    startTime?: string | number
    segmentDuration?: number
    maxSegments?: number
    minDuration?: number
  }): Promise<ProcessedAudioSegment[]> {
    const {
      inputPath,
      outputDir,
      startTime,
      segmentDuration = 40,
      maxSegments = 1,
      minDuration = 30,
    } = options

    fs.mkdirSync(outputDir, { recursive: true })

    const metadata = await this.getAudioMetadata(inputPath)
    const totalDuration = metadata.duration

    if (totalDuration < minDuration) {
      throw new Error(
        `Audio source trop court : ${totalDuration.toFixed(1)}s (minimum requis : ${minDuration}s)`
      )
    }

    const segments: ProcessedAudioSegment[] = []
    const baseName = path.basename(inputPath, path.extname(inputPath))

    // Determine start offset
    const requestedStart = AudioProcessor.parseTimeToSeconds(startTime)

    // Calculate how many segments we can extract
    const calculatedSegments: Array<{ start: number; duration: number }> = []

    if (startTime !== undefined && startTime !== '') {
      // User specified exact start time
      const actualDuration = Math.min(segmentDuration, totalDuration - requestedStart)
      if (actualDuration >= minDuration) {
        calculatedSegments.push({ start: requestedStart, duration: actualDuration })
      }
    } else {
      // Auto-segmentation: skip initial 15s intro if source is longer than 60s
      let currentStart = totalDuration > 60 ? 15 : 0
      while (
        currentStart + segmentDuration <= totalDuration &&
        calculatedSegments.length < maxSegments
      ) {
        calculatedSegments.push({ start: currentStart, duration: segmentDuration })
        currentStart += segmentDuration + 5 // 5 seconds gap
      }

      // If no segment could be formed with default offset, try starting at 0
      if (calculatedSegments.length === 0 && totalDuration >= minDuration) {
        calculatedSegments.push({
          start: 0,
          duration: Math.min(segmentDuration, totalDuration),
        })
      }
    }

    if (calculatedSegments.length === 0) {
      throw new Error(
        `Impossible d'extraire des segments de durée suffisante (durée totale : ${totalDuration.toFixed(1)}s)`
      )
    }

    console.log(
      `[AudioProcessor] Traitement de ${calculatedSegments.length} segment(s) de ~${segmentDuration}s...`
    )

    for (let i = 0; i < calculatedSegments.length; i++) {
      const seg = calculatedSegments[i]
      const outFileName = `segment_${baseName}_${i + 1}_${Date.now()}.mp3`
      const outFilePath = path.join(outputDir, outFileName)

      await this.processSingleSegment({
        inputPath,
        outputPath: outFilePath,
        startSeconds: seg.start,
        durationSeconds: seg.duration,
      })

      // Verify produced file duration
      const segMeta = await this.getAudioMetadata(outFilePath)

      segments.push({
        segmentIndex: i + 1,
        filePath: outFilePath,
        startTimeSeconds: seg.start,
        durationSeconds: Math.round(segMeta.duration * 10) / 10,
      })
    }

    return segments
  }

  /**
   * Cuts and normalizes a single audio segment using ffmpeg loudnorm filter.
   */
  private async processSingleSegment(params: {
    inputPath: string
    outputPath: string
    startSeconds: number
    durationSeconds: number
  }): Promise<void> {
    const { inputPath, outputPath, startSeconds, durationSeconds } = params

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startSeconds)
        .setDuration(durationSeconds)
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .audioFrequency(44100)
        .audioChannels(1) // Mono for speech clarity
        .audioFilters([
          // EBU R128 loudness normalization for consistent volume across speech samples
          'loudnorm=I=-16:TP=-1.5:LRA=11',
        ])
        .output(outputPath)
        .on('end', () => {
          resolve()
        })
        .on('error', (err) => {
          reject(new Error(`Erreur ffmpeg lors du découpage: ${err.message}`))
        })
        .run()
    })
  }
}
