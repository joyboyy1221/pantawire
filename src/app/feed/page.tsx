"use client";
import styles from "./feed.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { playClick, playChestOpen, playEnchant, playPlace } from "@/utils/sounds";
import { useWallet, WALLETS } from "@/components/WalletProvider";
import PixelMonsters from "@/components/PixelMonsters";

interface Market {
  marketId: string;
  question: string;
  description?: string;
  category?: string;
  phase: string;
  yesPrice?: number;
  noPrice?: number;
  volume?: number;
  isReal?: boolean;
  imageUrl?: string;
  createdAt: string;
  endTime?: string;
}


const catLabels: Record<string, string> = {
  crypto: "\u{1F48E} Crypto", sports: "\u{1F3B9} Sports", politics: "\u{1F3F0} Politics",
  entertainment: "\u{1F3B5} Entertainment", science: "\u{1F9EA} Science", technology: "\u{26A1} Tech",
  stocks: "\u{1F4C8} Stocks", commodities: "\u{26CF} Commodities", macroeconomics: "\u{1F3E6} Macro",
  "pop-culture": "\u{1F3AD} Pop Culture", business: "\u{1F4BC} Business", gaming: "\u{1F3AE} Gaming",
  "space-universe": "\u{1F680} Space", world: "\u{1F5FA} World",
};

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function timeLeft(d?: string): string {
  if (!d) return "";
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  return days > 0 ? `${days}d` : `${Math.floor(diff / 3600000)}h`;
}

