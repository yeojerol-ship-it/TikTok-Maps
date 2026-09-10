"use client";

import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SocialMapApp } from "@/components/SocialMapApp";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden">
        <SocialMapApp />
      </div>
    );
  }

  return (
    <PhoneFrame>
      <SocialMapApp />
    </PhoneFrame>
  );
}
