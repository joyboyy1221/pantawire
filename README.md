# PantaWire - Minecraft-Themed Prediction Markets

> Mine blocks. Craft predictions. Trade on-chain. Built on Panta API + Solana.

## What is PantaWire?

PantaWire is a gamified prediction market experience that transforms how users discover, create, and trade prediction markets. Instead of a boring trading dashboard, users **mine blocks** to discover markets, use a **crafting table** to create predictions, and trade with real USDC on Solana — all wrapped in a Minecraft-inspired pixel art interface.

## Panta API Integration

PantaWire deeply integrates with the [Panta API](https://docs.panta.market/) across the entire application:

### Market Discovery & Data
- `GET /markets/` — Fetches all live prediction markets with pagination
- `GET /markets/{marketId}/` — Fetches detailed market data including on-chain `question`, `resolutionRule`, prices, volume, and status

### Trading (Primary Buy Flow)
- `POST /primaryorderquote/` — Quotes a YES/NO fill on the bonding curve with estimated shares and fees
- `POST /primaryorderbuild/` — Builds unsigned Solana transaction instructions from a live quote
- `POST /primaryordersubmit/` — Registers the broadcast signature for async confirmation
- `POST /primaryorderverify/` — Checks order confirmation status

### Portfolio & Positions
- `GET /positions/?wallet=` — Fetches on-chain USDC market holdings for a connected wallet
- Enriches positions with market detail data for P&L estimation

### Categories
- `GET /categories/` — Fetches available market categories for filtering

## Features

### The Wire (Feed)
Live prediction market feed with real-time prices from Panta API. Filter by category, search markets, view odds bars, and trade directly.

### Mining Game (/mine)
5x5 block grid mini-game where users mine blocks to discover real prediction markets. Features pickaxe progression, combo system, and procedural audio.

### Crafting Table (/craft)
Minecraft crafting table UI where users define prediction questions, select categories, set durations, and adjust starting odds to create markets.

### Portfolio (/portfolio)
Full trading dashboard showing:
- Sandbox balance & total P&L
- Trade volume & count with win rate
- Active positions table (local + on-chain from Panta API)
- Position management (sell/close)

### Multi-Wallet Support
Connect Phantom, Solflare, or Backpack wallets directly via browser provider APIs.

### Mainnet/Sandbox Toggle
- **Sandbox**: $1,000 fake USDC for risk-free practice trading
- **Mainnet**: Real USDC trading through Panta API quote→build→sign flow

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Blockchain**: Solana (via Panta API)
- **Wallets**: Phantom, Solflare, Backpack (browser injection)
- **Styling**: CSS Modules with Minecraft pixel-art theme
- **Audio**: Web Audio API (8-bit procedural sounds)
- **Deployment**: Vercel

## Getting Started

```bash
npm install
# Add your Panta API key
echo "PANTA_API_KEY=pk_live_..." > .env.local
npm run dev
```

## Links
- [Panta API Docs](https://docs.panta.market/)
- [Panta Market](https://panta.market)
- [GitHub](https://github.com/joyboyy1221/pantawire)