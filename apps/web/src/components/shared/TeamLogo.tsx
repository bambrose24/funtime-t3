"use client";

import Image, { type ImageProps } from "next/image";

export function TeamLogo({
  abbrev,
  width = 24,
  height = 24,
  ...rest
}: Omit<ImageProps, "src" | "alt"> & { abbrev: string }) {
  const src = `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev}.png`;
  // eslint-disable-next-line jsx-a11y/alt-text
  return (
    <Image
      alt={`NFL team logo for ${abbrev}`}
      src={src}
      width={width}
      height={height}
      {...rest}
    />
  );
}
