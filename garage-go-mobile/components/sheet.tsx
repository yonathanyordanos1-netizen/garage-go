import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import {
  BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';

export function Sheet({
  open, onClose, snapPoints = ['50%'], title, description, children,
}: {
  open: boolean; onClose: () => void; snapPoints?: (string | number)[];
  title?: string; description?: string; children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);
  const points = useMemo(() => snapPoints, [snapPoints]);

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} opacity={0.4} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.line2, width: 36, height: 4 }}
      backgroundStyle={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom + 20 }}>
        {(title || description) && (
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            {title && <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>}
            {description && <Text style={{ fontSize: 13, color: colors.muted, marginTop: 3 }}>{description}</Text>}
          </View>
        )}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
