"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Network = "mainnet" | "devnet";

export interface Position {
  id: string;
  marketId: string;
  question: string;
  side: "yes" | "no";
  shares: number;
  avgPrice: number;
  costBasis: number;
  currentPrice: number;
  timestamp: number;
  category?: string;
}

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string;
  shortAddress: string;
  walletName: string;
  network: Network;
  sandboxBalance: number;
  positions: Position[];
  totalPnl: number;
  totalVolume: number;
  tradeCount: number;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  setNetwork: (n: Network) => void;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
  addPosition: (p: Omit<Position, "id">) => void;
  closePosition: (id: string) => void;
}

const WalletContext = createContext<WalletState>({} as WalletState);
export function useWallet() { return useContext(WalletContext); }

function getProvider(name: string): any {
  if (typeof window === "undefined") return null;
  const w = window as any;
  switch (name) {
    case "phantom": return w.phantom?.solana || w.solana;
    case "solflare": return w.solflare;
    case "backpack": return w.backpack;
    default: return w.phantom?.solana || w.solana;
  }
}

function playSound(freqs: number[], dur: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    freqs.forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i * (dur / freqs.length)));
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch {}
}

const WALLETS = [
  { id: "phantom", name: "Phantom", icon: "\u{1F47B}", color: "#AB9FF2", url: "https://phantom.app" },
  { id: "solflare", name: "Solflare", icon: "\u{2600}\uFE0F", color: "#FC822B", url: "https://solflare.com" },
  { id: "backpack", name: "Backpack", icon: "\u{1F392}", color: "#E33E3F", url: "https://backpack.app" },
];
export { WALLETS };

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [network, setNetwork] = useState<Network>("devnet");
  const [sandboxBalance, setSandboxBalance] = useState(1000);
  const [showPicker, setShowPicker] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  const totalPnl = positions.reduce((sum, p) => {
    const currentVal = p.shares * p.currentPrice;
    return sum + (currentVal - p.costBasis);
  }, 0);

  const connect = useCallback(async (walletType?: string) => {
    if (!walletType) { setShowPicker(true); return; }
    setShowPicker(false);
    setConnecting(true);
    try {
      const provider = getProvider(walletType);
      if (!provider) {
        const w = WALLETS.find(w => w.id === walletType);
        if (w) window.open(w.url, "_blank");
        setConnecting(false);
        return;
      }
      const resp = await provider.connect();
      const pubkey = resp?.publicKey?.toString() || provider.publicKey?.toString() || "";
      if (pubkey) {
        setAddress(pubkey);
        setWalletName(walletType);
        setConnected(true);
        playSound([523, 659, 784, 1047], 0.5);
      }
    } catch (e) { console.error("Wallet error:", e); }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    try { const p = getProvider(walletName); if (p?.disconnect) p.disconnect(); } catch {}
    setConnected(false); setAddress(""); setWalletName("");
    playSound([400, 200], 0.2);
  }, [walletName]);

  const addPosition = useCallback((p: Omit<Position, "id">) => {
    const id = `pos_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setPositions(prev => [...prev, { ...p, id }]);
    setTradeCount(c => c + 1);
    setTotalVolume(v => v + p.costBasis);
    if (network === "devnet") setSandboxBalance(b => b - p.costBasis);
    playSound([523, 659, 784, 1047], 0.4);
  }, [network]);

  const closePosition = useCallback((id: string) => {
    setPositions(prev => {
      const pos = prev.find(p => p.id === id);
      if (pos && network === "devnet") {
        const payout = pos.shares * pos.currentPrice;
        setSandboxBalance(b => b + payout);
      }
      return prev.filter(p => p.id !== id);
    });
    playSound([784, 523], 0.2);
  }, [network]);

  return (
    <WalletContext.Provider value={{
      connected, connecting, address, shortAddress, walletName,
      network, sandboxBalance, positions, totalPnl, totalVolume, tradeCount,
      connect, disconnect, setNetwork, showPicker, setShowPicker,
      addPosition, closePosition,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
export default WalletProvider;