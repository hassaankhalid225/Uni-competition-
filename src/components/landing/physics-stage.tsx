"use client";

// Interactive hero "stage": a pile of glossy pieces (spheres, capsules and rings in the
// department's colours) held together by a soft pull toward the centre. The cursor pushes pieces
// away and they tumble back: a tactile picture of a community that keeps coming together.
// A tiny hand-written physics step (no physics library): spring to centre, sphere-sphere
// separation, cursor repulsion, damping.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

type Kind = "sphere" | "capsule" | "ring";
type Body = { kind: Kind; r: number; p: THREE.Vector3; v: THREE.Vector3; q: THREE.Quaternion; spin: THREE.Vector3; color: THREE.Color };

const COLORS = ["#d2643a", "#d2643a", "#1c1e24", "#1c1e24", "#f4efe8", "#f4efe8", "#e8a07e"].map((c) => new THREE.Color(c));
const KINDS: Kind[] = ["sphere", "capsule", "ring"];
const RADIUS: Record<Kind, number> = { sphere: 0.75, capsule: 0.85, ring: 0.8 };

function createBodies(count: number): Body[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: count }, (_, i) => {
    const kind = KINDS[i % KINDS.length];
    const scale = 0.75 + rnd() * 0.5;
    return {
      kind,
      r: RADIUS[kind] * scale,
      p: new THREE.Vector3((rnd() - 0.5) * 14, (rnd() - 0.5) * 8, (rnd() - 0.5) * 4),
      v: new THREE.Vector3(),
      q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6)),
      spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.6),
      color: COLORS[Math.floor(rnd() * COLORS.length)],
    };
  });
}

const tmpMatrix = new THREE.Matrix4();
const tmpScale = new THREE.Vector3();
const tmpDelta = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const AXIS = new THREE.Vector3();

function step(bodies: Body[], dt: number, cursor: THREE.Vector3 | null) {
  for (const b of bodies) {
    // Pull toward the centre (a little flatter in z so the pile reads as a cluster on screen).
    b.v.x += -b.p.x * 2.2 * dt;
    b.v.y += -b.p.y * 2.6 * dt;
    b.v.z += -b.p.z * 3.5 * dt;
    if (cursor) {
      tmpDelta.subVectors(b.p, cursor);
      tmpDelta.z *= 0.3;
      const d = tmpDelta.length();
      const reach = 2.8 + b.r;
      if (d < reach && d > 0.0001) b.v.addScaledVector(tmpDelta.normalize(), ((reach - d) / reach) * 38 * dt);
    }
  }
  // Push overlapping pieces apart (pieces are treated as spheres of radius r).
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      tmpDelta.subVectors(b.p, a.p);
      const min = a.r + b.r;
      const d2 = tmpDelta.lengthSq();
      if (d2 < min * min && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const push = (min - d) * 0.5;
        tmpDelta.multiplyScalar(1 / d);
        a.p.addScaledVector(tmpDelta, -push);
        b.p.addScaledVector(tmpDelta, push);
        a.v.addScaledVector(tmpDelta, -push * 3);
        b.v.addScaledVector(tmpDelta, push * 3);
      }
    }
  }
  const damping = Math.exp(-dt * 2.4);
  for (const b of bodies) {
    b.v.multiplyScalar(damping);
    b.p.addScaledVector(b.v, dt);
    // Tumble in proportion to speed, plus a slow idle spin.
    const speed = b.v.length();
    AXIS.set(b.v.y + b.spin.x, -b.v.x + b.spin.y, b.spin.z).normalize();
    tmpQuat.setFromAxisAngle(AXIS, (speed * 0.5 + 0.15) * dt);
    b.q.premultiply(tmpQuat);
  }
}

function Pieces({ count, animate, hovering }: { count: number; animate: boolean; hovering: React.RefObject<boolean> }) {
  const bodies = useMemo(() => {
    const list = createBodies(count);
    for (let i = 0; i < 240; i++) step(list, 1 / 60, null); // settle into a pile before first paint
    return list;
  }, [count]);
  const groups = useMemo(() => KINDS.map((k) => bodies.filter((b) => b.kind === k)), [bodies]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const cursor = useMemo(() => new THREE.Vector3(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    groups.forEach((list, gi) => {
      const mesh = refs.current[gi];
      if (!mesh) return;
      list.forEach((b, i) => mesh.setColorAt(i, b.color));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [groups]);

  useFrame(({ pointer, camera }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    if (animate) {
      ray.setFromCamera(pointer, camera);
      const hit = hovering.current ? ray.ray.intersectPlane(plane, cursor) : null;
      step(bodies, dt, hit);
    }
    groups.forEach((list, gi) => {
      const mesh = refs.current[gi];
      if (!mesh) return;
      list.forEach((b, i) => {
        const s = b.r / RADIUS[b.kind];
        tmpMatrix.compose(b.p, b.q, tmpScale.set(s, s, s));
        mesh.setMatrixAt(i, tmpMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  const material = (
    <meshPhysicalMaterial roughness={0.18} metalness={0.05} clearcoat={1} clearcoatRoughness={0.12} />
  );

  return (
    <group>
      <instancedMesh ref={(m) => { refs.current[0] = m; }} args={[undefined, undefined, groups[0].length]} castShadow>
        <sphereGeometry args={[RADIUS.sphere, 48, 48]} />
        {material}
      </instancedMesh>
      <instancedMesh ref={(m) => { refs.current[1] = m; }} args={[undefined, undefined, groups[1].length]}>
        <capsuleGeometry args={[0.42, 0.85, 12, 32]} />
        {material}
      </instancedMesh>
      <instancedMesh ref={(m) => { refs.current[2] = m; }} args={[undefined, undefined, groups[2].length]}>
        <torusGeometry args={[0.55, 0.24, 32, 64]} />
        {material}
      </instancedMesh>
    </group>
  );
}

/** `distance`: camera distance on desktop; larger shows the pile smaller (tall cards need more). */
export default function PhysicsStage({ distance = 15, offsetY = 0 }: { distance?: number; offsetY?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hovering = useRef(false);

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
    <div
      ref={container}
      className="absolute inset-0"
      aria-hidden
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, compact ? 1.5 : 1.75]}
        camera={{ position: [0, offsetY, compact ? 22 : distance], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(210,100,58,0.35),transparent_60%)]" />}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} />
        <Environment resolution={128}>
          <Lightformer intensity={3} position={[0, 6, -4]} scale={[14, 4, 1]} />
          <Lightformer intensity={1.4} color="#d2643a" position={[-8, 0, 3]} scale={[4, 8, 1]} />
          <Lightformer intensity={1.2} position={[8, -2, 4]} scale={[4, 4, 1]} />
          <Lightformer intensity={0.6} position={[0, -6, 2]} scale={[10, 2, 1]} />
        </Environment>
        <Pieces count={compact ? 26 : 42} animate={!reduced} hovering={hovering} />
      </Canvas>
    </div>
  );
}
