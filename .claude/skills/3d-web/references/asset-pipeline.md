# 3D Asset Pipeline (Blender → Web)

## Selecting assets
1. Does it express the product concept? If it is generic decoration, don't use it.
2. Licence allows use (CC0/CC-BY with credit). Record source + licence in the README.
3. Poly count and texture sizes fit the budget, or can be decimated/resized.
4. Style matches the UI (low-poly vs realistic vs abstract) — consistent across the scene.

## Blender export checklist
- Apply transforms (Ctrl+A → All Transforms); origin set sensibly; real-world scale (1 unit = 1 m).
- Clean topology; remove hidden/unused objects, modifiers applied; Decimate if too dense.
- PBR materials using Principled BSDF only (exports cleanly to glTF).
- Bake complex lighting/AO into textures for static scenes (Cycles bake → base colour / lightmap).
- Name meshes meaningfully (they become node names you reference in code).
- Export **glTF Binary (.glb)**, +Y up, include only selected, with animations if needed.

## Optimise (required)
```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp
# or KTX2 textures (best GPU memory):
npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress ktx2
npx @gltf-transform/cli inspect out.glb      # verify sizes, vertex counts
```
Then generate typed React components: `npx gltfjsx out.glb --types --transform` (creates an
optimised copy and a JSX component with named nodes).

## Loading in R3F
- Draco/Meshopt: drei `useGLTF(url)` handles Draco via its CDN decoder by default — host the
  decoder locally for offline demos (`useGLTF.setDecoderPath('/draco/')`).
- KTX2: configure `KTX2Loader` with the basis transcoder path hosted locally.
- Store models in `public/models/`, textures in `public/textures/`, HDRIs in `public/hdr/`.

## Targets
Hero model ≤ 1.5 MB compressed · HDRI ≤ 1 MB (1K–2K) · total 3D ≤ 3 MB · textures power-of-two.
