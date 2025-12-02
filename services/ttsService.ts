
let repetitionTimer: number | null = null;

export const speak = (text: string, isPriority: boolean = false) => {
  // Always clean up previous state first
  window.speechSynthesis.cancel();
  if (repetitionTimer) {
    clearTimeout(repetitionTimer);
    repetitionTimer = null;
  }

  if (!text) return;

  const REPEAT_COUNT = 3;
  const INTERVAL_MS = 8000;
  let count = 0;

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Default settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality/female voices available in browsers
    const ptVoices = voices.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    
    // Try to match the specific "Natural/Neural" voices requested (e.g., Francisca, Google, etc.)
    let selectedVoice = ptVoices.find(v => 
      v.name.includes('Francisca') || // Microsoft Francisca Online (Natural)
      v.name.includes('Thalita') ||   // Neural voice often available
      v.name.includes('Google Português') || // Google Chrome default female
      v.name.includes('Luciana') || // iOS default
      v.name.includes('Neural') // General indicator of quality
    );
    
    if (!selectedVoice && ptVoices.length > 0) {
      selectedVoice = ptVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // "Regra de Voz (CSV / Prioridade)"
    // Requested: rate="0.94" pitch="+2st"
    if (isPriority) {
      utterance.pitch = 1.2; // approx +2 semitones
      utterance.rate = 0.94; // Specific requested rate for clarity/emphasis
    }

    utterance.onend = () => {
      count++;
      if (count < REPEAT_COUNT) {
        repetitionTimer = window.setTimeout(play, INTERVAL_MS);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded before playing (Chrome issue)
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
        play();
        window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    play();
  }
};
