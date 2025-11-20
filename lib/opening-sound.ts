/**
 * Génère un son festif-magique-émotionnel pour l'ouverture d'une case
 * Combine clochettes, effet sparkle et accord chaleureux
 */
export function playOpeningSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;

  // Gain master
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(0.3, now);

  // 🔔 CLOCHETTES - Sons aigus festifs
  const bellFrequencies = [1318.51, 1567.98, 2093.00]; // E6, G6, C7 - Accord joyeux
  bellFrequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Envelope ADSR pour effet clochette
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01 + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now + i * 0.05);
    osc.stop(now + 1.5);
  });

  // ✨ SPARKLE - Effet magique de paillettes
  for (let i = 0; i < 8; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Fréquences aléatoires dans les aigus pour effet scintillant
    const sparkleFreq = 2000 + Math.random() * 1500;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(sparkleFreq, now);
    
    const startTime = now + 0.1 + Math.random() * 0.4;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  // 🎹 ACCORD CHALEUREUX - Base émotionnelle
  // Accord de Do Majeur enrichi (C4, E4, G4, C5)
  const chordFrequencies = [261.63, 329.63, 392.00, 523.25];
  chordFrequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'triangle'; // Son plus doux et chaleureux
    osc.frequency.setValueAtTime(freq, now);
    
    // Montée douce et tenue longue pour l'émotion
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.setValueAtTime(0.15, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 2);
  });

  // 🌟 RÉSONANCE FINALE - Petite touche magique finale
  const finalOsc = audioContext.createOscillator();
  const finalGain = audioContext.createGain();
  
  finalOsc.type = 'sine';
  finalOsc.frequency.setValueAtTime(1046.50, now + 0.5); // C6 - Note haute et pure
  
  finalGain.gain.setValueAtTime(0, now + 0.5);
  finalGain.gain.linearRampToValueAtTime(0.2, now + 0.55);
  finalGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
  
  finalOsc.connect(finalGain);
  finalGain.connect(masterGain);
  
  finalOsc.start(now + 0.5);
  finalOsc.stop(now + 2.5);
}
