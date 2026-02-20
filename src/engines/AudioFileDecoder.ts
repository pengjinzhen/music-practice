export class AudioFileDecoder {
  /** Decode audio file (WAV/MP3/M4A/FLAC) to AudioBuffer */
  async decode(file: File, targetSampleRate: number = 44100): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer()
    const tempCtx = new AudioContext({ sampleRate: targetSampleRate })
    try {
      return await tempCtx.decodeAudioData(arrayBuffer)
    } finally {
      await tempCtx.close()
    }
  }

  /** Extract mono channel Float32Array from AudioBuffer */
  extractMono(buffer: AudioBuffer): Float32Array {
    if (buffer.numberOfChannels === 1) {
      return buffer.getChannelData(0)
    }
    // Mix down to mono
    const length = buffer.length
    const mono = new Float32Array(length)
    const channels = buffer.numberOfChannels
    for (let ch = 0; ch < channels; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        mono[i] += data[i] / channels
      }
    }
    return mono
  }

  /** Get supported audio MIME types */
  static getSupportedTypes(): string[] {
    return ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/flac', 'audio/x-m4a']
  }

  /** Check if file type is supported */
  static isSupported(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return ['wav', 'mp3', 'm4a', 'flac', 'mp4'].includes(ext || '')
  }
}
