"use client";
import { useEffect, useState } from "react";
import styles from "./PixelMonsters.module.css";

interface Monster {
  id: number;
  type: "creeper" | "enderman" | "zombie" | "skeleton" | "spider";
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  bobPhase: number;
}

const MOB_COLORS: Record<string, {body: string; face: string; legs: string}> = {
  creeper:  { body: "#2e8b2e", face: "#000", legs: "#1a5c1a" },
  enderman: { body: "#1a1a2e", face: "#cc44ff", legs: "#0d0d1a" },
  zombie:   { body: "#5b8c3e", face: "#2a4a1e", legs: "#3a5c2e" },
  skeleton: { body: "#d4d4d4", face: "#333", legs: "#aaa" },
  spider:   { body: "#553322", face: "#ff2222", legs: "#332211" },
};

export default function PixelMonsters() {
  const [monsters, setMonsters] = useState<Monster[]>([]);

  useEffect(() => {
    const types: Monster["type"][] = ["creeper", "enderman", "zombie", "skeleton", "spider"];
    const mobs: Monster[] = [];
    for (let i = 0; i < 6; i++) {
      mobs.push({
        id: i,
        type: types[i % types.length],
        x: Math.random() * 90 + 5,
        y: Math.random() * 70 + 15,
        size: 28 + Math.random() * 16,
        speed: 0.3 + Math.random() * 0.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        bobPhase: Math.random() * Math.PI * 2,
      });
    }
    setMonsters(mobs);

    const interval = setInterval(() => {
      setMonsters(prev => prev.map(m => {
        let newX = m.x + m.speed * m.direction * 0.1;
        let newDir = m.direction;
        if (newX > 95 || newX < 2) {
          newDir = -newDir;
          newX = Math.max(2, Math.min(95, newX));
        }
        // Random direction change
        if (Math.random() < 0.005) newDir = -newDir;
        return { ...m, x: newX, direction: newDir, bobPhase: m.bobPhase + 0.05 };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.monsterLayer}>
      {monsters.map(m => {
        const colors = MOB_COLORS[m.type];
        const bobY = Math.sin(m.bobPhase) * 3;
        return (
          <div
            key={m.id}
            className={styles.monster}
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              transform: `scaleX(${m.direction}) translateY(${bobY}px)`,
              width: m.size,
              height: m.size * 1.4,
            }}
            title={m.type}
          >
            {/* Head */}
            <div className={styles.mobHead} style={{background: colors.body}}>
              <div className={styles.mobEye} style={{background: colors.face, left: "20%"}}></div>
              <div className={styles.mobEye} style={{background: colors.face, right: "20%"}}></div>
              {m.type === "creeper" && <div className={styles.creeperMouth} style={{background: colors.face}}></div>}
              {m.type === "enderman" && <div className={styles.endermanMouth}></div>}
            </div>
            {/* Body */}
            <div className={styles.mobBody} style={{background: colors.body}}>
              {m.type === "skeleton" && <div className={styles.skeletonRibs}></div>}
            </div>
            {/* Legs */}
            <div className={styles.mobLegs}>
              <div className={styles.mobLeg} style={{
                background: colors.legs,
                transform: `rotate(${Math.sin(m.bobPhase * 2) * 15}deg)`,
              }}></div>
              <div className={styles.mobLeg} style={{
                background: colors.legs,
                transform: `rotate(${Math.sin(m.bobPhase * 2 + Math.PI) * 15}deg)`,
              }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}