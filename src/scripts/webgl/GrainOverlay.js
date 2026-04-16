import * as THREE from 'three';
import grainFrag from './shaders/grain.frag?raw';

/**
 * Subtle film-grain overlay across the whole viewport.
 * Runs at ~20fps to keep GPU cost trivial.
 */
export class GrainOverlay {
  constructor(canvas) {
    this.canvas = canvas;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Single static frame.
      canvas.style.display = 'none';
      return;
    }

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(1); // DPR 1 intentional — cheaper and grainier
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position,1.0); }`,
      fragmentShader: grainFrag,
      uniforms: {
        uSeed: { value: 0 },
        uRes:  { value: new THREE.Vector2(innerWidth, innerHeight) },
      },
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), this.material);
    this.scene.add(this.mesh);

    this._onResize = this._onResize.bind(this);
    this._onResize();
    window.addEventListener('resize', this._onResize, { passive: true });

    this._throttle = 0;
    this._tick();
  }

  _onResize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.material.uniforms.uRes.value.set(innerWidth, innerHeight);
  }

  _tick = () => {
    requestAnimationFrame(this._tick);
    this._throttle++;
    if (this._throttle % 3 !== 0) return; // ~20fps at 60hz
    this.material.uniforms.uSeed.value = Math.random() * 1000;
    this.renderer.render(this.scene, this.camera);
  };
}
