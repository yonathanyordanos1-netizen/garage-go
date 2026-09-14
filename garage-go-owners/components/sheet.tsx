import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';

// A reliable bottom sheet built on React Native's Modal (no gorhom/portal/worklet
// dependencies, so present() can't silently no-op). Same API as before.
export function Sheet({
  open, onClose, snapPoints = ['50%'], title, description, children,
}: {
  open: boolean; onClose: () => void; snapPoints?: (string | number)[];
  title?: string; description?: string; children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Interpret the first snap point as a target height (fraction or px).
  const first = snapPoints[0];
  let minHeight = height * 0.5;
  if (typeof first === 'number') minHeight = first;
  else if (typeof first === 'string' && first.endsWith('%')) minHeight = (parseFloat(first) / 100) * height;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,16,12,0.45)' }} />

        {/* Panel */}
        {open && (
          <Animated.View
            entering={SlideInDown.duration(240)}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 22, borderTopRightRadius: 22,
              maxHeight: height * 0.9, minHeight,
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Grabber */}
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line2 }} />
            </View>

            {(title || description) && (
              <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                {title && <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>}
                {description && <Text style={{ fontSize: 13, color: colors.muted, marginTop: 3 }}>{description}</Text>}
              </View>
            )}

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
