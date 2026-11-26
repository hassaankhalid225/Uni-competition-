"use client";

// Scroll-driven 3D story for the landing page. One fixed canvas sits behind the whole page; each
// page section (marked with data-scene="…") has a keyframe describing where the constellation
// should be and how it should look. As the visitor scrolls, the scene glides between keyframes:
//   hero      → clubs connected to the department hub
//   scattered → clubs drift apart and the threads disappear (the problem)
//   connected → everything snaps back together (the solution)
//   … and so on down the page.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, Line } from "@react-three/drei";
import * as THREE from "three";

export type SceneClub = { name: string; slug: string };

type Keyframe = {
  x: number;
  y: number;
  z: number;
  scale: number;
  spread: number; // how far clubs sit from the hub (1 = normal)
  threads: number; // visibility of the connecting threads, 0–1
  tilt: number; // rotation around X
  hub: number; // hub size
  labels: boolean;
};

const KEYFRAMES: Record<string, Keyframe> = {
  // Hidden while the physics stage owns the hero; it grows in for the next section.
  hero: { x: -3.6, y: -4, z: -4, scale: 0.001, spread: 1.65, threads: 0, tilt: 0.55, hub: 0.55, labels: false },
  intro: { x: -3.6, y: -4, z: -4, scale: 0.001, spread: 1.65, threads: 0, tilt: 0.55, hub: 0.55, labels: false },
  scattered: { x: -3.6, y: 0, z: 0, scale: 0.9, spread: 1.65, threads: 0, tilt: 0.55, hub: 0.55, labels: false },
  connected: { x: 0, y: -1.7, z: 0, scale: 1.05, spread: 1, threads: 1, tilt: 0.25, hub: 1.15, labels: true },
  platform: { x: 4.8, y: 2.8, z: -6, scale: 0.8, spread: 1.1, threads: 0.6, tilt: 0.35, hub: 0.9, labels: false },
  roles: { x: -4.6, y: 0, z: 0, scale: 0.8, spread: 0.85, threads: 1, tilt: 0.65, hub: 1, labels: false },
  clubs: { x: 0, y: 0, z: -3, scale: 1.2, spread: 1.5, threads: 0.45, tilt: 0.15, hub: 0.8, labels: false },
  team: { x: -4.4, y: -0.3, z: 0, scale: 0.85, spread: 1, threads: 1, tilt: 0.3, hub: 1, labels: false },
  finale: { x: 0, y: 2.6, z: -1, scale: 0.95, spread: 0.9, threads: 1, tilt: 0.2, hub: 1.3, labels: false },
};

/** On phones the scene stays centred and higher up, behind dimmed content. */
function forCompact(k: Keyframe): Keyframe {
  return { ...k, x: 0, y: k.y * 0.5 + 1.2, z: k.z - 2, labels: false };
}

const NUMERIC: (keyof Omit<Keyframe, "labels">)[] = ["x", "y", "z", "scale", "spread", "threads", "tilt", "hub"];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

const ACCENT = new THREE.Color("#d2643a");

function hueFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Follows <html data-theme>, which the theme toggle and the pre-paint script set. */
function useIsDark() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.dataset.theme === "dark");
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/** Colours that change with the theme: light threads on dark, ink threads on light paper. */
function palette(dark: boolean) {
  return {
    thread: new THREE.Color(dark ? "#f4eee6" : "#2a2d36"),
    dust: new THREE.Color(dark ? "#f4eee6" : "#3a3d48"),
    dustOpacity: dark ? 0.55 : 0.35,
    threadBoost: dark ? 1 : 1.6,
    nodeLightness: dark ? 0.72 : 0.62,
    blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
    label: dark
      ? "border-white/15 bg-black/60 text-white/80"
      : "border-black/10 bg-white/85 text-[#2a2d36] shadow-sm",
  };
}
type Palette = ReturnType<typeof palette>;

/** Soft round glow texture, generated once in a canvas (no image download). */
function useGlowTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

type Node = { club: SceneClub; position: THREE.Vector3; color: THREE.Color };

function layoutNodes(clubs: SceneClub[], lightness: number): Node[] {
  const n = Math.max(clubs.length, 1);
  return clubs.map((club, i) => {
    const angle = (i / n) * Math.PI * 2 + 0.4;
    const radius = 3.1 + (i % 2) * 0.9;
    const y = Math.sin(i * 1.7) * 1.1;
    const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    const color = new THREE.Color().setHSL(hueFor(club.slug) / 360, 0.55, lightness);
    return { club, position, color };
  });
}

function curveBetween(a: THREE.Vector3, b: THREE.Vector3, lift = 0.9) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
}

/** Live values shared by all scene parts, eased toward the scroll target every frame. */
type Live = Keyframe;
type LiveRef = React.RefObject<Live>;

