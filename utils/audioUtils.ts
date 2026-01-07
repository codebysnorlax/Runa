// Audio utility for playing sound effects
export const playClickSound = () => {
  try {
    const audio = new Audio('/Runa/audio/click.wav');
    audio.volume = 0.3; // Set volume to 30%
    audio.play().catch(() => {}); // Ignore errors
  } catch (error) {
    // Silently handle error
  }
};

export const playErrorSound = () => {
  try {
    const audio = new Audio('/Runa/audio/error.wav');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors
  } catch (error) {
    // Silently handle error
  }
};
