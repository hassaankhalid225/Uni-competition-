"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SceneClub } from "./constellation-scene";

// three.js only runs in the browser and is heavy, so both scenes are loaded lazily on the client.
const ConstellationScene = dynamic(() => import("./constellation-scene"), { ssr: false });
const PhysicsStageScene = dynamic(() => import("./physics-stage"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(210,100,58,0.3),transparent_60%)]" />,
});

/**
 * The scroll-story constellation sits below the hero, so it loads only once the visitor starts
 * scrolling (or after 2.5s idle). The first screen then downloads and renders just the hero pile.
 */
export function HeroScene({ clubs }: { clubs: SceneClub[] }) {
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const start = () => setLoad(true);
    const timer = setTimeout(start, 2500);
    window.addEventListener("scroll", start, { once: true, passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", start);
    };
  }, []);
  return load ? <ConstellationScene clubs={clubs} /> : null;
}

export function PhysicsStage(props: { distance?: number; offsetY?: number; poster?: { desktop: string; mobile: string } }) {
  return <PhysicsStageScene {...props} />;
}
