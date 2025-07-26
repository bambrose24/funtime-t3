import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: any;
}

function Skeleton({ className, style, ...props }: SkeletonProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={cn('bg-gray-200 dark:bg-zinc-700', className)}
      {...props}
    />
  );
}

export { Skeleton };