function Pulse({ curve, color, speed, offset, size, glow, animate, live, blending }: { curve: THREE.Curve<THREE.Vector3>; color: THREE.Color; speed: number; offset: number; size: number; glow: THREE.Texture; animate: boolean; live: LiveRef; blending: THREE.Blending }) {
  const ref = useRef<THREE.Sprite>(null);
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = animate ? (clock.elapsedTime * speed + offset) % 1 : offset;
    curve.getPoint(t, point);
    ref.current.position.copy(point);
    const fade = Math.sin(t * Math.PI);
    // The parent orbit group is scaled by `spread`; divide so pulses keep their size.
    ref.current.scale.setScalar((size * (0.4 + fade)) / live.current.spread);
    (ref.current.material as THREE.SpriteMaterial).opacity = (0.25 + fade * 0.75) * live.current.threads;
  });
  return (
    <sprite ref={ref}>
      <spriteMaterial map={glow} color={color} transparent depthWrite={false} blending={blending} toneMapped={false} />
    </sprite>
  );
}

function Hub({ animate, live, pal }: { animate: boolean; live: LiveRef; pal: Palette }) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    const breathe = animate ? 1 + Math.sin(clock.elapsedTime * 1.6) * 0.035 : 1;
    core.current?.scale.setScalar(breathe * live.current.hub);
    shell.current?.scale.setScalar(1.45 * live.current.hub);
    if (animate && core.current) core.current.rotation.y += delta * 0.25;
    if (animate && shell.current) shell.current.rotation.y -= delta * 0.12;
  });
  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshPhysicalMaterial color={ACCENT} roughness={0.28} metalness={0.15} clearcoat={1} clearcoatRoughness={0.2} flatShading emissive={ACCENT} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial color={pal.thread} wireframe transparent opacity={0.12 * pal.threadBoost} />
      </mesh>
      <pointLight color={ACCENT} intensity={18} distance={9} decay={1.6} />
    </group>
  );
}

