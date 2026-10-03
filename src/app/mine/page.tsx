"use client";
import styles from "./mine.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

interface Market {
  marketId: string;
  question: string;
  category?: string;
  yesPrice?: number;
  noPrice?: number;
  imageUrl?: string;
  volume?: number;
}

type BlockType = "stone" | "dirt" | "diamond_ore" | "gold_ore" | "coal_ore" | "iron_ore" | "redstone_ore" | "emerald_ore";
interface Block {
  id: number;
  type: BlockType;
  hp: number;
  maxHp: number;
  mined: boolean;
  reward: Market | null;
  gems: number;
  cracking: number;
}

const BLOCK_CONFIG: Record<BlockType, { color: string; darkColor: string; hp: number; rarity: number; gems: number }> = {
  stone:         { color: "#888", darkColor: "#666", hp: 3, rarity: 35, gems: 1 },
  dirt:          { color: "#8B6914", darkColor: "#6B4914", hp: 2, rarity: 25, gems: 1 },
  coal_ore:      { color: "#555", darkColor: "#333", hp: 4, rarity: 15, gems: 2 },
  iron_ore:      { color: "#C4A882", darkColor: "#A08862", hp: 5, rarity: 10, gems: 3 },
  gold_ore:      { color: "#FFD700", darkColor: "#DAA520", hp: 6, rarity: 7, gems: 5 },
  redstone_ore:  { color: "#FF2222", darkColor: "#CC0000", hp: 6, rarity: 4, gems: 5 },
  diamond_ore:   { color: "#2ee8bb", darkColor: "#1ab890", hp: 8, rarity: 3, gems: 10 },
  emerald_ore:   { color: "#00CC44", darkColor: "#009933", hp: 10, rarity: 1, gems: 15 },
};

function pickBlockType(): BlockType {
  const total = Object.values(BLOCK_CONFIG).reduce((s, v) => s + v.rarity, 0);
  let r = Math.random() * total;
  for (const [type, cfg] of Object.entries(BLOCK_CONFIG)) {
    r -= cfg.rarity;
    if (r <= 0) return type as BlockType;
  }
  return "stone";
}

