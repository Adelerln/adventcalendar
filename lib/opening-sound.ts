/**
 * Génère un son magique et festif pour l'ouverture d'une case
 * Ambiance Noël magique avec clochettes et paillettes
 */
export function playOpeningSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  const duration = 2.8;

  // Gain master
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(0.25, now);
  masterGain.gain.setValueAtTime(0.25, now + duration - 0.6);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // 🎅 ARPÈGE MAGIQUE DE NOËL - Mélodie montante joyeuse
  const christmasArpeggio = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 0.08 },   // E5
    { freq: 783.99, time: 0.16 },   // G5
    { freq: 1046.50, time: 0.24 },  // C6 - Effet de clochette
  ];
  
  christmasArpeggio.forEach(({ freq, time }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    const startTime = now + time;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + 0.8);
  });

  // ❄️ PAILLETTES MAGIQUES - Sons scintillants continus
  for (let i = 0; i < 25; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    const sparkleFreq = 1400 + Math.random() * 2000;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(sparkleFreq, now);
    
    const startTime = now + 0.3 + Math.random() * (duration - 0.8);
    const sparkDuration = 0.12 + Math.random() * 0.18;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.1, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + sparkDuration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + sparkDuration + 0.05);
  }

  // 🔔 CLOCHETTES DE NOËL - Série de clochettes joyeuses
  const bellSequence = [
    { freq: 1318.51, time: 0.4 },   // E6
    { freq: 1567.98, time: 0.6 },   // G6
    { freq: 1318.51, time: 0.8 },   // E6
    { freq: 1046.50, time: 1.0 },   // C6
    { freq: 1568.00, time: 1.3 },   // G6
    { freq: 2093.00, time: 1.6 },   // C7 - Note haute festive
  ];
  
  bellSequence.forEach(({ freq, time }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);
    
    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.5);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now + time);
    osc.stop(now + time + 0.6);
  });

  // ⭐ ACCORD FINAL MAGIQUE - Accord de Noël qui résonne
  const magicChord = [
    { freq: 523.25, delay: 0 },    // C5
    { freq: 659.25, delay: 0.05 }, // E5
    { freq: 783.99, delay: 0.1 },  // G5
    { freq: 1046.50, delay: 0.15 },// C6
  ];
  
  magicChord.forEach(({ freq, delay }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    
    const startTime = now + 1.8 + delay;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.2);
    gain.gain.setValueAtTime(0.15, now + duration - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(now + duration);
  });
}
