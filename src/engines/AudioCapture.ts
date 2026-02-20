export interface AudioCaptureOptions {
  sampleRate?: number
  bufferSize?: number
  channelCount?: number
}

const DEFAULT_OPTIONS: Required<AudioCaptureOptions> = {
  sampleRate: 44100,
  bufferSize: 2048,
  channelCount: 1,
}

export class AudioCapture {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private analyserNode: AnalyserNode | null = null
  private workletNode: AudioWorkletNode | null = null
  private options: Required<AudioCaptureOptions>
  private _isCapturing = false

  constructor(options?: AudioCaptureOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  get isCapturing(): boolean {
    return this._isCapturing
  }

  get audioContext(): AudioContext | null {
    return this.context
  }

  get analyser(): AnalyserNode | null {
    return this.analyserNode
  }

  get source(): MediaStreamAudioSourceNode | null {
    return this.sourceNode
  }

  async start(): Promise<void> {
    if (this._isCapturing) return

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: this.options.sampleRate,
        channelCount: this.options.channelCount,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    this.context = new AudioContext({ sampleRate: this.options.sampleRate })
    this.sourceNode = this.context.createMediaStreamSource(this.stream)

    this.analyserNode = this.context.createAnalyser()
    this.analyserNode.fftSize = this.options.bufferSize * 2
    this.analyserNode.smoothingTimeConstant = 0.8
    this.sourceNode.connect(this.analyserNode)

    this._isCapturing = true
  }

  async connectWorklet(processorUrl: string, processorName: string): Promise<AudioWorkletNode> {
    if (!this.context || !this.sourceNode) {
      throw new Error('AudioCapture not started')
    }
    await this.context.audioWorklet.addModule(processorUrl)
    this.workletNode = new AudioWorkletNode(this.context, processorName)
    this.sourceNode.connect(this.workletNode)
    return this.workletNode
  }

  getAudioLevel(): number {
    if (!this.analyserNode) return 0
    const data = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128
      sum += v * v
    }
    return Math.sqrt(sum / data.length)
  }

  stop(): void {
    this._isCapturing = false
    this.workletNode?.disconnect()
    this.workletNode = null
    this.analyserNode?.disconnect()
    this.analyserNode = null
    this.sourceNode?.disconnect()
    this.sourceNode = null
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.context?.close()
    this.context = null
  }
}