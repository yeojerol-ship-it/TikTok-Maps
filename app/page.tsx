"use client";

import { useEffect, useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SocialMapApp } from "@/components/SocialMapApp";

type AppScreen = "landing" | "map";

function AppScreenStack({
  screen,
  onOpenMap,
  onBack,
}: {
  screen: AppScreen;
  onOpenMap: () => void;
  onBack: () => void;
}) {
  const onLanding = screen === "landing";

  return (
    <div className="app-screen-stack relative h-full w-full overflow-hidden">
      <div
        className={`app-screen ${onLanding ? "app-screen--active" : "app-screen--left"}`}
      >
        <LandingScreen onOpenMap={onOpenMap} />
      </div>
      <div
        className={`app-screen ${onLanding ? "app-screen--right" : "app-screen--active"}`}
      >
        <SocialMapApp isMapScreenActive={!onLanding} onBack={onBack} />
      </div>
    </div>
  );
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("landing");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const content = (
    <AppScreenStack
      screen={screen}
      onOpenMap={() => setScreen("map")}
      onBack={() => setScreen("landing")}
    />
  );

  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden">{content}</div>
    );
  }

  return <PhoneFrame>{content}</PhoneFrame>;
}
