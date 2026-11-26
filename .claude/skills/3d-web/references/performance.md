# 3D Performance Playbook

## Measure first
- `r3f-perf` (`<Perf position="top-left" />`) in dev, or `stats-gl`. Watch FPS, draw calls,
  triangles, GPU time, memory.
- `renderer.info` (`gl.info` in R3F) for calls/triangles/textures.
- Test with Chrome DevTools CPU throttling and on a real phone if available.

## Biggest wins (in order)
1. **Compress assets** — Draco/Meshopt geometry, KTX2 (Basis) textures, resize to ≤ 2K.
2. **Reduce draw calls** — merge static meshes in Blender, use `InstancedMesh` / drei
   `<Instances>` / `<Merged>` for repeated objects, share materials.
3. **Limit DPR** — `dpr={[1, 1.5]}` on mobile; `<AdaptiveDpr>` + `<PerformanceMonitor>` to
   downgrade quality automatically.
4. **Cheap lighting** — bake lighting/AO in Blender; prefer environment lighting over many
   dynamic lights; at most 1 shadow-casting light.
5. **Render on demand** — `frameloop="demand"` for static scenes; stop the loop off-screen.
6. **LOD** — drei `<Detailed>` for heavy models; simpler geometry on mobile.
7. **Post-processing restraint** — each pass costs a full-screen render; keep to 1–3 effects
   (e.g. bloom + vignette), disable on low-tier devices.

## React-specific
- Never `setState` inside `useFrame`; mutate refs.
- Don't create objects (`new Vector3()`) per frame; reuse.
- `useGLTF.preload(url)` and `useTexture.preload(url)` for critical assets.
- Memoise geometries/materials; avoid re-creating them on re-render.

## Loading UX
- Show the DOM content + a poster immediately; fade in the canvas when ready
  (drei `useProgress` for a subtle progress indicator, never a blocking full-screen loader > 1.5s).

## Mobile
- Reduce particles/instances by 50–75%, disable shadows/post-processing, lower DPR, consider a
  pre-rendered video/image instead of live 3D on very low-end devices.
