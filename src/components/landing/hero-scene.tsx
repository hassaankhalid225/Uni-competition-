"use client";

import dynamic from "next/dynamic";
import type { SceneClub } from "./constellation-scene";

// three.js only runs in the browser and is heavy, so both scenes are loaded lazily on the client.
const ConstellationScene = dynamic(() => import("./constellation-scene"), { ssr: false });
const PhysicsStageScene = dynamic(() => import("./physics-stage"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(210,100,58,0.3),transparent_60%)]" />,
});

export function HeroScene({ clubs }: { clubs: SceneClub[] }) {
  return <ConstellationScene clubs={clubs} />;
}

export function PhysicsStage(props: { distance?: number; offsetY?: number }) {
  return <PhysicsStageScene {...props} />;
}
