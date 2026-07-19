import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageStyle } from 'expo-image';
import { useState } from 'react';
import { View, type StyleProp } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

interface SpotImageProps {
  uri?: string;
  style: StyleProp<ImageStyle>;
  transition?: number;
  fallbackIcon?: React.ComponentProps<typeof Ionicons>['name'];
  fallbackIconSize?: number;
}

// 원격 이미지가 없거나 로딩에 실패하면(오프라인 등) 잎사귀 폴백을 보여준다
export function SpotImage({
  uri,
  style,
  transition = 200,
  fallbackIcon = 'leaf-outline',
  fallbackIconSize = 24,
}: SpotImageProps) {
  const c = useThemeColors();
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || failedUri === uri) {
    return (
      <View
        style={[
          style,
          { backgroundColor: c.sageSoft, alignItems: 'center', justifyContent: 'center' },
        ]}>
        <Ionicons name={fallbackIcon} size={fallbackIconSize} color={c.sageLight} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: c.sageSoft }, style]}
      contentFit="cover"
      transition={transition}
      onError={() => setFailedUri(uri)}
    />
  );
}
