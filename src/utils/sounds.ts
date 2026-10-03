// Minecraft-style sound effects using Web Audio API
// No external files needed - all procedurally generated

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", vol: number = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration: number, vol: number = 0.08) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * vol;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {}
}

export function playClick() {
  playTone(1200, 0.06, "square", 0.12);
  setTimeout(() => playTone(1500, 0.04, "square", 0.08), 30);
}

export function playHover() {
  playTone(800, 0.03, "square", 0.06);
}

export function playPlace() {
  playNoise(0.08, 0.12);
  playTone(300, 0.06, "square", 0.06);
}

export function playXP() {
  playTone(600, 0.08, "square", 0.1);
  setTimeout(() => playTone(800, 0.08, "square", 0.1), 60);
  setTimeout(() => playTone(1000, 0.12, "square", 0.08), 120);
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "square", 0.1), i * 100);
  });
}

export function playPickup() {
  playTone(1200, 0.05, "square", 0.1);
  setTimeout(() => playTone(1600, 0.05, "square", 0.08), 40);
}

export function playDamage() {
  playTone(200, 0.1, "sawtooth", 0.12);
  setTimeout(() => playTone(150, 0.12, "sawtooth", 0.1), 60);
}

export function playChestOpen() {
  playTone(300, 0.08, "square", 0.08);
  setTimeout(() => playTone(450, 0.1, "square", 0.08), 80);
}

export function playEnchant() {
  playTone(440, 0.2, "sine", 0.08);
  playTone(554, 0.2, "sine", 0.06);
  playTone(659, 0.2, "sine", 0.06);
  setTimeout(() => {
    playTone(880, 0.3, "sine", 0.06);
    playTone(1108, 0.3, "sine", 0.04);
  }, 150);
}

export function playTradeConfirm() {
  playTone(523, 0.1, "square", 0.1);
  setTimeout(() => playTone(659, 0.1, "square", 0.1), 80);
  setTimeout(() => playTone(784, 0.15, "square", 0.12), 160);
}

export function playNavigate() {
  playTone(600, 0.06, "square", 0.08);
  setTimeout(() => playTone(900, 0.08, "square", 0.06), 50);
}
