import type { Metadata } from "next";
import "./globals.css";
import SoundProvider from "@/components/SoundProvider";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "PantaWire | Minecraft-Style Prediction Markets on Solana",
  description: "Trade prediction markets in a Minecraft-themed experience. Powered by Panta API on Solana.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Silkscreen:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SoundProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </SoundProvider>
      </body>
    </html>
  );
}