# PantaWire — Minecraft-Themed Prediction Markets on Solana

> Mine blocks. Craft predictions. Trade on-chain. Share your bets. Built on Panta API + Solana.

🔗 **Live**: [pantawire.vercel.app](https://pantawire.vercel.app)

## What is PantaWire?

PantaWire is a gamified prediction market experience that transforms how users discover, create, and trade prediction markets. Instead of a boring trading dashboard, users **mine blocks** to discover markets, use a **crafting table** to create predictions, and trade with real USDC on Solana — all wrapped in a Minecraft-inspired pixel art interface.

**No funds? No problem.** PantaWire defaults to **Sandbox mode** with $1,000 test USDC so anyone can trade instantly without a wallet or real money.

## Panta API Integration

PantaWire deeply integrates with the [Panta API](https://docs.panta.market/) across the entire application:

### Market Discovery & Data
- `GET /markets/` — Fetches all live prediction markets with pagination
- `GET /markets/{marketId}/` — Fetches detailed market data including on-chain `question`, `resolutionRule`, prices, volume, and status

### Trading (Primary Buy Flow — Full Pipeline)
- `POST /primaryorderquote/` — Quotes a YES/NO fill on the bonding curve with estimated shares and fees
- `POST /primaryorderbuild/` — Builds unsigned Solana transaction instructions from a live quote
- **Phantom Wallet Signing** — Deserializes the unsigned transaction (VersionedTransaction/Legacy), prompts user signature via Phantom/Solflare/Backpack
- `POST /primaryordersubmit/` — Submits the signed transaction for on-chain execution
- `POST /primaryorderverify/` — Checks order confirmation status

### Pre-Trade Balance Check
- Reads USDC balance directly from Solana RPC (`getTokenAccountsByOwner` with USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) before trade execution
- Shows actual wallet balance in error messages if insufficient

### Portfolio & Positions
- `GET /positions/?wallet=` — Fetches on-chain USDC market holdings for a connected wallet
- Enriches positions with market detail data for P&L estimation

### Categories
- `GET /categories/` — Fetches available market categories for filtering

## Features

### 🔗 Shareable Prediction Links
Every prediction market has a unique shareable page at `/market/[id]`:
- **Direct links** — Share any bet via `pantawire.vercel.app/market/{marketId}`
- **Copy Link** button on every market card (feed + detail page)
- **Share on X** — Pre-written tweet with YES/NO odds and link
- **Full trading UI** on shared pages — recipients can trade immediately

### 📡 The Wire (Feed)
Live prediction market feed with real-time prices from Panta API. Filter by category, search markets, view probability bars, and trade directly. Clickable market titles and images link to shareable detail pages.

### ⛏ Mining Game (/mine)
5×5 block grid mini-game where users mine blocks to discover real prediction markets. Features pickaxe progression, combo system, and procedural audio.

### 🔨 Crafting Table (/craft)
Minecraft crafting table UI where users define prediction questions, select categories, set durations, and adjust starting odds to create markets.

### 📊 Portfolio (/portfolio)
Full trading dashboard showing:
- Sandbox balance & total P&L
- Trade volume & count with win rate
- Active positions table (local + on-chain from Panta API)
- Position management (sell/close)

### 💼 Multi-Wallet Support
Connect Phantom, Solflare, or Backpack wallets directly via browser provider APIs. Auto-detects installed wallets.

### 🔄 Mainnet / Sandbox Toggle
- **Sandbox** (default): $1,000 fake USDC for risk-free practice trading. No wallet needed.
- **Mainnet**: Real USDC trading through full Panta API pipeline:
  1. Check USDC balance on-chain via Solana RPC
  2. Quote → Build unsigned transaction
  3. Phantom wallet opens to sign
  4. Submit signed transaction on-chain
  5. Verify confirmation
- **Insufficient funds UX**: Styled in-modal error shows actual wallet balance with options to switch to Sandbox or get USDC via Jupiter

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Blockchain | Solana (via Panta API + @solana/web3.js) |
| Wallets | Phantom, Solflare, Backpack (browser injection) |
| Styling | CSS Modules with Minecraft pixel-art theme |
| Audio | Web Audio API (8-bit procedural sounds) |
| Fonts | Press Start 2P, VT323, Silkscreen |
| Deployment | Vercel (auto-deploy from GitHub) |

## Architecture

```
pantawire.vercel.app
├── / .................... Landing page (Minecraft-themed hero)
├── /feed ................ Live market feed (The Wire)
│   ├── Share buttons (🔗 copy link per card)
│   └── Clickable titles → /market/[id]
├── /market/[id] ......... Shareable market detail page
│   ├── Full trading UI (Buy YES/NO)
│   ├── Copy Link + Share on X buttons
│   └── Market stats (volume, phase, odds)
├── /mine ................ Mining mini-game
├── /craft ............... Market creation (crafting table)
├── /portfolio ........... Positions & P&L dashboard
└── /api
    ├── /markets ......... Proxy to Panta API markets
    ├── /markets/[id] .... Single market fetch
    ├── /categories ...... Panta categories
    └── /trade ........... Quote → Build → Submit → Verify
```

## Getting Started

```bash
npm install
# Add your Panta API key
echo "PANTA_API_KEY=pk_live_..." > .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000) — starts in Sandbox mode by default.

## Links
- 🌐 **Live App**: [pantawire.vercel.app](https://pantawire.vercel.app)
- 📖 **Panta API Docs**: [docs.panta.market](https://docs.panta.market/)
- 🏪 **Panta Market**: [panta.market](https://panta.market)
- 💻 **GitHub**: [github.com/joyboyy1221/pantawire](https://github.com/joyboyy1221/pantawire)

## Hackathon Submission

Built for the **Crypto World's Fair Hackathon** on [Colosseum](https://colosseum.com). PantaWire transforms prediction markets from boring dashboards into an engaging, gamified experience — making trading accessible to crypto newcomers through familiar Minecraft mechanics and risk-free Sandbox mode.