export const playSound = (src) => {
  const audio = new Audio(src);

  audio.volume = 0.4;

  audio.play();
};