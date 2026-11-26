# Shaders, Particles & Effects

## Custom shader material (R3F + drei)
```tsx
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#4f7cff') },
  /* glsl */ `
    uniform float uTime; varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += sin(p.x * 3.0 + uTime) * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  /* glsl */ `
    uniform vec3 uColor; varying vec2 vUv;
    void main() { gl_FragColor = vec4(uColor * (0.6 + 0.4 * vUv.y), 1.0); }`
);
extend({ WaveMaterial });
// in component: useFrame((_, dt) => (ref.current.uTime += dt));
```
- Animate via uniforms, never by rebuilding materials.
- To extend built-in PBR materials keep lighting: `onBeforeCompile` or `three-custom-shader-material`.
- Noise: include simplex/perlin GLSL (e.g. from `lygia`) instead of hand-rolling.

## GPU particles
- `<points>` with a `BufferGeometry` of positions + a custom shader for size/fade; animate in the
  vertex shader using `uTime` and per-particle random attributes. 10k–100k particles is fine on
  desktop when the work is on the GPU.
- Morphing between shapes: store two position attributes, mix by a `uProgress` uniform driven by
  GSAP/scroll.
- For extreme counts or simulation: FBO/GPGPU (`GPUComputationRenderer`) — only if time allows.

## Post-processing (`@react-three/postprocessing`)
Bloom (selective, with `luminanceThreshold`), Vignette, Noise (subtle film grain), DepthOfField
(expensive), ChromaticAberration (very subtle or not at all). Keep total ≤ 3 effects.

## Transitions
- Section transitions: animate camera + uniform `uProgress` together on a GSAP timeline.
- Page transition with WebGL: a full-screen plane with a dissolve/noise shader masking between
  states; must not delay navigation > 600ms.

## Environment & reflections
- HDRIs from Poly Haven (1K–2K `.hdr`), or drei `<Environment>` with `<Lightformer>`s for a clean
  studio look (no download).
- `MeshReflectorMaterial` for glossy floors (cost: extra render — use with low resolution).