function ClubNode({ node, showLabel, live, labelClass }: { node: Node; showLabel: boolean; live: LiveRef; labelClass: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  // Counter the orbit's spread scale so spheres stay the same size while drifting apart.
  useFrame(() => mesh.current?.scale.setScalar(1 / live.current.spread));
  return (
    <group position={node.position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshPhysicalMaterial color={node.color} roughness={0.35} clearcoat={0.8} emissive={node.color} emissiveIntensity={0.18} />
      </mesh>
      {/* Always mounted and faded with CSS: unmounting drei's Html mid-frame can throw. */}
      <Html center position={[0, 0.58, 0]} zIndexRange={[1, 0]} style={{ pointerEvents: "none" }}>
        <span
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity duration-500 ${labelClass}`}
          style={{ opacity: showLabel ? 1 : 0 }}
        >
          {node.club.name}
        </span>
      </Html>
    </group>
  );
}

type FadeableLine = { material: THREE.Material & { opacity: number } };

function Thread({ curve, base, dashed, live, color }: { curve: THREE.Curve<THREE.Vector3>; base: number; dashed?: boolean; live: LiveRef; color: THREE.Color }) {
  const ref = useRef<FadeableLine>(null);
  const points = useMemo(() => curve.getPoints(40), [curve]);
  useFrame(() => {
    if (ref.current) ref.current.material.opacity = base * live.current.threads;
  });
  return (
    <Line
      ref={ref as unknown as React.Ref<never>}
      points={points}
      color={color}
      transparent
      opacity={base}
      lineWidth={1}
      dashed={dashed}
      dashSize={0.12}
      gapSize={0.1}
    />
  );
}

function Dust({ count, animate, color, opacity }: { count: number; animate: boolean; color: THREE.Color; opacity: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Seeded generator keeps the starfield identical on every render (pure render).
    let seed = 42;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + random() * 12;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (animate) ref.current.rotation.y += delta * 0.01;
    // Slight parallax against page scroll gives depth while the constellation moves.
    ref.current.position.y = (window.scrollY / window.innerHeight) * 0.35;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  );
}

type SectionMark = { key: string; top: number };

/** Measures where each data-scene section starts on the page. */
function useSectionMarks() {
  const marks = useRef<SectionMark[]>([]);
  useEffect(() => {
    const measure = () => {
      marks.current = [...document.querySelectorAll<HTMLElement>("[data-scene]")]
        .map((el) => ({ key: el.dataset.scene ?? "", top: el.getBoundingClientRect().top + window.scrollY }))
        .filter((m) => KEYFRAMES[m.key]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, []);
  return marks;
}

function Constellation({ clubs, animate, compact, dark }: { clubs: SceneClub[]; animate: boolean; compact: boolean; dark: boolean }) {
  const pal = useMemo(() => palette(dark), [dark]);
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  const marks = useSectionMarks();
  const live = useRef<Live>({ ...KEYFRAMES.hero });
  const [labels, setLabels] = useState(true);

  const nodes = useMemo(() => layoutNodes(clubs, pal.nodeLightness), [clubs, pal]);
  const hub = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const spokes = useMemo(() => nodes.map((n) => curveBetween(hub, n.position, 0.6)), [nodes, hub]);
  const rings = useMemo(() => nodes.map((n, i) => curveBetween(n.position, nodes[(i + 1) % nodes.length].position, 1.1)), [nodes]);

  useFrame(({ camera, pointer }, delta) => {
    // 1. Target pose from the scroll position: hold each section's pose, then glide to the next.
    const list = marks.current;
    const center = window.scrollY + window.innerHeight * 0.5;
    let target: Keyframe = { ...KEYFRAMES.hero };
    if (list.length) {
      let i = 0;
      while (i < list.length - 1 && center >= list[i + 1].top) i++;
      const last = i === list.length - 1;
      const fromKey = list[i].key;
      const toKey = list[last ? i : i + 1].key;
      const t = last ? 0 : smoothstep(0.45, 1, (center - list[i].top) / (list[i + 1].top - list[i].top));
      const from = KEYFRAMES[fromKey];
      const to = KEYFRAMES[toKey];
      for (const k of NUMERIC) target[k] = from[k] + (to[k] - from[k]) * t;
      const activeKey = t < 0.5 ? fromKey : toKey;
      target.labels = KEYFRAMES[activeKey].labels;
      if (compact) target = forCompact(target);
    } else if (compact) {
      target = forCompact(target);
    }
    if (target.labels !== labels) setLabels(target.labels);

    // 2. Ease live values toward the target (jump instantly when motion is reduced).
    const ease = animate ? 1 - Math.exp(-delta * 3.2) : 1;
    const v = live.current;
    for (const k of NUMERIC) v[k] += (target[k] - v[k]) * ease;

    // 3. Apply to the scene graph.
    root.current?.position.set(v.x, v.y, v.z);
    root.current?.scale.setScalar(v.scale);
    if (spin.current) {
      if (animate) spin.current.rotation.y += delta * 0.06;
      spin.current.rotation.x = v.tilt;
    }
    orbit.current?.scale.setScalar(v.spread);

    // 4. Gentle pointer parallax on the camera.
    const px = animate ? pointer.x * 0.6 : 0;
    const py = animate ? 1.2 + pointer.y * 0.4 : 1.2;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += (py - camera.position.y) * 0.04;
    camera.position.z = compact ? 15 : 13;
    camera.lookAt(0, 0.4, 0);
  });

  return (
    <>
      <group ref={root}>
        <group ref={spin}>
          <Hub animate={animate} live={live} pal={pal} />
          <group ref={orbit}>
            {nodes.map((n, i) => (
              <group key={n.club.slug}>
                <Thread curve={spokes[i]} base={0.22 * pal.threadBoost} live={live} color={pal.thread} />
                <Thread curve={rings[i]} base={0.08 * pal.threadBoost} dashed live={live} color={pal.thread} />
                <ClubNode node={n} showLabel={labels} live={live} labelClass={pal.label} />
                <Pulse curve={spokes[i]} color={ACCENT} speed={0.22} offset={i / nodes.length} size={0.55} glow={glow} animate={animate} live={live} blending={pal.blending} />
                <Pulse curve={rings[i]} color={n.color} speed={0.12} offset={(i * 0.37) % 1} size={0.35} glow={glow} animate={animate} live={live} blending={pal.blending} />
              </group>
            ))}
          </group>
        </group>
      </group>
      <Dust count={compact ? 300 : 800} animate={animate} color={pal.dust} opacity={pal.dustOpacity} />
    </>
  );
}

export default function ConstellationScene({ clubs }: { clubs: SceneClub[] }) {
  const reduced = usePrefersReducedMotion();
  const dark = useIsDark();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-50 md:opacity-100" aria-hidden>
      <Canvas
        frameloop="always"
        dpr={[1, compact ? 1.5 : 1.75]}
        camera={{ position: [0, 1.2, 13], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_45%,rgba(210,100,58,0.25),transparent_55%)]" />}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} />
        {/* Local studio lighting for reflections (no HDR download needed). */}
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 4, -6]} scale={[10, 3, 1]} />
          <Lightformer intensity={1} color="#d2643a" position={[-6, 0, 2]} scale={[3, 6, 1]} />
          <Lightformer intensity={0.8} position={[6, -2, 3]} scale={[3, 3, 1]} />
        </Environment>
        <Constellation clubs={clubs} animate={!reduced} compact={compact} dark={dark} />
      </Canvas>
    </div>
  );
}
