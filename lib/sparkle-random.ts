export function sparkleRandom(index: number, offset = 0) {
  const x = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

