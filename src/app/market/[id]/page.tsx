"use client";
import styles from "./market.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, use } from "react";
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
  resolutionRule?: string;
}

const catLabels: Record<string, string> = {
  crypto: "\u{1F48E} Crypto", sports: "\u{1F3B9} Sports", politics: "\u{1F3F0} Politics",
  entertainment: "\u{1F3B5} Entertainment", science: "\u{1F9EA} Science", technology: "\u{26A1} Tech",
  stocks: "\u{1F4C8} Stocks", commodities: "\u{26CF} Commodities", macroeconomics: "\u{1F3E6} Macro",
  "pop-culture": "\u{1F3AD} Pop Culture", business: "\u{1F4BC} Business", gaming: "\u{1F3AE} Gaming",
  "space-universe": "\u{1F680} Space", world: "\u{1F5FA} World",
};

function timeLeft(d?: string): string {
  if (!d) return "";
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d left`;
  const hours = Math.floor(diff / 3600000);
  return `${hours}h left`;
}

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<{ side: "yes" | "no" } | null>(null);
  const [amount, setAmount] = useState("10");
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/markets/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setMarket(data.market);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      playEnchant();
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  function shareToX() {
    if (!market) return;
    const yesPct = market.yesPrice ? Math.round(market.yesPrice * 100) : 50;
    const text = `${market.question}\n\nYES ${yesPct}% | NO ${100 - yesPct}%\n\nBet on it 👇\n${shareUrl}\n\nvia @PantaWire`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (loading) {
    return (
      <div className={styles.marketPage}>
        <div className={styles.loadingMsg}>
          <span className={styles.loadDots}>Mining block data...</span>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className={styles.marketPage}>
        <div className={styles.errorMsg}>
          <p className={styles.errorText}>Market not found in the mine.</p>
          <Link href="/feed" className={styles.backLink}>← Back to The Wire</Link>
        </div>
      </div>
    );
  }

  const yesPct = market.yesPrice ? Math.round(market.yesPrice * 100) : 50;
  const noPct = 100 - yesPct;
  const label = catLabels[(market.category || "").toLowerCase()] || (market.category || "misc").toUpperCase();

  return (
    <div className={styles.marketPage}>
      <nav className={styles.hotbar}>
        <div className={styles.hotbarInner}>
          <Link href="/" className={styles.logoWrap}>
            <Image src="/logo.png" alt="PantaWire" width={36} height={36} className={styles.logoImg} />
            <span className={styles.logoText}>PantaWire</span>
          </Link>
          <div className={styles.headerRight}>
            <Link href="/feed" className={styles.mineBtn}>The Wire</Link>
            <Link href="/craft" className={styles.mineBtn}>Craft</Link>
            <Link href="/portfolio" className={styles.mineBtn}>Portfolio</Link>
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
              <button className={styles.walletBtn} onClick={() => wallet.connect()}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      <PixelMonsters />

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

      <div className={styles.content}>
        <Link href="/feed" className={styles.backLink} onClick={() => playClick()}>
          ← Back to The Wire
        </Link>

        {wallet.network === "devnet" && (
          <div className={styles.sandboxBanner}>
            <span className={styles.sandboxBannerText}>⛏ SANDBOX MODE</span>
            <span className={styles.sandboxBannerSub}>— Trade with ${wallet.sandboxBalance} fake USDC. No real money needed!</span>
          </div>
        )}

        <article className={styles.marketCard}>
          <div className={styles.cardHead}>
            <span className={styles.cardCat}>{label}</span>
            {market.isReal && <span className={styles.onChainBadge}>ON-CHAIN</span>}
            {market.endTime && <span className={styles.cardTime}>{timeLeft(market.endTime)}</span>}
          </div>

          {market.imageUrl && (
            <div className={styles.cardImgWrap}>
              <img src={market.imageUrl} alt="" className={styles.cardImg} />
            </div>
          )}

          <div className={styles.cardBody}>
            <h1 className={styles.cardQ}>{market.question}</h1>
            {market.description && <p className={styles.cardDesc}>{market.description}</p>}

            <div className={styles.probWrap}>
              <div className={styles.probLabels}>
                <span className={styles.probYes}>YES {yesPct}%</span>
                <span className={styles.probNo}>NO {noPct}%</span>
              </div>
              <div className={styles.probBarOuter}>
                <div className={styles.probBarYes} style={{ width: `${yesPct}%` }}></div>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Status</div>
                <div className={styles.detailValGreen}>{market.phase || "Active"}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Volume</div>
                <div className={styles.detailValGold}>${(market.volume || 0).toLocaleString()}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>YES Price</div>
                <div className={styles.detailVal}>${(market.yesPrice || 0.5).toFixed(2)}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>NO Price</div>
                <div className={styles.detailVal}>${(market.noPrice || 0.5).toFixed(2)}</div>
              </div>
            </div>

            <div className={styles.tradeRow}>
              <button className={styles.btnYes} onClick={() => { setModal({ side: "yes" }); playChestOpen(); }}>
                Buy YES
              </button>
              <button className={styles.btnNo} onClick={() => { setModal({ side: "no" }); playChestOpen(); }}>
                Buy NO
              </button>
            </div>

            <div className={styles.shareSection}>
              <button className={styles.shareBtn} onClick={copyLink}>
                📋 {copied ? "Copied!" : "Copy Link"}
              </button>
              <button className={styles.shareBtn} onClick={shareToX}>
                𝕏 Share on X
              </button>
              {copied && <span className={styles.shareCopied}>Link copied!</span>}
            </div>
          </div>
        </article>
      </div>

      {modal && market && (
        <div className={styles.modalOverlay} onClick={() => { setModal(null); playPlace(); }}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{modal.side === "yes" ? "Buy YES" : "Buy NO"}</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)}>X</button>
            </div>
            <p className={styles.modalQ}>{market.question}</p>
            <div className={styles.modalRow}>
              <span>Price per share</span>
              <span className={modal.side === "yes" ? styles.valGreen : styles.valRed}>
                {Math.round((modal.side === "yes" ? market.yesPrice || 0.5 : market.noPrice || 0.5) * 100)}%
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
                {(Number(amount) / (modal.side === "yes" ? (market.yesPrice || 0.5) : (market.noPrice || 0.5))).toFixed(1)}
              </span>
            </div>
            <div className={styles.modalRow}>
              <span>Potential payout</span>
              <span className={styles.valGold}>
                ${(Number(amount) / (modal.side === "yes" ? (market.yesPrice || 0.5) : (market.noPrice || 0.5))).toFixed(2)}
              </span>
            </div>
            {wallet.connected ? (
              <button className={modal.side === "yes" ? styles.modalBtnYes : styles.modalBtnNo} onClick={async () => {
                const price = modal.side === "yes" ? (market.yesPrice || 0.5) : (market.noPrice || 0.5);
                const shares = Number(amount) / price;

                if (wallet.network === "mainnet") {
                  try {
                    setTradeSuccess("Quoting via Panta API...");
                    const quoteRes = await fetch("/api/trade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "quote", wallet: wallet.address, marketId: market.marketId, side: modal.side, amountUsdc: amount }),
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
                      marketId: market.marketId, question: market.question, side: modal.side,
                      shares: parseFloat(build.expectedShares || String(shares)), avgPrice: parseFloat(quote.avgPrice || String(price)),
                      costBasis: Number(amount), currentPrice: price, timestamp: Date.now(), category: market.category,
                    });
                    setTradeSuccess(`Order via Panta API! ${build.expectedShares || shares.toFixed(1)} ${modal.side.toUpperCase()} shares`);
                    playEnchant(); setTimeout(() => setTradeSuccess(null), 5000); setModal(null);
                  } catch (e: any) { setTradeSuccess(`Error: ${e.message}`); setTimeout(() => setTradeSuccess(null), 5000); }
                } else {
                  wallet.addPosition({
                    marketId: market.marketId, question: market.question, side: modal.side,
                    shares, avgPrice: price, costBasis: Number(amount), currentPrice: price, timestamp: Date.now(), category: market.category,
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
              {wallet.network === "devnet"
                ? "Sandbox mode — no real money needed. Free to try!"
                : "Trades settle on Solana via Panta API. Requires Phantom wallet + USDC."}
            </p>
          </div>
        </div>
      )}

      {tradeSuccess && (
        <div className={styles.tradeToast}>
          <span>{tradeSuccess}</span>
        </div>
      )}
    </div>
  );
}