function playMineSound(hit: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (hit) {
      osc.type = "square";
      osc.frequency.setValueAtTime(200 + Math.random() * 200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch {}
}

export default function MinePage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [gems, setGems] = useState(0);
  const [discovered, setDiscovered] = useState<Market[]>([]);
  const [combo, setCombo] = useState(0);
  const [pickaxeLevel, setPickaxeLevel] = useState(1);
  const [particles, setParticles] = useState<{id: number; x: number; y: number; text: string; color: string}[]>([]);
  const nextParticleId = useRef(0);

  useEffect(() => {
    fetch("/api/markets").then(r => r.json()).then(d => {
      const m = d.markets || d || [];
      setMarkets(m);
      generateBlocks(m);
    });
  }, []);

  function generateBlocks(mkts: Market[]) {
    const shuffled = [...mkts].sort(() => Math.random() - 0.5);
    const newBlocks: Block[] = [];
    for (let i = 0; i < 25; i++) {
      const type = pickBlockType();
      const cfg = BLOCK_CONFIG[type];
      const hasReward = type !== "stone" && type !== "dirt" && shuffled.length > 0;
      newBlocks.push({
        id: i,
        type,
        hp: cfg.hp,
        maxHp: cfg.hp,
        mined: false,
        reward: hasReward ? (shuffled.pop() || null) : null,
        gems: cfg.gems,
        cracking: 0,
      });
    }
    setBlocks(newBlocks);
  }

  function spawnParticle(x: number, y: number, text: string, color: string) {
    const id = nextParticleId.current++;
    setParticles(p => [...p, {id, x, y, text, color}]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 800);
  }

  function hitBlock(blockId: number, e: React.MouseEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId || b.mined) return b;
      const dmg = pickaxeLevel;
      const newHp = b.hp - dmg;
      const cracking = Math.min(4, Math.floor((1 - newHp / b.maxHp) * 5));

      if (newHp <= 0) {
        playMineSound(false);
        setGems(g => g + b.gems);
        setCombo(c => c + 1);
        spawnParticle(x, y, `+${b.gems}`, BLOCK_CONFIG[b.type].color);
        if (b.reward) {
          setDiscovered(d => [...d, b.reward!]);
          spawnParticle(x, y - 30, "MARKET!", "#2ee8bb");
        }
        return { ...b, hp: 0, mined: true, cracking: 5 };
      } else {
        playMineSound(true);
        spawnParticle(x, y, `-${dmg}`, "#fff");
        return { ...b, hp: newHp, cracking };
      }
    }));
  }

  function upgradePickaxe() {
    const cost = pickaxeLevel * 20;
    if (gems >= cost) {
      setGems(g => g - cost);
      setPickaxeLevel(l => l + 1);
    }
  }

  function resetMine() {
    setCombo(0);
    generateBlocks(markets);
  }

  const pickNames = ["Wood", "Stone", "Iron", "Gold", "Diamond", "Netherite"];
  const pickName = pickNames[Math.min(pickaxeLevel - 1, pickNames.length - 1)];
  const allMined = blocks.length > 0 && blocks.every(b => b.mined);

  return (
    <div className={styles.mineWorld}>
      <nav className={styles.topBar}>
        <Link href="/feed" className={styles.backBtn}>{"< Back to Feed"}</Link>
        <div className={styles.logoArea}>
          <Image src="/logo.png" alt="PantaWire" width={28} height={28} style={{borderRadius: "4px"}} />
          <span className={styles.logoText}>PantaWire Mine</span>
        </div>
        <div className={styles.gemCount}>{gems} Gems</div>
      </nav>

      <div className={styles.mineLayout}>
        <div className={styles.mineMain}>
          <div className={styles.mineHeader}>
            <h1 className={styles.mineTitle}>Mine Predictions</h1>
            <p className={styles.mineSub}>Click blocks to mine them and discover prediction markets!</p>
          </div>

          <div className={styles.blockGrid}>
            {blocks.map(b => (
              <button
                key={b.id}
                className={`${styles.block} ${b.mined ? styles.blockMined : ""}`}
                style={{
                  "--block-color": BLOCK_CONFIG[b.type].color,
                  "--block-dark": BLOCK_CONFIG[b.type].darkColor,
                } as React.CSSProperties}
                onClick={(e) => hitBlock(b.id, e)}
                disabled={b.mined}
              >
                {!b.mined && (
                  <>
                    <div className={styles.blockFace}>
                      <span className={styles.blockTypeName}>{b.type.replace("_", " ")}</span>
                      <div className={styles.hpBar}>
                        <div className={styles.hpFill} style={{width: `${(b.hp / b.maxHp) * 100}%`}}></div>
                      </div>
                    </div>
                    {b.cracking > 0 && (
                      <div className={styles.cracks} style={{opacity: b.cracking * 0.2}}>
                        {Array.from({length: b.cracking}).map((_, i) => (
                          <div key={i} className={styles.crack} style={{
                            transform: `rotate(${Math.random() * 360}deg)`,
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                          }}></div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {b.mined && b.reward && (
                  <div className={styles.rewardReveal}>
                    <span className={styles.rewardQ}>{b.reward.question.slice(0, 50)}</span>
                    <span className={styles.rewardPct}>
                      {b.reward.yesPrice ? `${Math.round(b.reward.yesPrice * 100)}% YES` : "50/50"}
                    </span>
                  </div>
                )}
                {b.mined && !b.reward && (
                  <div className={styles.emptyMine}>+{b.gems}</div>
                )}
              </button>
            ))}
          </div>

          {allMined && (
            <button className={styles.resetBtn} onClick={resetMine}>
              Generate New Mine
            </button>
          )}
        </div>

        <aside className={styles.mineSidebar}>
          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Pickaxe</h3>
            <div className={styles.pickInfo}>
              <span className={styles.pickName}>{pickName} Pickaxe</span>
              <span className={styles.pickDmg}>DMG: {pickaxeLevel}</span>
            </div>
            <button className={styles.upgradeBtn} onClick={upgradePickaxe} disabled={gems < pickaxeLevel * 20}>
              Upgrade ({pickaxeLevel * 20} Gems)
            </button>
          </div>

          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Stats</h3>
            <div className={styles.statRow}><span>Gems</span><span className={styles.statVal}>{gems}</span></div>
            <div className={styles.statRow}><span>Discovered</span><span className={styles.statVal}>{discovered.length}</span></div>
            <div className={styles.statRow}><span>Combo</span><span className={styles.statVal}>x{combo}</span></div>
          </div>

          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Discovered Markets</h3>
            <div className={styles.discoveredList}>
              {discovered.length === 0 && <p className={styles.emptyText}>Mine ore blocks to discover markets!</p>}
              {discovered.map((m, i) => (
                <div key={i} className={styles.discoveredItem}>
                  <span className={styles.disQ}>{m.question.slice(0, 60)}</span>
                  <span className={styles.disPct}>{m.yesPrice ? `${Math.round(m.yesPrice * 100)}%` : "50%"}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {particles.map(p => (
        <div key={p.id} className={styles.floatingParticle} style={{left: p.x, top: p.y, color: p.color}}>
          {p.text}
        </div>
      ))}
    </div>
  );
}