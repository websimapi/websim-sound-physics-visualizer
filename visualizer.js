export class Visualizer {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 15, 30);
    this.camera.lookAt(0, 0, 0);

    // Add orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.objects = {
      frequency: [],
      waveform: [],
      environment: []
    };

    this.setupEnvironment();
    this.setupLighting();
    this.setupResizeHandler();
  }

  setupEnvironment() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add environment walls
    const wallGeometry = new THREE.PlaneGeometry(100, 20);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -50;
    backWall.position.y = 10;
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Create pillars that will react to music
    for (let i = 0; i < 8; i++) {
      const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
      const pillarMaterial = new THREE.MeshPhongMaterial({
        color: 0x666666,
        shininess: 100
      });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(-20 + i * 6, 5, -20);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.objects.environment.push(pillar);
      this.scene.add(pillar);
    }

    // Add decorative spheres
    for (let i = 0; i < 12; i++) {
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        shininess: 80
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(-25 + i * 5, 1, -10);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      this.objects.environment.push(sphere);
      this.scene.add(sphere);
    }
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Add point lights that react to music
    this.pointLights = [];
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff];
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(colors[i], 0.5, 20);
      light.position.set(-15 + i * 10, 8, -15);
      this.pointLights.push(light);
      this.scene.add(light);
    }
  }

  createFrequencyVisuals(count) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (i - count/2) * 0.6;
      mesh.position.z = -5;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.objects.frequency.push(mesh);
    }
  }

  createWaveformVisuals(count) {
    const geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (i - count/2) * 0.6;
      mesh.position.z = 5;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.objects.waveform.push(mesh);
    }
  }

  updateFrequencyVisuals(frequencyData) {
    this.objects.frequency.forEach((mesh, i) => {
      const value = frequencyData[i] / 255;
      mesh.scale.y = 1 + value * 5;
      mesh.position.y = mesh.scale.y / 2;
      mesh.material.color.setHSL(value * 0.3, 0.8, 0.5);
      mesh.rotation.y += value * 0.1;
    });

    // Update environment based on frequency
    this.objects.environment.forEach((obj, i) => {
      const value = frequencyData[i % frequencyData.length] / 255;
      if (obj.geometry.type === 'CylinderGeometry') {
        obj.scale.y = 1 + value * 2;
        obj.position.y = 5 * obj.scale.y / 2;
      } else {
        obj.position.y = 1 + value * 5;
      }
    });

    // Update point lights
    this.pointLights.forEach((light, i) => {
      const value = frequencyData[i * 16] / 255;
      light.intensity = 0.5 + value * 2;
    });
  }

  updateWaveformVisuals(waveformData) {
    this.objects.waveform.forEach((mesh, i) => {
      const value = (waveformData[i] - 128) / 128;
      mesh.position.y = value * 5 + 3;
      mesh.rotation.x += 0.02;
      mesh.rotation.y += 0.01;
      mesh.material.color.setHSL(Math.abs(value) * 0.3 + 0.6, 0.8, 0.5);
    });
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}