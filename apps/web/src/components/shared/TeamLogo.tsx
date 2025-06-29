"use client";

import Image, { type ImageProps } from "next/image";

export function TeamLogo({
  abbrev,
  ...rest
}: Partial<ImageProps> & { abbrev: string }) {
  const width = rest.width ?? 24;
  const height = rest.height ?? 24;
  const alt = rest.alt ?? `NFL team logo for ${abbrev}`;
  const src =
    rest.src ?? `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev}.png`;
  return <Image {...rest} alt={alt} src={src} width={width} height={height} />;
}
