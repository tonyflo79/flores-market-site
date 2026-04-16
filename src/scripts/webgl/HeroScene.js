import * as THREE from 'three';
import heroVert from './shaders/hero.vert?raw';
import heroFrag from './shaders/hero.frag?raw';

/**
 * HeroScene — full-bleed Three.js plane with sushi texture and cursor-driven
 * displacement shader. Replaces the <img> inside .hero__media once ready.
 */
export class HeroScene {
  constructor(container) {
    this.container = container;
    this.canvas    = container.querySelector('[data-hero-canvas]');
    if (!this.canvas) return;

    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene   = new THREE.Scene();
    this.camera  = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.clock   = new THREE.Clock();

    this.mouse       = new THREE.Vector2(0.5, 0.5);
    this.targetMouse = new THREE.Vector2(0.5, 0.5);
    this.intensity   = 0;

    this._onResize = this._onResize.bind(this);
    this._onPointer = this._onPointer.bind(this);
    this._onVisibility = this._onVisibility.bind(this);

    this._loadTexture();
  }

  _loadTexture() {
    const img = this.container.querySelector('.hero__media img');
    const src = img && img.currentSrc ? img.currentSrc : img && img.src;
    if (!src) return;

    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.texture = texture;
      this._buildMesh();
      this._start();
    });
  }

  _buildMesh() {
    const geom = new THREE.PlaneGeometry(2, 2);
    const { image } = this.texture;
    const imgAspect = new THREE.Vector2(image.width, image.height);

    this.material = new THREE.ShaderMaterial({
      vertexShader: heroVert,
      fragmentShader: heroFrag,
      uniforms: {
        uTexture:   { value: this.texture },
        uTime:      { value: 0 },
        uMouse:     { value: this.mouse },
        uIntensity: { value: 0 },
        uAspect:    { value: new THREE.Vector2(1, 1) },
        uImgAspect: { value: imgAspect },
      },
    });

    this.mesh = new THREE.Mesh(geom, this.material);
    this.scene.add(this.mesh);
  }

  _start() {
    // Fade the <img> fallback out so only the shader renders.
    const img = this.container.querySelector('.hero__media img');
    if (img) img.style.opacity = '0';
    const mediaAfter = this.container.querySelector('.hero__media');
    if (mediaAfter) mediaAfter.style.setProperty('--hide-gradient', '1');

    this._onResize();
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('pointermove', this._onPointer, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);

    this.canvas.style.opacity = '1';
    this._tick();
  }

  _onResize() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    this.renderer.setSize(w, h, false);
    this.material.uniforms.uAspect.value.set(w, h);
  }

  _onPointer(e) {
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    this.targetMouse.set(x, y);
    this.intensity = Math.min(this.intensity + 0.25, 1.0);
  }

  _onVisibility() {
    this._hidden = document.hidden;
  }

  _tick() {
    if (this._hidden) { requestAnimationFrame(() => this._tick()); return; }

    // Lerp mouse — slightly faster for spotlight responsiveness.
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.18;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.18;
    // Decay intensity toward idle
    this.intensity *= 0.93;

    const t = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = t;
    this.material.uniforms.uMouse.value.copy(this.mouse);
    this.material.uniforms.uIntensity.value = this.reduce ? 0 : this.intensity + 0.08; // always subtle breath

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._tick());
  }
}
