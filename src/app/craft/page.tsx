"use client";
import styles from "./craft.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import PixelMonsters from "@/components/PixelMonsters";

interface CraftedMarket {
  id: string;
  question: string;
  category: string;
  endDate: string;
  yesOdds: number;
  creator: string;
  timestamp: number;
}

const CATEGORIES = [
  { value: "crypto", label: "Crypto", icon: "\u{1F48E}" },
  { value: "sports", label: "Sports", icon: "\u{26BD}" },
  { value: "politics", label: "Politics", icon: "\u{1F3DB}\uFE0F" },
  { value: "stocks", label: "Stocks", icon: "\u{1F4C8}" },
  { value: "pop-culture", label: "Pop Culture", icon: "\u{1F3AC}" },
  { value: "gaming", label: "Gaming", icon: "\u{1F3AE}" },
  { value: "world", label: "World", icon: "\u{1F30D}" },
  { value: "space-universe", label: "Space", icon: "\u{1F680}" },
  { value: "business", label: "Business", icon: "\u{1F4BC}" },
];

const DURATIONS = [
  { value: "1h", label: "1 Hour", icon: "\u{23F1}\uFE0F" },
  { value: "1d", label: "1 Day", icon: "\u{1F305}" },
  { value: "1w", label: "1 Week", icon: "\u{1F4C5}" },
  { value: "1m", label: "1 Month", icon: "\u{1F4C6}" },
];

