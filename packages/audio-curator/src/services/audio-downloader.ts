import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { create as createYtDlp } from 'yt-dlp-exec'
import type { AudioSourceType, PodcastEpisodeInfo } from '../types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class AudioDownloader {
  private binPath: string | null = null

  /**
   * Detects the type of audio source based on URL or path.
   */
  static detectSourceType(input: string): AudioSourceType {
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(input)) {
      return 'YOUTUBE'
    }

    if (/\.(rss|xml)(\?.*)?$/i.test(input) || /feeds\./i.test(input) || /podcast/i.test(input)) {
      return 'PODCAST'
    }

    return 'DIRECT_FILE'
  }

  /**
   * Resolves or downloads the yt-dlp binary if needed.
   */
  async ensureYtDlpBinary(): Promise<string> {
    if (this.binPath && fs.existsSync(this.binPath)) {
      return this.binPath
    }

    // 1. Check system PATH
    try {
      const isWin = process.platform === 'win32'
      const checkCmd = isWin ? 'where yt-dlp' : 'which yt-dlp'
      const stdout = execSync(checkCmd, { stdio: 'pipe' }).toString().trim()
      const firstLine = stdout.split(/\r?\n/)[0]?.trim()
      if (firstLine && fs.existsSync(firstLine)) {
        this.binPath = firstLine
        return this.binPath
      }
    } catch {
      // Not in PATH, fallback to package bin
    }

    // 2. Check local package bin directory
    const isWindows = process.platform === 'win32'
    const binDir = path.resolve(__dirname, '../../bin')
    const exeName = isWindows ? 'yt-dlp.exe' : 'yt-dlp'
    const targetPath = path.join(binDir, exeName)

    if (fs.existsSync(targetPath)) {
      this.binPath = targetPath
      return this.binPath
    }

    // 3. Download standalone binary from official GitHub releases
    console.log(`[AudioDownloader] Téléchargement du binaire yt-dlp autonome dans ${targetPath}...`)
    fs.mkdirSync(binDir, { recursive: true })

    const downloadUrl = isWindows
      ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
      : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'

    const response = await fetch(downloadUrl, { redirect: 'follow' })
    if (!response.ok || !response.body) {
      throw new Error(
        `Impossible de télécharger yt-dlp depuis ${downloadUrl} (${response.status} ${response.statusText})`
      )
    }

    const fileStream = fs.createWriteStream(targetPath, { mode: 0o755 })
    const nodeReadable = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0])
    await finished(nodeReadable.pipe(fileStream))

    if (!isWindows) {
      fs.chmodSync(targetPath, 0o755)
    }

    console.log(`[AudioDownloader] Binaire yt-dlp installé avec succès : ${targetPath}`)
    this.binPath = targetPath
    return this.binPath
  }

  /**
   * Downloads audio from a YouTube video URL and exports it as MP3.
   */
  async downloadFromYouTube(url: string, outputDir: string): Promise<string> {
    const ytBinary = await this.ensureYtDlpBinary()
    fs.mkdirSync(outputDir, { recursive: true })

    const outputTemplate = path.join(outputDir, 'youtube_source_%(id)s.%(ext)s')

    console.log(`[AudioDownloader] Extraction audio YouTube en cours : ${url}`)
    const ytRunner = createYtDlp(ytBinary)

    await ytRunner(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0,
      output: outputTemplate,
      noPlaylist: true,
      noWarnings: true,
      preferFreeFormats: true,
    })

    // Find the generated mp3 file
    const files = fs.readdirSync(outputDir)
    const matchingFile = files.find((f) => f.startsWith('youtube_source_') && f.endsWith('.mp3'))

    if (!matchingFile) {
      throw new Error(`Échec de l'extraction YouTube : fichier audio introuvable dans ${outputDir}`)
    }

    const finalPath = path.join(outputDir, matchingFile)
    console.log(`[AudioDownloader] Audio YouTube téléchargé : ${finalPath}`)
    return finalPath
  }

  /**
   * Fetches and parses episodes from a Podcast RSS Feed.
   */
  async parsePodcastRss(feedUrl: string): Promise<PodcastEpisodeInfo[]> {
    console.log(`[AudioDownloader] Récupération du flux RSS Podcast : ${feedUrl}`)
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlablaTypeCurator/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du flux RSS (${response.status})`)
    }

    const xml = await response.text()
    const episodes: PodcastEpisodeInfo[] = []

    // Match <item>...</item> blocks
    const itemRegex = /<item[\s\S]*?<\/item>/gi
    const items = xml.match(itemRegex) || []

    for (const item of items) {
      const enclosureMatch = /<enclosure\s+[^>]*url=["']([^"']+)["'][^>]*>/i.exec(item)
      if (!enclosureMatch) continue

      const audioUrl = enclosureMatch[1]
      const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(item)
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(item)
      const durationMatch = /<itunes:duration>([\s\S]*?)<\/itunes:duration>/i.exec(item)

      episodes.push({
        title: titleMatch ? titleMatch[1].trim() : 'Épisode inconnu',
        audioUrl,
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : undefined,
        duration: durationMatch ? durationMatch[1].trim() : undefined,
      })
    }

    if (episodes.length === 0) {
      throw new Error(`Aucun épisode avec fichier audio trouvé dans le flux RSS : ${feedUrl}`)
    }

    console.log(`[AudioDownloader] ${episodes.length} épisodes trouvés dans le flux RSS`)
    return episodes
  }

  /**
   * Downloads a podcast episode from its RSS feed or audio URL.
   */
  async downloadFromPodcast(
    feedOrAudioUrl: string,
    outputDir: string,
    episodeIndex = 0
  ): Promise<{ audioPath: string; title: string }> {
    fs.mkdirSync(outputDir, { recursive: true })

    let audioUrl = feedOrAudioUrl
    let title = 'podcast_episode'

    // If it's a feed, pick episode
    if (/\.(rss|xml)(\?.*)?$/i.test(feedOrAudioUrl) || /feed/i.test(feedOrAudioUrl)) {
      const episodes = await this.parsePodcastRss(feedOrAudioUrl)
      const targetEpisode = episodes[episodeIndex] || episodes[0]
      audioUrl = targetEpisode.audioUrl
      title = targetEpisode.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
    }

    console.log(`[AudioDownloader] Téléchargement de l'audio podcast : ${audioUrl}`)
    const audioPath = await this.downloadDirectFile(audioUrl, outputDir, `podcast_${title}.mp3`)
    return { audioPath, title }
  }

  /**
   * Downloads an audio file from a direct URL or copies from local filesystem.
   */
  async downloadDirectFile(
    sourceUrlOrPath: string,
    outputDir: string,
    customFilename?: string
  ): Promise<string> {
    fs.mkdirSync(outputDir, { recursive: true })

    // Check if it's a local file path
    if (fs.existsSync(sourceUrlOrPath)) {
      const ext = path.extname(sourceUrlOrPath) || '.mp3'
      const destFilename = customFilename || `local_source_${Date.now()}${ext}`
      const destPath = path.join(outputDir, destFilename)
      fs.copyFileSync(sourceUrlOrPath, destPath)
      console.log(`[AudioDownloader] Fichier local copié : ${destPath}`)
      return destPath
    }

    // Remote HTTP/HTTPS URL
    const response = await fetch(sourceUrlOrPath, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlablaTypeCurator/1.0',
      },
      redirect: 'follow',
    })

    if (!response.ok || !response.body) {
      throw new Error(`Échec du téléchargement direct (${response.status} ${response.statusText})`)
    }

    const filename = customFilename || `source_${Date.now()}.mp3`
    const destPath = path.join(outputDir, filename)
    const fileStream = fs.createWriteStream(destPath)

    const nodeReadable = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0])
    await finished(nodeReadable.pipe(fileStream))

    console.log(`[AudioDownloader] Fichier audio distant téléchargé : ${destPath}`)
    return destPath
  }

  /**
   * Generic downloader dispatcher based on detected or specified source type.
   */
  async download(
    source: string,
    outputDir: string,
    type?: AudioSourceType
  ): Promise<{ audioPath: string; sourceType: AudioSourceType }> {
    const resolvedType = type || AudioDownloader.detectSourceType(source)

    switch (resolvedType) {
      case 'YOUTUBE': {
        const audioPath = await this.downloadFromYouTube(source, outputDir)
        return { audioPath, sourceType: 'YOUTUBE' }
      }
      case 'PODCAST': {
        const { audioPath } = await this.downloadFromPodcast(source, outputDir)
        return { audioPath, sourceType: 'PODCAST' }
      }
      case 'DIRECT_FILE':
      default: {
        const audioPath = await this.downloadDirectFile(source, outputDir)
        return { audioPath, sourceType: 'DIRECT_FILE' }
      }
    }
  }
}
