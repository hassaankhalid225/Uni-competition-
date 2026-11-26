"use client";

// Hero 3D model: the CS department as a small floating campus.
//   • Centre: the department building, crowned by the Campus Connect pin (the brand mark).
//   • Around it: one pavilion per real club (from the database), each in its own colour.
//   • Paths join every club to the department; light pulses travel along them (announcements).
//   • Paper notice cards orbit the tower (official notices); trees and soft shadows for warmth.
// Hover a pavilion to lift it and see the club. Everything is procedural geometry: no model
// downloads, so it loads fast.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type DioramaClub = { name: string; slug: string; members: number };

const ACCENT = "#d2643a";

function hueFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function useIsDark() {
  const [dark, setDark] = useState(false);
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

function palette(dark: boolean) {
  return dark
    ? { ground: "#2a2d35", groundSide: "#1f2128", path: "#3a3e48", building: "#e9e3da", buildingDark: "#c9c1b5", glass: "#1a1c22", tree: "#6f8f78", trunk: "#5a4a3e", card: "#f4efe8", shadow: "#000000" }
    : { ground: "#e6dccd", groundSide: "#cdbfac", path: "#f3ede4", building: "#f7f2ea", buildingDark: "#ddd2c3", glass: "#46505f", tree: "#7fa38a", trunk: "#7a5c46", card: "#ffffff", shadow: "#3a2e24" };
}
type Palette = ReturnType<typeof palette>;

// ── Deterministic layout ─────────────────────────────────────────────────────
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function clubSpots(count: number) {
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.55;
    return new THREE.Vector3(Math.cos(a) * 5.1, 0, Math.sin(a) * 3.3);
  });
}

// ── Pieces ───────────────────────────────────────────────────────────────────
function Island({ pal }: { pal: Palette }) {
  return (
    <group>
      <RoundedBox args={[15, 0.9, 10.4]} radius={0.45} smoothness={4} position={[0, -0.45, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={pal.groundSide} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[14.6, 0.12, 10]} radius={0.06} smoothness={2} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color={pal.ground} roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

function Windows({ width, height, depth, y, pal, rows, cols }: { width: number; height: number; depth: number; y: number; pal: Palette; rows: number; cols: number }) {
  // Instanced window panes on the front and right facades.
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = rows * cols * 2;
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const tmp = new THREE.Object3D();
    let k = 0;
    for (const face of [0, 1]) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = (c + 0.5) / cols - 0.5;
          const v = (r + 0.5) / rows - 0.5;
          if (face === 0) {
            tmp.position.set(u * width * 0.82, y + v * height * 0.72, depth / 2 + 0.011);
            tmp.rotation.set(0, 0, 0);
          } else {
            tmp.position.set(width / 2 + 0.011, y + v * height * 0.72, u * depth * 0.82);
            tmp.rotation.set(0, Math.PI / 2, 0);
          }
          tmp.scale.set(((face === 0 ? width : depth) / cols) * 0.55, (height / rows) * 0.5, 1);
          tmp.updateMatrix();
          m.setMatrixAt(k++, tmp.matrix);
        }
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, [width, height, depth, y, rows, cols]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={pal.glass} roughness={0.15} metalness={0.4} envMapIntensity={1.4} />
    </instancedMesh>
  );
}

function Pin({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    ref.current.position.y = 4.45 + Math.sin(clock.elapsedTime * 1.6) * 0.12;
    ref.current.rotation.y = clock.elapsedTime * 0.8;
  });
  return (
    <group ref={ref} position={[0, 4.45, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshPhysicalMaterial color={ACCENT} roughness={0.25} clearcoat={1} emissive={ACCENT} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.55, 32]} />
        <meshPhysicalMaterial color={ACCENT} roughness={0.25} clearcoat={1} />
      </mesh>
      <pointLight color={ACCENT} intensity={6} distance={6} decay={1.5} />
    </group>
  );
}

