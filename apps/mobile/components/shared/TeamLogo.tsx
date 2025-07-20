import React from "react";
import { Image, ImageProps } from "react-native";

type Props = Omit<ImageProps, "source"> & {
  abbrev: string;
  width?: number;
  height?: number;
};

export function TeamLogo({ abbrev, width = 24, height = 24, ...rest }: Props) {
  const source = {
    uri: `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev}.png`,
  };

  return (
    <Image
      {...rest}
      source={source}
      style={[{ width, height }, rest.style]}
      resizeMode="contain"
    />
  );
}
