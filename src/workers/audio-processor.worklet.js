/**
 * AudioWorkletProcessor — capture micro dans le thread audio du navigateur.
 * Envoie des blocs Float32 vers le thread principal via port.postMessage.
 * AUCUN accès à PyAudio — 100% navigateur.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._buffer = []
    this._bufferSize = 4096   // ~256ms à 16kHz
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channel = input[0]
    for (let i = 0; i < channel.length; i++) {
      this._buffer.push(channel[i])
    }

    if (this._buffer.length >= this._bufferSize) {
      this.port.postMessage({ audioData: this._buffer.slice() })
      this._buffer = []
    }
    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
