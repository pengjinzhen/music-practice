// onset-processor.js — AudioWorklet for onset detection
// This file runs in the AudioWorklet thread

class OnsetProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.frameSize = 1024
    this.hopSize = 512
    this.buffer = new Float32Array(this.frameSize)
    this.writeIndex = 0
    this.prevEnergy = 0
    this.threshold = 0.02
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channelData = input[0]
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.writeIndex] = channelData[i]
      this.writeIndex++
      if (this.writeIndex >= this.hopSize) {
        const energy = this.computeEnergy(this.buffer, this.writeIndex)
        const flux = energy - this.prevEnergy
        if (flux > this.threshold) {
          this.port.postMessage({
            type: 'onset',
            timestamp: currentTime,
            energy: energy,
          })
        }
        this.prevEnergy = energy
        this.writeIndex = 0
      }
    }
    return true
  }

  computeEnergy(buffer, length) {
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += buffer[i] * buffer[i]
    }
    return sum / length
  }
}

registerProcessor('onset-processor', OnsetProcessor)