function playAnvil() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function CraftPage() {
  const wallet = useWallet();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [yesOdds, setYesOdds] = useState(50);
  const [crafted, setCrafted] = useState<CraftedMarket[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [step, setStep] = useState(0); // 0=question, 1=category, 2=duration, 3=odds, 4=review

  const canCraft = question.length >= 10 && category && duration;

  function craftMarket() {
    if (!canCraft) return;
    playAnvil();
    const endDate = new Date();
    switch (duration) {
      case "1h": endDate.setHours(endDate.getHours() + 1); break;
      case "1d": endDate.setDate(endDate.getDate() + 1); break;
      case "1w": endDate.setDate(endDate.getDate() + 7); break;
      case "1m": endDate.setMonth(endDate.getMonth() + 1); break;
    }
    const market: CraftedMarket = {
      id: `craft_${Date.now()}`,
      question,
      category,
      endDate: endDate.toISOString(),
      yesOdds,
      creator: wallet.shortAddress || "anon",
      timestamp: Date.now(),
    };
    setCrafted(prev => [market, ...prev]);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 5000);
    setQuestion(""); setCategory(""); setDuration(""); setYesOdds(50); setStep(0);
  }

  return (
    <div className={styles.world}>
      <PixelMonsters />
      <nav className={styles.topBar}>
        <Link href="/feed" className={styles.backBtn}>{"< Back to Feed"}</Link>
        <div className={styles.logoArea}>
          <Image src="/logo.png" alt="PantaWire" width={28} height={28} style={{borderRadius: "4px"}} />
          <span className={styles.logoText}>Crafting Table</span>
        </div>
        <div className={styles.walletArea}>
          {wallet.connected ? (
            <span className={styles.addrBadge}>{wallet.shortAddress}</span>
          ) : (
            <button className={styles.connectBtn} onClick={() => wallet.connect()}>Connect</button>
          )}
        </div>
      </nav>

      <div className={styles.container}>
        <div className={styles.craftLayout}>
          {/* Crafting Table */}
          <div className={styles.craftTableWrap}>
            <h1 className={styles.craftTitle}>{"\u{2692}\uFE0F"} Craft a Prediction Market</h1>
            <p className={styles.craftSub}>Place your ingredients to forge a new market</p>

            <div className={styles.craftingTable}>
              {/* 3x3 Grid */}
              <div className={styles.grid3x3}>
                {/* Row 1: Question */}
                <div className={`${styles.craftSlot} ${styles.slotWide}`}>
                  <div className={styles.slotLabel}>Question (Required)</div>
                  <textarea
                    className={styles.questionInput}
                    placeholder="Will Bitcoin hit $200K by end of 2026?"
                    value={question}
                    onChange={e => { setQuestion(e.target.value); if (e.target.value.length >= 10) setStep(Math.max(step, 1)); }}
                    maxLength={200}
                  />
                  <span className={styles.charCount}>{question.length}/200</span>
                </div>

                {/* Row 2: Category + Duration */}
                <div className={styles.craftRow}>
                  <div className={`${styles.craftSlot} ${styles.slotHalf}`}>
                    <div className={styles.slotLabel}>Category</div>
                    <div className={styles.optionGrid}>
                      {CATEGORIES.map(c => (
                        <button key={c.value}
                          className={`${styles.optionBtn} ${category === c.value ? styles.optionActive : ""}`}
                          onClick={() => { setCategory(c.value); setStep(Math.max(step, 2)); }}
                        >
                          <span>{c.icon}</span>
                          <span className={styles.optLabel}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`${styles.craftSlot} ${styles.slotHalf}`}>
                    <div className={styles.slotLabel}>Duration</div>
                    <div className={styles.durationGrid}>
                      {DURATIONS.map(d => (
                        <button key={d.value}
                          className={`${styles.durBtn} ${duration === d.value ? styles.durActive : ""}`}
                          onClick={() => { setDuration(d.value); setStep(Math.max(step, 3)); }}
                        >
                          <span>{d.icon}</span>
                          <span>{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 3: Odds */}
                <div className={styles.craftSlot}>
                  <div className={styles.slotLabel}>Starting Odds</div>
                  <div className={styles.oddsSlider}>
                    <span className={styles.oddsYes}>YES {yesOdds}%</span>
                    <input type="range" min="5" max="95" value={yesOdds}
                      onChange={e => setYesOdds(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <span className={styles.oddsNo}>NO {100 - yesOdds}%</span>
                  </div>
                </div>
              </div>

              {/* Craft Arrow + Result */}
              <div className={styles.craftAction}>
                <div className={styles.arrow}>{"\u{2B07}\uFE0F"}</div>
                <button className={styles.craftBtn} onClick={craftMarket} disabled={!canCraft}>
                  {canCraft ? "CRAFT MARKET" : "Add all ingredients..."}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressBar}>
              {["Question", "Category", "Duration", "Odds"].map((label, i) => (
                <div key={i} className={`${styles.progressStep} ${step > i ? styles.stepDone : step === i ? styles.stepCurrent : ""}`}>
                  <div className={styles.stepDot}>{step > i ? "\u2714" : i + 1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Crafted Markets */}
          <aside className={styles.sidebar}>
            <div className={styles.sidePanel}>
              <h3 className={styles.panelTitle}>{"\u{1F4DC}"} Your Crafted Markets</h3>
              {crafted.length === 0 ? (
                <p className={styles.emptyText}>No markets crafted yet. Use the crafting table!</p>
              ) : (
                <div className={styles.craftedList}>
                  {crafted.map(m => (
                    <div key={m.id} className={styles.craftedItem}>
                      <span className={styles.craftedQ}>{m.question}</span>
                      <div className={styles.craftedMeta}>
                        <span className={styles.craftedCat}>{CATEGORIES.find(c => c.value === m.category)?.icon} {m.category}</span>
                        <span className={styles.craftedOdds}>{m.yesOdds}% / {100 - m.yesOdds}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.sidePanel}>
              <h3 className={styles.panelTitle}>{"\u{1F4A1}"} Tips</h3>
              <ul className={styles.tipsList}>
                <li>Ask clear YES/NO questions</li>
                <li>Set a specific deadline</li>
                <li>Markets with balanced odds attract more traders</li>
                <li>Be specific - "Will X happen by Y date?"</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Success animation */}
      {showResult && (
        <div className={styles.successOverlay}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>{"\u2728"}</div>
            <h2>Market Crafted!</h2>
            <p>Your prediction market has been forged.</p>
          </div>
        </div>
      )}
    </div>
  );
}