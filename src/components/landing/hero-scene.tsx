"use client";

import dynamic from "next/dynamic";
import type { SceneClub } from "./constellation-scene";

// three.js only runs in the browser and is heavy, so the scene is loaded lazily on the client.
const ConstellationScene = dynamic(() => import("./constellation-scene"), {
  ssr: false,
  loading: () => <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_62%_45%,rgba(210,100,58,0.22),transparent_55%)]" />,
});

export function HeroScene({ clubs }: { clubs: SceneClub[] }) {
  return <ConstellationScene clubs={clubs} />;
}
