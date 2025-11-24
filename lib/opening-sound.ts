/**
 * Génère un son magique et festif pour l'ouverture d'une case
 * Paillettes scintillantes continues pendant toute l'animation d'ouverture
 */
export function playOpeningSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  const duration = 2.5; // Durée totale pour accompagner l'animation

  // Gain master
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(0.3, now);
  // Fade out progressif à la fin
  masterGain.gain.setValueAtTime(0.3, now + duration - 0.5);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // ✨ ARPÈGE MAGIQUE INITIAL - Monte rapidement comme des paillettes
  const magicNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
  magicNotes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    const startTime = now + i * 0.06;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  });

  // � PAILLETTES CONTINUES - Effet scintillant tout au long de l'ouverture
  for (let i = 0; i < 20; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Fréquences variées pour effet de paillettes magiques
    const sparkleFreq = 1200 + Math.random() * 1800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(sparkleFreq, now);
    
    const startTime = now + 0.2 + Math.random() * (duration - 0.5);
    const sparkDuration = 0.1 + Math.random() * 0.15;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.08, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + sparkDuration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + sparkDuration + 0.05);
  }

  // 🔔 CLOCHETTES MULTIPLES - Sons de fête espacés
  const bellTimes = [0.3, 0.6, 0.9, 1.2, 1.5];
  const bellFreqs = [1567.98, 1975.53, 2093.00, 2349.32, 2637.02]; // G6, B6, C7, D7, E7
  
  bellTimes.forEach((time, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bellFreqs[i], now + time);
    
    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.6);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now + time);
    osc.stop(now + time + 0.7);
  });

  // 🌟 ACCORD FINAL MAGIQUE - Résonne jusqu'à la fin
  const finalChord = [1046.50, 1318.51, 1567.98]; // C6, E6, G6 - Accord joyeux
  finalChord.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'triangle'; // Son plus doux
    osc.frequency.setValueAtTime(freq, now);
    
    const startTime = now + 0.5;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.3);
    gain.gain.setValueAtTime(0.12, now + duration - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(now + duration);
  });
}
