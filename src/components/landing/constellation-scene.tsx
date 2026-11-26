"use client";

// The landing hero's 3D scene: the CS department as a central hub, the real clubs from the
// database orbiting it, connected by threads. Bright pulses travel from the hub to every club
// (official announcements reaching everyone); dimmer pulses move between clubs (discussions).
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, Line } from "@react-three/drei";
import * as THREE from "three";

export type SceneClub = { name: string; slug: string };

const ACCENT = new THREE.Color("#d2643a");
const THREAD = new THREE.Color("#f4eee6");

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

function layoutNodes(clubs: SceneClub[]): Node[] {
  const n = Math.max(clubs.length, 1);
  return clubs.map((club, i) => {
    const angle = (i / n) * Math.PI * 2 + 0.4;
    const radius = 3.1 + (i % 2) * 0.9;
    const y = Math.sin(i * 1.7) * 1.1;
    const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    const color = new THREE.Color().setHSL(hueFor(club.slug) / 360, 0.55, 0.72);
    return { club, position, color };
  });
}

function curveBetween(a: THREE.Vector3, b: THREE.Vector3, lift = 0.9) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
}

function Pulse({ curve, color, speed, offset, size, glow, animate }: { curve: THREE.Curve<THREE.Vector3>; color: THREE.Color; speed: number; offset: number; size: number; glow: THREE.Texture; animate: boolean }) {
  const ref = useRef<THREE.Sprite>(null);
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = animate ? (clock.elapsedTime * speed + offset) % 1 : offset;
    curve.getPoint(t, point);
    ref.current.position.copy(point);
    const fade = Math.sin(t * Math.PI); // fade in at the start, out at the end
    ref.current.scale.setScalar(size * (0.4 + fade));
    (ref.current.material as THREE.SpriteMaterial).opacity = 0.25 + fade * 0.75;
  });
  return (
    <sprite ref={ref}>
      <spriteMaterial map={glow} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

function Hub({ animate }: { animate: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    if (!animate) return;
    const s = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.035;
    core.current?.scale.setScalar(s);
    if (core.current) core.current.rotation.y += delta * 0.25;
    if (shell.current) shell.current.rotation.y -= delta * 0.12;
  });
  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshPhysicalMaterial color={ACCENT} roughness={0.28} metalness={0.15} clearcoat={1} clearcoatRoughness={0.2} flatShading emissive={ACCENT} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={shell} scale={1.45}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial color={THREAD} wireframe transparent opacity={0.12} />
      </mesh>
      <pointLight color={ACCENT} intensity={18} distance={9} decay={1.6} />
    </group>
  );
}

function ClubNode({ node, showLabel }: { node: Node; showLabel: boolean }) {
  return (
    <group position={node.position}>
      <mesh>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshPhysicalMaterial color={node.color} roughness={0.35} clearcoat={0.8} emissive={node.color} emissiveIntensity={0.18} />
      </mesh>
      {showLabel && (
        <Html center position={[0, 0.58, 0]} zIndexRange={[1, 0]} style={{ pointerEvents: "none" }}>
          <span className="whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-medium text-white/80">
            {node.club.name}
          </span>
        </Html>
      )}
    </group>
  );
}

function Dust({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Seeded generator keeps the starfield identical on every render (pure render).
    let seed = 42;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + random() * 9;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);
  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y += delta * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={THREAD} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Constellation({ clubs, animate, compact }: { clubs: SceneClub[]; animate: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  const nodes = useMemo(() => layoutNodes(clubs), [clubs]);
  const hub = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const spokes = useMemo(() => nodes.map((n) => curveBetween(hub, n.position, 0.6)), [nodes, hub]);
  const rings = useMemo(
    () => nodes.map((n, i) => curveBetween(n.position, nodes[(i + 1) % nodes.length].position, 1.1)),
    [nodes],
  );
  const baseZ = compact ? 14 : 13;

  useFrame(({ camera, pointer }, delta) => {
    // Scroll progress through the hero (0 → 1) drives a gentle dolly and turn.
    const progress = Math.min(window.scrollY / window.innerHeight, 1);
    if (group.current) {
      if (animate) group.current.rotation.y += delta * 0.06;
      group.current.rotation.x = 0.18 + progress * 0.35;
      group.current.position.y = progress * 1.5;
    }
    const targetX = animate ? pointer.x * 0.8 : 0;
    const targetY = animate ? 1.2 + pointer.y * 0.5 : 1.2;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (baseZ + progress * 3 - camera.position.z) * 0.06;
    camera.lookAt(0, 0.6, 0);
  });

  return (
    <group position={compact ? [0, 3.4, 0] : [3.1, -0.1, 0]}>
    <group ref={group}>
      <Hub animate={animate} />
      {nodes.map((n, i) => (
        <group key={n.club.slug}>
          <Line points={spokes[i].getPoints(40)} color={THREAD} transparent opacity={0.22} lineWidth={1} />
          <Line points={rings[i].getPoints(40)} color={THREAD} transparent opacity={0.08} lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />
          <ClubNode node={n} showLabel={!compact} />
          <Pulse curve={spokes[i]} color={ACCENT} speed={0.22} offset={i / nodes.length} size={0.55} glow={glow} animate={animate} />
          <Pulse curve={rings[i]} color={n.color} speed={0.12} offset={(i * 0.37) % 1} size={0.35} glow={glow} animate={animate} />
        </group>
      ))}
      <Dust count={compact ? 250 : 600} animate={animate} />
    </group>
    </group>
  );
}

export default function ConstellationScene({ clubs }: { clubs: SceneClub[] }) {
  const reduced = usePrefersReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    // Stop rendering when the hero is scrolled out of view (saves battery and GPU).
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={container} className="absolute inset-0 opacity-55 md:opacity-100" aria-hidden>
      <Canvas
        frameloop={visible ? (reduced ? "demand" : "always") : "never"}
        dpr={[1, compact ? 1.5 : 1.75]}
        camera={{ position: [0, 1.2, 10], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,rgba(210,100,58,0.25),transparent_55%)]" />}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} />
        {/* Local studio lighting for reflections (no HDR download needed). */}
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 4, -6]} scale={[10, 3, 1]} />
          <Lightformer intensity={1} color="#d2643a" position={[-6, 0, 2]} scale={[3, 6, 1]} />
          <Lightformer intensity={0.8} position={[6, -2, 3]} scale={[3, 3, 1]} />
        </Environment>
        <Constellation clubs={clubs} animate={!reduced} compact={compact} />
      </Canvas>
    </div>
  );
}
