---
name: 3d-web
description: Professional 3D web experiences with Three.js, React Three Fiber, Drei, WebGL and GLSL - scene composition, PBR materials, lighting and shadows, environment maps, camera controls, GLTF/GLB model pipeline from Blender, Draco/Meshopt/KTX2 compression, scroll-driven 3D, particles, custom shaders, post-processing, transitions and performance optimisation with fallbacks. Use when planning or building any 3D scene, hero visual, product viewer, data-in-3D visualisation or shader effect.
---

# Advanced 3D Web Development

3D earns its place only if it **communicates the product concept** better than 2D (spatial data,
a physical place/object, a process metaphor, a memorable hero that explains the idea). Decide in
`docs/project/10-3d-asset-plan.md` before building. References:
`references/performance.md`, `references/shaders-and-effects.md`, `references/asset-pipeline.md`.

## Stack
- **React projects:** `three` + `@react-three/fiber` + `@react-three/drei`
  (+ `@react-three/postprocessing` for effects, `@react-three/rapier` only if physics is needed).
  Match R3F's major version to React's (R3F v9 ↔ React 19).
- **Non-React:** vanilla Three.js with a small scene class (init / resize / tick / dispose).
- Animation: `useFrame` for continuous motion, GSAP for choreographed/scroll tweens, `maath`
  `easing.damp` for smooth follow behaviour.

## Scene architecture (R3F)
```tsx
<Canvas dpr={[1, 2]} camera={{ position: [0, 1.5, 6], fov: 40 }} shadows gl={{ antialias: true }}>
  <Suspense fallback={null}>
    <Environment preset="city" />           {/* or a custom small HDRI */}
    <Scene />                                {/* models + materials */}
    <ContactShadows opacity={0.4} blur={2.5} far={4} />
  </Suspense>
  <AdaptiveDpr pixelated />
  <PerformanceMonitor onDecline={() => setLowQuality(true)} />
</Canvas>
```
- Load the Canvas with `next/dynamic` (`ssr: false`) or `React.lazy`; show a poster image first.
- Keep DOM text outside the canvas (accessibility + SEO + LCP). Use drei `<Html>` sparingly.
- Pause rendering when off-screen (`frameloop="demand"` + `invalidate()`, or IntersectionObserver).

## Lighting & materials (realism checklist)
- Image-based lighting (`<Environment>`) as the base; one key directional light for shadows;
  optional rim light. `toneMapping` ACESFilmic/AgX (default in recent three), sRGB output.
- `MeshStandardMaterial`/`MeshPhysicalMaterial` with roughness/metalness maps; physical for
  glass (`transmission`), clearcoat, sheen. Use drei `MeshTransmissionMaterial` for premium glass
  (expensive — one object max).
- Shadows: baked into textures (best), `ContactShadows`/`AccumulativeShadows` (cheap and soft),
  real-time shadow maps only for 1–2 lights with tight shadow camera bounds.
- Colour harmony with the UI palette: tint environment and materials to the brand.

## Camera & interaction
- Restrained controls: `OrbitControls` with limits (polar/azimuth/zoom, `enablePan={false}`),
  or `PresentationControls` for product spins, or camera rigs driven by scroll/pointer.
- Scroll-driven: drei `ScrollControls` + `useScroll()`, or GSAP ScrollTrigger animating camera
  position/target with damping. Always keep text readable over the scene.
- Pointer parallax: small damped camera offset (±0.2 units). Raycast hover with cursor change.

## Common hackathon-worthy uses
- Hero metaphor scene (e.g. campus/building model, nodes connecting, objects assembling).
- Interactive spatial map (rooms, floors, seats, warehouse slots) with clickable entities bound to
  real DB data.
- Data sculpture: instanced bars/points showing real metrics.
- Product/object configurator.
- Particle field transition between sections (GPU, shader-driven).

## Assets
Sources: own Blender models, Poly Haven (CC0 HDRIs/textures/models), Sketchfab (check licence),
Kenney (CC0 low-poly), Quaternius. Credit licences in the README. Pipeline in
`references/asset-pipeline.md` — always compress (gltf-transform), target < 2–3 MB total.

## Performance budget (desktop / mobile)
Draw calls < 100 / < 50 · triangles < 500k / < 150k · textures ≤ 2K (1K mobile), KTX2 ·
total 3D payload < 3 MB · 60fps on a mid laptop, ≥ 30fps on mid phone. Details in
`references/performance.md`.

## Fallbacks & accessibility
- Detect WebGL failure → static image. `prefers-reduced-motion` → no auto-rotation/scroll camera.
- The 3D never carries information that isn't also available in the DOM.
- Dispose geometries/materials/textures on unmount in vanilla Three (R3F does it automatically
  for declarative objects).

## Done criteria
Visual reviewed on screenshots, fps measured (r3f-perf or `stats-gl`), mobile tested at 390px,
fallback verified, payload size measured.
