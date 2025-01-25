import { AudioAnalyzer } from './audioAnalyzer.js';
import { PhysicsEngine } from './physicsEngine.js';
import { Visualizer } from './visualizer.js';

class SoundPhysics {
  constructor() {
    this.container = document.getElementById('container');
    this.audioAnalyzer = new AudioAnalyzer();
    this.physicsEngine = new PhysicsEngine();
    this.visualizer = new Visualizer(this.container);
    
    this.setupEventListeners();
    this.animate = this.animate.bind(this);
    this.lastTime = 0;
    this.mode = 'frequency';
  }

  setupEventListeners() {
    const fileInput = document.getElementById('audio-upload');
    const startButton = document.getElementById('start-btn');
    const playPauseButton = document.getElementById('play-pause');
    const volumeControl = document.getElementById('volume');
    const modeSelect = document.getElementById('physics-mode');

    fileInput.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        startButton.disabled = false;
        this.audioFile = e.target.files[0];
      }
    });

    startButton.addEventListener('click', async () => {
      if (this.audioFile) {
        await this.initializeAudio(this.audioFile);
        document.getElementById('upload-overlay').classList.add('hidden');
        document.getElementById('controls').classList.remove('hidden');
      }
    });

    playPauseButton.addEventListener('click', () => {
      if (this.audioAnalyzer.isPlaying) {
        this.audioAnalyzer.pause();
        playPauseButton.textContent = 'Play';
      } else {
        this.audioAnalyzer.play();
        playPauseButton.textContent = 'Pause';
      }
    });

    volumeControl.addEventListener('input', (e) => {
      this.audioAnalyzer.setVolume(e.target.value);
    });

    modeSelect.addEventListener('change', (e) => {
      this.mode = e.target.value;
    });
  }

  async initializeAudio(file) {
    await this.audioAnalyzer.loadAudio(file);
    this.visualizer.createFrequencyVisuals(64);
    this.visualizer.createWaveformVisuals(64);
    this.audioAnalyzer.play();
    this.animate(0);
  }

  updatePhysics(frequencyData, waveformData) {
    const bodies = this.physicsEngine.bodies;
    
    frequencyData.forEach((value, i) => {
      if (i < bodies.length) {
        const normalizedValue = value / 255;
        const force = [0, normalizedValue * 50, 0];
        const position = bodies[i].position;
        this.physicsEngine.applyImpulse(bodies[i], force, [position.x, position.y, position.z]);
      }
    });
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    const frequencyData = this.audioAnalyzer.getFrequencyData();
    const waveformData = this.audioAnalyzer.getWaveformData();

    this.updatePhysics(frequencyData, waveformData);
    this.physicsEngine.update(deltaTime);

    if (this.mode === 'frequency' || this.mode === 'combined') {
      this.visualizer.updateFrequencyVisuals(frequencyData);
    }
    
    if (this.mode === 'waveform' || this.mode === 'combined') {
      this.visualizer.updateWaveformVisuals(waveformData);
    }

    this.visualizer.render();
  }
}

// Initialize the application
new SoundPhysics();