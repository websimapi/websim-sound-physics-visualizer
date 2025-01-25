export class AudioAnalyzer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = null;
    this.isPlaying = false;
  }

  async loadAudio(file) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    if (this.source) {
      this.source.disconnect();
    }
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    
    const gainNode = this.audioContext.createGain();
    this.gainNode = gainNode;
    
    this.source.connect(this.analyser);
    this.analyser.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    return this.source;
  }

  play() {
    if (this.source && !this.isPlaying) {
      this.source.start(0);
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.isPlaying = false;
    }
  }

  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getWaveformData() {
    this.analyser.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }
}