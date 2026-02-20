// pitch-processor.js — AudioWorklet for pitch detection buffering
// This file runs in the AudioWorklet thread

class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bufferSize = 2048
    this.buffer = new Float32Array(this.bufferSize)
    this.writeIndex = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channelData = input[0]
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.writeIndex] = channelData[i]
      this.writeIndex++
      if (this.writeIndex >= this.bufferSize) {
        this.port.postMessage({
          type: 'pitch-buffer',
          buffer: this.buffer.slice(),
          timestamp: currentTime,
        })
        this.writeIndex = 0
      }
    }
    return true
  }
}

registerProcessor('pitch-processor', PitchProcessor)
