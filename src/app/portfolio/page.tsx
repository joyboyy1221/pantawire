"use client";
import styles from "./portfolio.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useWallet, WALLETS } from "@/components/WalletProvider";
import PixelMonsters from "@/components/PixelMonsters";

export default function PortfolioPage() {
  const wallet = useWallet();
  const [chainPositions, setChainPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setLoadingPositions(true);
      fetch(`/api/positions?wallet=${wallet.address}`)
        .then(r => r.json())
        .then(data => { if (data.positions) setChainPositions(data.positions); })
        .catch(() => {})
        .finally(() => setLoadingPositions(false));
    }
  }, [wallet.connected, wallet.address]);

  const winRate = wallet.tradeCount > 0
    ? Math.round((wallet.positions.filter(p => (p.shares * p.currentPrice - p.costBasis) > 0).length / Math.max(wallet.tradeCount, 1)) * 100)
    : 0;

  return (
    <div className={styles.world}>
      <PixelMonsters />

      <nav className={styles.topBar}>
        <Link href="/feed" className={styles.backBtn}>{"< Back to Feed"}</Link>
        <div className={styles.logoArea}>
          <Image src="/logo.png" alt="PantaWire" width={28} height={28} style={{borderRadius: "4px"}} />
          <span className={styles.logoText}>Portfolio</span>
        </div>
        <div className={styles.walletInfo}>
          {wallet.connected ? (
            <span className={styles.addrBadge}>{wallet.shortAddress}</span>
          ) : (
            <button className={styles.connectBtn} onClick={() => wallet.connect()}>Connect</button>
          )}
        </div>
      </nav>

      <div className={styles.container}>
        {/* Stats Cards */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>{"\u{1F4B0}"}</div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Balance</span>
              <span className={styles.statValue}>
                {wallet.network === "devnet" ? `$${wallet.sandboxBalance.toFixed(2)}` : "--"}
              </span>
              <span className={styles.statSub}>{wallet.network === "devnet" ? "Sandbox USDC" : "Connect to view"}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>{"\u{1F4C8}"}</div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total P&L</span>
              <span className={`${styles.statValue} ${wallet.totalPnl >= 0 ? styles.pnlUp : styles.pnlDown}`}>
                {wallet.totalPnl >= 0 ? "+" : ""}{wallet.totalPnl.toFixed(2)} USDC
              </span>
              <span className={styles.statSub}>Unrealized</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>{"\u{1F4CA}"}</div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Volume</span>
              <span className={styles.statValue}>${wallet.totalVolume.toFixed(2)}</span>
              <span className={styles.statSub}>Total traded</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>{"\u{26CF}\uFE0F"}</div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Trades</span>
              <span className={styles.statValue}>{wallet.tradeCount}</span>
              <span className={styles.statSub}>{winRate}% win rate</span>
            </div>
          </div>
        </div>

        {/* Active Positions */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{"\u{2694}\uFE0F"} Active Positions</h2>
            <span className={styles.posCount}>{wallet.positions.length} open</span>
          </div>

          {wallet.positions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{"\u{1F4E6}"}</div>
              <h3>Inventory Empty</h3>
              <p>No positions yet. Go to the feed and start trading!</p>
              <Link href="/feed" className={styles.goTradeBtn}>Go Trade</Link>
            </div>
          ) : (
            <div className={styles.positionsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colMarket}>Market</span>
                <span className={styles.colSide}>Side</span>
                <span className={styles.colShares}>Shares</span>
                <span className={styles.colEntry}>Entry</span>
                <span className={styles.colCost}>Cost</span>
                <span className={styles.colPnl}>P&L</span>
                <span className={styles.colAction}>Action</span>
              </div>
              {wallet.positions.map(p => {
                const pnl = p.shares * p.currentPrice - p.costBasis;
                const pnlPct = ((p.currentPrice - p.avgPrice) / p.avgPrice * 100);
                return (
                  <div key={p.id} className={styles.tableRow}>
                    <span className={styles.colMarket}>
                      <span className={styles.rowQ}>{p.question.slice(0, 45)}{p.question.length > 45 ? "..." : ""}</span>
                      {p.category && <span className={styles.rowCat}>{p.category}</span>}
                    </span>
                    <span className={styles.colSide}>
                      <span className={p.side === "yes" ? styles.sideYes : styles.sideNo}>{p.side.toUpperCase()}</span>
                    </span>
                    <span className={styles.colShares}>{p.shares.toFixed(1)}</span>
                    <span className={styles.colEntry}>{(p.avgPrice * 100).toFixed(0)}%</span>
                    <span className={styles.colCost}>${p.costBasis.toFixed(2)}</span>
                    <span className={`${styles.colPnl} ${pnl >= 0 ? styles.pnlUp : styles.pnlDown}`}>
                      {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                      <small> ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</small>
                    </span>
                    <span className={styles.colAction}>
                      <button className={styles.sellBtn} onClick={() => wallet.closePosition(p.id)}>Sell</button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* On-Chain Positions (from Panta API) */}
        {wallet.connected && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{"\u{26D3}\uFE0F"} On-Chain Positions (Panta API)</h2>
              <span className={styles.posCount}>{loadingPositions ? "Loading..." : `${chainPositions.length} found`}</span>
            </div>
            {chainPositions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{loadingPositions ? "Fetching from Panta..." : "No on-chain positions found for this wallet"}</p>
              </div>
            ) : (
              <div className={styles.positionsTable}>
                <div className={styles.tableHeader}>
                  <span className={styles.colMarket}>Market</span>
                  <span className={styles.colSide}>Side</span>
                  <span className={styles.colShares}>Shares</span>
                  <span className={styles.colEntry}>Phase</span>
                  <span className={styles.colPnl}>Est. Value</span>
                </div>
                {chainPositions.map((p: any, i: number) => (
                  <div key={i} className={styles.tableRow}>
                    <span className={styles.colMarket}>
                      <span className={styles.rowQ}>{(p.question || "").slice(0, 45)}</span>
                    </span>
                    <span className={styles.colSide}>
                      <span className={p.side === "yes" ? styles.sideYes : styles.sideNo}>{p.side?.toUpperCase()}</span>
                    </span>
                    <span className={styles.colShares}>{parseFloat(p.shares || "0").toFixed(1)}</span>
                    <span className={styles.colEntry}>{p.phase}</span>
                    <span className={`${styles.colPnl} ${styles.pnlUp}`}>
                      ${(p.estValueUsdc || 0).toFixed(2)}
                      {p.claimable && <small> (Claimable!)</small>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trade History Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{"\u{1F4DC}"} Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Total Invested</span>
              <span className={styles.sumValue}>${wallet.positions.reduce((s, p) => s + p.costBasis, 0).toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Current Value</span>
              <span className={styles.sumValue}>${wallet.positions.reduce((s, p) => s + p.shares * p.currentPrice, 0).toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Avg Position Size</span>
              <span className={styles.sumValue}>${wallet.positions.length ? (wallet.positions.reduce((s, p) => s + p.costBasis, 0) / wallet.positions.length).toFixed(2) : "0.00"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Network</span>
              <span className={wallet.network === "mainnet" ? styles.sumMainnet : styles.sumDevnet}>
                {wallet.network === "mainnet" ? "MAINNET" : "SANDBOX"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}