export default function FeedPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{market: Market; side: "yes"|"no"} | null>(null);
  const [amount, setAmount] = useState("10");
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    async function load() {
      try {
        const [mr, cr] = await Promise.all([fetch("/api/markets"), fetch("/api/categories")]);
        const md = await mr.json();
        const cd = await cr.json();
        setMarkets(md.markets || md || []);
        setCategories(cd.categories || cd || []);
      } catch {
        const { DEMO_MARKETS, DEMO_CATEGORIES } = await import("@/services/panta");
        setMarkets(DEMO_MARKETS);
        setCategories(DEMO_CATEGORIES);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeCat === "all" ? markets : markets.filter(m => m.category === activeCat);

  return (
    <div className={styles.feedWorld}>
      <nav className={styles.hotbar}>
        <div className={styles.hotbarInner}>
          <Link href="/" className={styles.logoWrap}>
            <Image src="/logo.png" alt="PantaWire" width={36} height={36} className={styles.logoImg} />
            <span className={styles.logoText}>PantaWire</span>
          </Link>
          <div className={styles.headerRight}>

            <Link href="/craft" className={styles.mineBtn}>Craft</Link>
            <Link href="/portfolio" className={styles.mineBtn}>Portfolio</Link>
            <Link href="/mine" className={styles.mineBtn}>Mine</Link>
            <button className={wallet.network === "mainnet" ? styles.mainnetBadge : styles.devnetBadge} onClick={() => wallet.setNetwork(wallet.network === "mainnet" ? "devnet" : "mainnet")}>
              {wallet.network === "mainnet" ? "MAINNET" : "SANDBOX"}
            </button>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot}></span>
              LIVE
            </div>
            {wallet.connected ? (
              <button className={styles.walletBtnConnected} onClick={() => wallet.disconnect()}>
                {wallet.shortAddress}
              </button>
            ) : (
              <button className={styles.walletBtn} onClick={() => wallet.connect()} disabled={wallet.connecting}>
                {wallet.connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <PixelMonsters />

      {/* Wallet Picker Modal */}
      {wallet.showPicker && (
        <div className={styles.modalOverlay} onClick={() => wallet.setShowPicker(false)}>
          <div className={styles.walletPickerBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Select Wallet</h3>
              <button className={styles.modalClose} onClick={() => wallet.setShowPicker(false)}>X</button>
            </div>
            <div className={styles.networkToggle}>
              <button className={`${styles.netBtn} ${wallet.network === "mainnet" ? styles.netActive : ""}`} onClick={() => wallet.setNetwork("mainnet")}>
                Mainnet (Real USDC)
              </button>
              <button className={`${styles.netBtn} ${wallet.network === "devnet" ? styles.netActive : ""}`} onClick={() => wallet.setNetwork("devnet")}>
                Sandbox (Test Funds)
              </button>
            </div>
            {wallet.network === "devnet" && (
              <div className={styles.sandboxInfo}>
                <span>Sandbox Balance: ${wallet.sandboxBalance} USDC</span>
                <p className={styles.sandboxNote}>No real money. Free to experiment!</p>
              </div>
            )}
            <div className={styles.walletList}>
              {WALLETS.map(w => (
                <button key={w.id} className={styles.walletOption} onClick={() => wallet.connect(w.id)}
                  style={{"--wallet-color": w.color} as React.CSSProperties}>
                  <span className={styles.walletIcon}>{w.icon}</span>
                  <span className={styles.walletNameText}>{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Categories</h3>
            <div className={styles.catList}>
              <button
                className={`${styles.catBtn} ${activeCat === "all" ? styles.catActive : ""}`}
                onClick={() => { setActiveCat("all"); playClick(); }}
              >{"\u{2B50}"} All</button>
              {categories.map((cat: any) => {
                const slug = cat.slug || cat;
                const name = cat.name || slug;
                return (
                  <button
                    key={slug}
                    className={`${styles.catBtn} ${activeCat === slug ? styles.catActive : ""}`}
                    onClick={() => { setActiveCat(slug); playClick(); }}
                  >{catLabels[slug] || name}</button>
                );
              })}
            </div>
          </div>

          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Stats</h3>
            <div className={styles.statRow}><span>Markets</span><span className={styles.statVal}>{markets.length}</span></div>
            <div className={styles.statRow}><span>On-Chain</span><span className={styles.statValGreen}>{markets.filter(m => m.isReal).length}</span></div>
            <div className={styles.statRow}><span>Volume</span><span className={styles.statVal}>${(markets.reduce((s,m) => s + (m.volume||0), 0) / 1000).toFixed(0)}K</span></div>
          </div>

          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Links</h3>
            <a href="https://panta.market" target="_blank" className={styles.sideLink}>{"\u{1F517}"} Panta</a>
            <a href="https://docs.panta.market" target="_blank" className={styles.sideLink}>{"\u{1F4D6}"} Docs</a>
            <a href="https://solana.com" target="_blank" className={styles.sideLink}>{"\u{26A1}"} Solana</a>
          </div>
        </aside>

        <main className={styles.mainFeed}>
          <div className={styles.feedHeader}>
            <h1 className={styles.feedTitle}>{"\u{26CF}\u{FE0F}"} The Wire</h1>
            <p className={styles.feedSub}>Live prediction markets from Panta API on Solana</p>
          </div>

          {loading && (
            <div className={styles.loadingMsg}>
              <span className={styles.loadDots}>Mining blocks...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className={styles.emptyState}>
              <p>No markets found in this biome.</p>
            </div>
          )}

          {!loading && (
            <div className={styles.cardGrid}>
              {filtered.map((m, i) => {
                const yesPct = m.yesPrice ? Math.round(m.yesPrice * 100) : 50;
                const noPct = 100 - yesPct;
                const label = catLabels[(m.category||"").toLowerCase()] || (m.category||"misc").toUpperCase();

                return (
                  <article key={m.marketId || i} className={styles.marketCard} style={{animationDelay: `${i * 0.05}s`}}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardCat}>{label}</span>
                      {m.isReal && <span className={styles.onChainBadge}>ON-CHAIN</span>}
                      <div className={styles.cardTimes}>
                        {m.endTime && <span className={styles.cardTimeLeft}>{timeLeft(m.endTime)}</span>}
                      </div>
                    </div>

                    {m.imageUrl && (
                      <div className={styles.cardImgWrap}>
                        <img src={m.imageUrl} alt="" className={styles.cardImg} />
                      </div>
                    )}

                    <h2 className={styles.cardQ}>{m.question || `Market ${m.marketId.slice(0, 12)}...`}</h2>
                    {!m.question && <p className={styles.cardAddr}>{m.marketId}</p>}

                    {m.description && (
                      <p className={styles.cardDesc}>
                        {m.description.slice(0, 120)}{m.description.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className={styles.probWrap}>
                      <div className={styles.probLabels}>
                        <span className={styles.probYes}>YES {yesPct}%</span>
                        <span className={styles.probNo}>NO {noPct}%</span>
                      </div>
                      <div className={styles.probBarOuter}>
                        <div className={styles.probBarYes} style={{width: `${yesPct}%`}}></div>
                      </div>
                    </div>

                    <div className={styles.tradeRow}>
                      <button className={styles.btnYes} onClick={() => { setModal({market: m, side: "yes"}); playChestOpen(); }}>
                        Buy YES
                      </button>
                      <button className={styles.btnNo} onClick={() => { setModal({market: m, side: "no"}); playChestOpen(); }}>
                        Buy NO
                      </button>
                    </div>

                    <div className={styles.cardFoot}>
                      <span className={styles.cardPhase}>{m.phase}</span>
                      {m.volume !== undefined && <span className={styles.cardVol}>Vol: ${m.volume.toLocaleString()}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <aside className={styles.rightSidebar}>
          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>{"\u{1F3C6}"} Leaderboard</h3>
            {[...markets].sort((a,b) => (b.volume||0) - (a.volume||0)).slice(0, 6).map((m, i) => (
              <div key={i} className={styles.lbRow}>
                <span className={styles.lbRank}>#{i+1}</span>
                <span className={styles.lbQ}>{(m.question||"").slice(0, 40)}{(m.question||"").length > 40 ? "..." : ""}</span>
                <span className={styles.lbPct}>{m.yesPrice ? Math.round(m.yesPrice * 100) : 50}%</span>
              </div>
            ))}
          </div>

          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>{"\u{1F4BC}"} Your Positions</h3>
            {wallet.positions.length === 0 ? (
              <p className={styles.emptyPos}>No positions yet. Trade to see them here!</p>
            ) : (
              <div className={styles.positionsList}>
                {wallet.positions.map((p, i) => (
                  <div key={i} className={styles.posItem}>
                    <span className={styles.posQ}>{p.question.slice(0, 35)}...</span>
                    <div className={styles.posDetails}>
                      <span className={p.side === "yes" ? styles.posSideYes : styles.posSideNo}>{p.side.toUpperCase()}</span>
                      <span className={styles.posShares}>{p.shares.toFixed(1)} shares</span>
                      <span className={styles.posCost}>${p.costBasis.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className={styles.posSummary}>
                  <span>Total invested</span>
                  <span className={styles.statVal}>${wallet.positions.reduce((s, p) => s + p.costBasis, 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          <div className={styles.sidePanel}>
            <h3 className={styles.panelTitle}>Powered By</h3>
            <div className={styles.poweredBy}>
              <a href="https://panta.market" target="_blank" className={styles.pantaLink}>Panta API</a>
              <span className={styles.onChain}>on Solana</span>
            </div>
          </div>
        </aside>
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={() => { setModal(null); playPlace(); }}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{modal.side === "yes" ? "Buy YES" : "Buy NO"}</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)}>X</button>
            </div>
            <p className={styles.modalQ}>{modal.market.question}</p>
            <div className={styles.modalRow}>
              <span>Price per share</span>
              <span className={modal.side === "yes" ? styles.valGreen : styles.valRed}>
                {Math.round((modal.side === "yes" ? modal.market.yesPrice || 0.5 : modal.market.noPrice || 0.5) * 100)}%
              </span>
            </div>
            <div className={styles.modalInput}>
              <label>Amount (USDC)</label>
              <div className={styles.inputBox}>
                <span>$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10" />
              </div>
            </div>
            <div className={styles.modalRow}>
              <span>Est. shares</span>
              <span className={styles.valWhite}>
                {(Number(amount) / (modal.side === "yes" ? (modal.market.yesPrice || 0.5) : (modal.market.noPrice || 0.5))).toFixed(1)}
              </span>
            </div>
            <div className={styles.modalRow}>
              <span>Potential payout</span>
              <span className={styles.valGold}>
                ${(Number(amount) / (modal.side === "yes" ? (modal.market.yesPrice || 0.5) : (modal.market.noPrice || 0.5))).toFixed(2)}
              </span>
            </div>
            {wallet.connected ? (
              <button className={modal.side === "yes" ? styles.modalBtnYes : styles.modalBtnNo} onClick={async () => {
                const price = modal.side === "yes" ? (modal.market.yesPrice || 0.5) : (modal.market.noPrice || 0.5);
                const shares = Number(amount) / price;

                if (wallet.network === "mainnet") {
                  try {
                    setTradeSuccess("Quoting via Panta API...");
                    const quoteRes = await fetch("/api/trade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "quote", wallet: wallet.address, marketId: modal.market.marketId, side: modal.side, amountUsdc: amount }),
                    });
                    const quote = await quoteRes.json();
                    if (quote.error) { setTradeSuccess(`Quote: ${quote.error}`); setTimeout(() => setTradeSuccess(null), 5000); return; }

                    setTradeSuccess(`Quote: ${quote.shares} shares. Building tx...`);
                    const buildRes = await fetch("/api/trade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "build", quoteId: quote.quoteId, wallet: wallet.address, maxSlippageBps: 300 }),
                    });
                    const build = await buildRes.json();
                    if (build.error) { setTradeSuccess(`Build: ${build.error}`); setTimeout(() => setTradeSuccess(null), 5000); return; }

                    wallet.addPosition({
                      marketId: modal.market.marketId, question: modal.market.question, side: modal.side,
                      shares: parseFloat(build.expectedShares || String(shares)), avgPrice: parseFloat(quote.avgPrice || String(price)),
                      costBasis: Number(amount), currentPrice: price, timestamp: Date.now(), category: modal.market.category,
                    });
                    setTradeSuccess(`Order via Panta API! ${build.expectedShares || shares.toFixed(1)} ${modal.side.toUpperCase()} shares`);
                    playEnchant(); setTimeout(() => setTradeSuccess(null), 5000); setModal(null);
                  } catch (e: any) { setTradeSuccess(`Error: ${e.message}`); setTimeout(() => setTradeSuccess(null), 5000); }
                } else {
                  wallet.addPosition({
                    marketId: modal.market.marketId, question: modal.market.question, side: modal.side,
                    shares, avgPrice: price, costBasis: Number(amount), currentPrice: price, timestamp: Date.now(), category: modal.market.category,
                  });
                  setTradeSuccess(`[Sandbox] ${shares.toFixed(1)} ${modal.side.toUpperCase()} shares for $${amount}`);
                  playEnchant(); setTimeout(() => setTradeSuccess(null), 4000); setModal(null);
                }
              }}>
                {wallet.network === "mainnet" ? `Trade $${amount} (Real)` : `Trade $${amount} (Sandbox)`}
              </button>
            ) : (
              <button className={modal.side === "yes" ? styles.modalBtnYes : styles.modalBtnNo} onClick={() => wallet.connect()}>
                Connect Wallet to Trade
              </button>
            )}
            <p className={styles.modalNote}>
              Trades settle on Solana via Panta API. Requires Phantom wallet + USDC.
            </p>
          </div>
        </div>
      )}
      {/* Trade Success Toast */}
      {tradeSuccess && (
        <div className={styles.tradeToast}>
          <span>{tradeSuccess}</span>
        </div>
      )}
    </div>
  );
}