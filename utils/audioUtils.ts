// Audio utility for playing sound effects
export const playClickSound = () => {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/click.wav`);
    audio.volume = 0.3; // Set volume to 30%
    audio.play().catch(() => {}); // Ignore errors
  } catch (error) {
    // Silently handle error
  }
};

export const playErrorSound = () => {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/error.wav`);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors
  } catch (error) {
    // Silently handle error
  }
};
