export class Visualizer {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    this.objects = {
      frequency: [],
      waveform: []
    };

    this.setupLighting();
    this.setupResizeHandler();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  createFrequencyVisuals(count) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (i - count/2) * 0.6;
      this.scene.add(mesh);
      this.objects.frequency.push(mesh);
    }
  }

  createWaveformVisuals(count) {
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = (i - count/2) * 0.6;
      this.scene.add(mesh);
      this.objects.waveform.push(mesh);
    }
  }

  updateFrequencyVisuals(frequencyData) {
    this.objects.frequency.forEach((mesh, i) => {
      const value = frequencyData[i] / 255;
      mesh.scale.y = 1 + value * 5;
      mesh.material.color.setHSL(value * 0.3, 0.8, 0.5);
    });
  }

  updateWaveformVisuals(waveformData) {
    this.objects.waveform.forEach((mesh, i) => {
      const value = (waveformData[i] - 128) / 128;
      mesh.position.y = value * 5;
      mesh.material.color.setHSL(Math.abs(value) * 0.3 + 0.6, 0.8, 0.5);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}