function Department({ pal, animate }: { pal: Palette; animate: boolean }) {
  return (
    <group>
      {/* podium */}
      <RoundedBox args={[3.6, 0.3, 2.8]} radius={0.08} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={pal.buildingDark} roughness={0.8} />
      </RoundedBox>
      {/* main block */}
      <RoundedBox args={[3.1, 1.7, 2.3]} radius={0.08} position={[0, 1.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={pal.building} roughness={0.7} />
      </RoundedBox>
      <Windows width={3.1} height={1.7} depth={2.3} y={1.2} pal={pal} rows={3} cols={6} />
      {/* upper block */}
      <RoundedBox args={[2.1, 1.1, 1.6]} radius={0.07} position={[0.2, 2.6, -0.1]} castShadow receiveShadow>
        <meshStandardMaterial color={pal.building} roughness={0.7} />
      </RoundedBox>
      <Windows width={2.1} height={1.1} depth={1.6} y={2.6} pal={pal} rows={2} cols={4} />
      {/* tower */}
      <RoundedBox args={[0.8, 0.9, 0.8]} radius={0.06} position={[0, 3.6, 0]} castShadow>
        <meshStandardMaterial color={pal.buildingDark} roughness={0.6} />
      </RoundedBox>
      {/* entrance canopy in the accent colour */}
      <RoundedBox args={[1.2, 0.08, 0.5]} radius={0.03} position={[0, 0.85, 1.38]} castShadow>
        <meshStandardMaterial color={ACCENT} roughness={0.5} />
      </RoundedBox>
      <Pin animate={animate} />
    </group>
  );
}

function Pavilion({ club, position, pal, hovered, onHover, onOpen }: { club: DioramaClub; position: THREE.Vector3; pal: Palette; hovered: boolean; onHover: (slug: string | null) => void; onOpen: (slug: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  const color = useMemo(() => new THREE.Color().setHSL(hueFor(club.slug) / 360, 0.5, 0.55), [club.slug]);
  const facing = Math.atan2(-position.x, -position.z); // door faces the department
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = hovered ? 0.45 : 0;
    g.position.y += (target - g.position.y) * Math.min(dt * 8, 1);
    const s = hovered ? 1.08 : 1;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * Math.min(dt * 8, 1));
  });
  return (
    <group position={[position.x, 0.08, position.z]} rotation={[0, facing, 0]}>
      <group
        ref={ref}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(club.slug);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={() => onOpen(club.slug)}
      >
        <RoundedBox args={[1.5, 0.95, 1.2]} radius={0.06} position={[0, 0.48, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={pal.building} roughness={0.7} />
        </RoundedBox>
        {/* gabled roof in the club colour */}
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 1.62, 3]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        {/* door + window facing the department */}
        <mesh position={[0, 0.34, 0.61]}>
          <planeGeometry args={[0.32, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <mesh position={[0.48, 0.55, 0.61]}>
          <planeGeometry args={[0.28, 0.24]} />
          <meshStandardMaterial color={pal.glass} roughness={0.15} metalness={0.4} />
        </mesh>
        <mesh position={[-0.48, 0.55, 0.61]}>
          <planeGeometry args={[0.28, 0.24]} />
          <meshStandardMaterial color={pal.glass} roughness={0.15} metalness={0.4} />
        </mesh>
        <Html center position={[0, 2.05, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none", visibility: hovered ? "visible" : "hidden" }}>
          <div
            className="whitespace-nowrap rounded-full border border-line bg-surface/95 px-3 py-1.5 text-[12px] font-medium text-ink shadow-lg transition-all duration-300"
            style={{ opacity: hovered ? 1 : 0, transform: `translateY(${hovered ? 0 : 6}px)` }}
          >
            {club.name}
            <span className="ml-2 font-mono text-[10px] text-ink-muted">{club.members} members</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function Paths({ spots, pal, animate }: { spots: THREE.Vector3[]; pal: Palette; animate: boolean }) {
  const curves = useMemo(
    () =>
      spots.map((p) => {
        const start = new THREE.Vector3(p.x * 0.26, 0.1, p.z * 0.4);
        const end = new THREE.Vector3(p.x * 0.84, 0.1, p.z * 0.84);
        const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(-p.z * 0.12, 0, p.x * 0.12));
        return new THREE.QuadraticBezierCurve3(start, mid, end);
      }),
    [spots],
  );
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    curves.forEach((c, i) => {
      const m = pulses.current[i];
      if (!m) return;
      const t = animate ? (clock.elapsedTime * 0.28 + i / curves.length) % 1 : 0.5;
      c.getPoint(t, tmp);
      m.position.set(tmp.x, 0.2, tmp.z);
      const s = 0.6 + Math.sin(t * Math.PI) * 0.6;
      m.scale.setScalar(s);
    });
  });
  return (
    <group>
      {curves.map((c, i) => (
        <group key={i}>
          <mesh receiveShadow>
            <tubeGeometry args={[c, 32, 0.13, 8, false]} />
            <meshStandardMaterial color={pal.path} roughness={1} />
          </mesh>
          <mesh ref={(m) => { pulses.current[i] = m; }}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color={ACCENT} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Trees({ pal, spots }: { pal: Palette; spots: THREE.Vector3[] }) {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => {
    const rnd = seeded(11);
    const list: [number, number, number][] = [];
    let guard = 0;
    while (list.length < 22 && guard++ < 400) {
      const x = (rnd() - 0.5) * 13.4;
      const z = (rnd() - 0.5) * 9;
      const nearHub = Math.abs(x) < 2.6 && Math.abs(z) < 2.2;
      const nearClub = spots.some((p) => Math.hypot(p.x - x, p.z - z) < 1.4);
      const nearPath = spots.some((p) => {
        const t = Math.max(0, Math.min(1, (x * p.x + z * p.z) / (p.x * p.x + p.z * p.z)));
        return Math.hypot(x - p.x * t, z - p.z * t) < 0.55;
      });
      if (!nearHub && !nearClub && !nearPath) list.push([x, z, 0.7 + rnd() * 0.5]);
    }
    return list;
  }, [spots]);
  useEffect(() => {
    const tmp = new THREE.Object3D();
    positions.forEach(([x, z, s], i) => {
      tmp.position.set(x, 0.55 * s + 0.35 * s, z);
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      crowns.current?.setMatrixAt(i, tmp.matrix);
      tmp.position.set(x, 0.2 * s, z);
      tmp.updateMatrix();
      trunks.current?.setMatrixAt(i, tmp.matrix);
    });
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true;
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return (
    <group>
      <instancedMesh ref={crowns} args={[undefined, undefined, positions.length]} castShadow>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={pal.tree} roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, positions.length]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
        <meshStandardMaterial color={pal.trunk} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

function NoticeCards({ pal, animate }: { pal: Palette; animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.y = clock.elapsedTime * 0.35;
    ref.current.children.forEach((c, i) => (c.position.y = 3.1 + Math.sin(clock.elapsedTime * 1.3 + i * 2) * 0.15));
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 2.3, 3.1, Math.sin(a) * 2.3]} rotation={[0, -a + Math.PI / 2, 0.12]}>
            <RoundedBox args={[0.7, 0.5, 0.03]} radius={0.02} castShadow>
              <meshStandardMaterial color={pal.card} roughness={0.6} />
            </RoundedBox>
            {[0.1, 0, -0.1].map((y, k) => (
              <mesh key={k} position={[-0.04 * k, y - 0.03, 0.02]}>
                <planeGeometry args={[0.46 - k * 0.1, 0.035]} />
                <meshBasicMaterial color="#c9c2b8" />
              </mesh>
            ))}
            <mesh position={[0, 0.2, 0.04]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color={ACCENT} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Scene({ clubs, animate, compact, onReady, onOpen }: { clubs: DioramaClub[]; animate: boolean; compact: boolean; onReady: () => void; onOpen: (slug: string) => void }) {
  const dark = useIsDark();
  const pal = useMemo(() => palette(dark), [dark]);
  const root = useRef<THREE.Group>(null);
  const spots = useMemo(() => clubSpots(clubs.length), [clubs.length]);
  const [hovered, setHovered] = useState<string | null>(null);
  const readyCalled = useRef(false);

  useFrame(({ pointer, camera, clock }, dt) => {
    if (!readyCalled.current) {
      readyCalled.current = true;
      onReady();
    }
    if (root.current) {
      // Slow turntable that pauses while a pavilion is hovered, plus pointer tilt.
      if (animate && !hovered) root.current.rotation.y += dt * 0.07;
      const tx = animate ? pointer.y * 0.06 : 0;
      root.current.rotation.x += (tx - root.current.rotation.x) * Math.min(dt * 3, 1);
      root.current.position.y = animate ? Math.sin(clock.elapsedTime * 0.8) * 0.08 : 0;
    }
    const px = animate ? pointer.x * 0.8 : 0;
    camera.position.x += (18.5 + px - camera.position.x) * Math.min(dt * 2, 1);
    camera.lookAt(0, 0.9, 0);
  });

  return (
    <group ref={root} scale={compact ? 1.12 : 0.86}>
      <Island pal={pal} />
      <Paths spots={spots} pal={pal} animate={animate} />
      <Department pal={pal} animate={animate} />
      {clubs.map((c, i) => (
        <Pavilion key={c.slug} club={c} position={spots[i]} pal={pal} hovered={hovered === c.slug} onHover={setHovered} onOpen={onOpen} />
      ))}
      <Trees pal={pal} spots={spots} />
      <NoticeCards pal={pal} animate={animate} />
      <ContactShadows position={[0, -0.95, 0]} opacity={dark ? 0.6 : 0.35} scale={22} blur={2.8} far={4} color={pal.shadow} />
    </group>
  );
}

export default function CampusDiorama({ clubs }: { clubs: DioramaClub[] }) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    const small = window.matchMedia("(max-width: 767px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setCompact(small.matches);
      setReduced(motion.matches);
    };
    update();
    small.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      io.disconnect();
      small.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        shadows
        frameloop={visible ? "always" : "never"}
        dpr={[1, compact ? 1.5 : 1.75]}
        camera={{ position: [18.5, 15, 21.5], fov: compact ? 34 : 30 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.35;
          pmrem.dispose();
        }}
        fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(210,100,58,0.18),transparent_60%)]" />}
      >
        <hemisphereLight args={["#fff4e8", "#b9a892", 0.55]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={2.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        />
        <Scene
          clubs={clubs}
          animate={!reduced}
          compact={compact}
          onOpen={(slug) => {
            document.body.style.cursor = "";
            router.push(`/welcome/clubs/${slug}`);
          }}
          onReady={() => {
            // Hide the server-rendered poster once the live scene draws.
            requestAnimationFrame(() => container.current?.parentElement?.setAttribute("data-stage-ready", "true"));
          }}
        />
      </Canvas>
    </div>
  );
}
