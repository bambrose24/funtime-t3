function hexToRgb(hex: string): [number, number, number] {
  // Remove the leading # if present
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function brightness([r, g, b]: [number, number, number]): number {
  return Math.sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2);
}

export function findBrightestColor(hexColors: string[]): string {
  let brightestColor = hexColors[0];
  if (!brightestColor) {
    return "";
  }
  let maxBrightness = brightness(hexToRgb(brightestColor));

  hexColors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    const currentBrightness = brightness(rgb);
    if (currentBrightness > maxBrightness) {
      maxBrightness = currentBrightness;
      brightestColor = hex;
    }
  });

  return brightestColor;
}
