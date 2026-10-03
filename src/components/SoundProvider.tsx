"use client";
import { useEffect } from "react";
import { playClick, playHover } from "@/utils/sounds";

export default function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target && target.closest && target.closest("button, a")) {
        playClick();
      }
    }

    function handleHover(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target && target.closest && target.closest("button, a")) {
        playHover();
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("mouseover", handleHover);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleHover);
    };
  }, []);

  return <>{children}</>;
}
