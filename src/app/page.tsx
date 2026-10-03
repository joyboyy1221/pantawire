import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import PixelMonsters from "@/components/PixelMonsters";

export default function LandingPage() {
  return (
    <div className={styles.world}>
      <div className={styles.particles}>
        {Array.from({length: 20}).map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}></div>
        ))}
      </div>

      <PixelMonsters />

      <nav className={styles.hotbar}>
        <div className={styles.hotbarInner}>
          <div className={styles.logoWrap}>
            <Image src="/logo.png" alt="PantaWire" width={36} height={36} style={{borderRadius: "4px"}} />
            <span className={styles.logoText}>PantaWire</span>
          </div>
          <div className={styles.hotbarSlots}>
            <Link href="/craft" className={styles.hotbarSlot} title="Craft Market">
              <span className={styles.slotIcon}>{"\u{2692}\uFE0F"}</span>
            </Link>
            <Link href="/mine" className={styles.hotbarSlot} title="Mine Predictions">
              <span className={styles.slotIcon}>{"\u{26CF}\uFE0F"}</span>
            </Link>
            <Link href="/feed" className={styles.hotbarSlot} title="The Feed">
              <span className={styles.slotIcon}>{"\u{1F4F0}"}</span>
            </Link>
            <a href="https://panta.market" target="_blank" rel="noopener" className={styles.hotbarSlot} title="Panta">
              <span className={styles.slotIcon}>{"\u{1F517}"}</span>
            </a>
            <a href="https://docs.panta.market" target="_blank" rel="noopener" className={styles.hotbarSlot} title="Docs">
              <span className={styles.slotIcon}>{"\u{1F4D6}"}</span>
            </a>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.blocks3d}>
          <div className={`${styles.block3d} ${styles.block1}`}>
            <div className={styles.cubeWrap}><div className={styles.cube}>
              <div className={`${styles.face} ${styles.fTop}`}></div>
              <div className={`${styles.face} ${styles.fFront}`}></div>
              <div className={`${styles.face} ${styles.fRight}`}></div>
              <div className={`${styles.face} ${styles.fBack}`}></div>
              <div className={`${styles.face} ${styles.fLeft}`}></div>
              <div className={`${styles.face} ${styles.fBottom}`}></div>
            </div></div>
          </div>
          <div className={`${styles.block3d} ${styles.block2}`}>
            <div className={styles.cubeWrap}><div className={`${styles.cube} ${styles.cubeDiamond}`}>
              <div className={`${styles.face} ${styles.fTop}`}></div>
              <div className={`${styles.face} ${styles.fFront}`}></div>
              <div className={`${styles.face} ${styles.fRight}`}></div>
              <div className={`${styles.face} ${styles.fBack}`}></div>
              <div className={`${styles.face} ${styles.fLeft}`}></div>
              <div className={`${styles.face} ${styles.fBottom}`}></div>
            </div></div>
          </div>
          <div className={`${styles.block3d} ${styles.block3}`}>
            <div className={styles.cubeWrap}><div className={`${styles.cube} ${styles.cubeGold}`}>
              <div className={`${styles.face} ${styles.fTop}`}></div>
              <div className={`${styles.face} ${styles.fFront}`}></div>
              <div className={`${styles.face} ${styles.fRight}`}></div>
              <div className={`${styles.face} ${styles.fBack}`}></div>
              <div className={`${styles.face} ${styles.fLeft}`}></div>
              <div className={`${styles.face} ${styles.fBottom}`}></div>
            </div></div>
          </div>
          <div className={`${styles.block3d} ${styles.block4}`}>
            <div className={styles.cubeWrap}><div className={`${styles.cube} ${styles.cubeRedstone}`}>
              <div className={`${styles.face} ${styles.fTop}`}></div>
              <div className={`${styles.face} ${styles.fFront}`}></div>
              <div className={`${styles.face} ${styles.fRight}`}></div>
              <div className={`${styles.face} ${styles.fBack}`}></div>
              <div className={`${styles.face} ${styles.fLeft}`}></div>
              <div className={`${styles.face} ${styles.fBottom}`}></div>
            </div></div>
          </div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.enchantBadge}>
            <span>ENCHANTED WITH PANTA API</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine1}>PREDICTION</span>
            <span className={styles.titleLine2}>MARKETS</span>
            <span className={styles.titleLine3}>CRAFTED.</span>
          </h1>
          <p className={styles.heroSub}>
            Mine the odds. Craft your trades. Every headline is a live prediction market on Solana.
          </p>
          <div className={styles.menuBtns}>
            <Link href="/feed" className={styles.mcBtnBig}>
              <span className={styles.mcBtnText}>Enter the Wire</span>
            </Link>
            <Link href="/mine" className={styles.mcBtnBig2}>
              <span className={styles.mcBtnText}>Mine Predictions</span>
            </Link>
          </div>
          <div className={styles.splashWrap}>
            <span className={styles.splash}>Now with bonding curves!</span>
          </div>
        </div>
      </section>

      <section className={styles.craftSection}>
        <h2 className={styles.sectionTitle}>Crafting Recipe</h2>
        <p className={styles.sectionSub}>How to craft a prediction trade</p>
        <div className={styles.craftingTable}>
          <div className={styles.craftGrid}>
            <div className={styles.craftSlot}>
              <div className={styles.craftItem}>{"\u{1F4F0}"}</div>
              <span className={styles.craftLabel}>News</span>
            </div>
            <div className={styles.craftSlot}>
              <div className={styles.craftItem}>{"\u{1F3B2}"}</div>
              <span className={styles.craftLabel}>Odds</span>
            </div>
            <div className={styles.craftSlot}>
              <div className={styles.craftItem}>{"\u{1F4B0}"}</div>
              <span className={styles.craftLabel}>USDC</span>
            </div>
          </div>
          <div className={styles.craftArrow}>{"\u27A1\uFE0F"}</div>
          <div className={styles.craftResult}>
            <div className={styles.craftSlotResult}>
              <div className={styles.craftItem}>{"\u{1F48E}"}</div>
              <span className={styles.craftLabel}>Profit</span>
            </div>
          </div>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>I</div>
            <h3>Mine the News</h3>
            <p>Browse prediction markets presented as a live news feed from Panta API.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>II</div>
            <h3>Read the Odds</h3>
            <p>See YES/NO prices powered by on-chain bonding curves on Solana.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>III</div>
            <h3>Craft Your Trade</h3>
            <p>Connect wallet, buy shares, and claim USDC when markets resolve.</p>
          </div>
        </div>
      </section>

      <section className={styles.inventorySection}>
        <h2 className={styles.sectionTitle}>Inventory</h2>
        <div className={styles.inventoryGrid}>
          <div className={styles.invSlot}>
            <div className={styles.invIcon}>{"\u{26CF}\uFE0F"}</div>
            <div className={styles.invInfo}>
              <h3 className={styles.invName}>Real-Time Mining</h3>
              <p className={styles.invLore}>Live markets from Panta API</p>
            </div>
          </div>
          <div className={styles.invSlot}>
            <div className={styles.invIcon}>{"\u{26D3}\uFE0F"}</div>
            <div className={styles.invInfo}>
              <h3 className={styles.invName}>On-Chain Settlement</h3>
              <p className={styles.invLore}>All trades on Solana in USDC</p>
            </div>
          </div>
          <div className={styles.invSlot}>
            <div className={styles.invIcon}>{"\u{1F4F0}"}</div>
            <div className={styles.invInfo}>
              <h3 className={styles.invName}>News-First UX</h3>
              <p className={styles.invLore}>Markets as stories, not tables</p>
            </div>
          </div>
          <div className={styles.invSlot}>
            <div className={styles.invIcon}>{"\u{1F3C6}"}</div>
            <div className={styles.invInfo}>
              <h3 className={styles.invName}>Claim Winnings</h3>
              <p className={styles.invLore}>Predict right, earn USDC</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to mine some predictions?</h2>
        <Link href="/feed" className={styles.mcBtnBig}>
          <span className={styles.mcBtnText}>Start Mining</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerText}>PantaWire - Minecraft Edition</span>
          <span className={styles.footerMuted}>Built for Colosseum Hackathon | Panta API Sidetrack</span>
        </div>
      </footer>
    </div>
  );
}