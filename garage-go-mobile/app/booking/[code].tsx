import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, Share, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { Button, Badge, IconButton, Separator, radius, shadows } from '../../components/ui';
import { Icon } from '../../lib/icons';
import { getBookings, StoredBooking, setBookingStatus } from '../../lib/store';
import * as haptics from '../../lib/haptics';

export default function BookingDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ticketRef = useRef<React.ComponentRef<typeof ViewShot>>(null);
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    getBookings().then((all) => {
      const found = all.find((b) => b.code === code);
      setBooking(found ?? null);
    });
  }, [code]));

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  const statusVariant = booking.status === 'upcoming' ? 'success' : booking.status === 'completed' ? 'secondary' : 'destructive';
  const statusLabel = booking.status === 'upcoming' ? 'Confirmed' : booking.status === 'completed' ? 'Completed' : 'Cancelled';

  const rows: [string, string, string][] = [
    ['garage', 'Garage', booking.garage],
    ['wrench', 'Service', booking.service],
    ['calendar', 'Date & time', booking.slot],
    ['car', 'Vehicle', booking.vehicle],
    ['birr', 'Fee', `${booking.fee} ETB`],
  ];

  async function shareBooking() {
    try {
      await Share.share({
        message: `Garage Go Reservation\n\nCode: ${booking!.code}\nGarage: ${booking!.garage}\nService: ${booking!.service}\nDate: ${booking!.slot}\nVehicle: ${booking!.vehicle}\nFee: ${booking!.fee} ETB\nStatus: ${statusLabel}`,
      });
    } catch {}
  }

  async function saveToGallery() {
    setSaving(true);
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow Garage Go to save images to your gallery.');
        setSaving(false);
        return;
      }

      // Capture the ticket view as an image
      const uri = await captureRef(ticketRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);
      haptics.success();
      toast.success('Reservation saved to gallery!');
    } catch (e) {
      toast.error('Could not save to gallery. Please try again.');
    }
    setSaving(false);
  }

  async function cancelBooking() {
    Alert.alert(
      'Cancel reservation',
      'Are you sure you want to cancel this booking? This cannot be undone.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel booking', style: 'destructive',
          onPress: async () => {
            await setBookingStatus(booking!.code, 'cancelled');
            setBooking({ ...booking!, status: 'cancelled' });
            haptics.warning();
            toast.warning('Reservation cancelled.');
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>Booking details</Text>
        <IconButton icon="share" onPress={shareBooking} />
      </View>

      {/* Status bar */}
      <Animated.View entering={FadeIn.duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, padding: 14, borderRadius: radius.md, backgroundColor: booking.status === 'upcoming' ? colors.successTint : booking.status === 'cancelled' ? colors.errorTint : colors.surface }}>
        <Icon name={booking.status === 'upcoming' ? 'checkCircle' : booking.status === 'cancelled' ? 'alertCircle' : 'check'} size={20} color={booking.status === 'upcoming' ? colors.success : booking.status === 'cancelled' ? colors.error : colors.accent} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{statusLabel}</Text>
          <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>
            {booking.status === 'upcoming' ? 'Show the QR code at the garage entrance' : booking.status === 'cancelled' ? 'This reservation has been cancelled' : 'This service has been completed'}
          </Text>
        </View>
        <Badge label={statusLabel} variant={statusVariant} />
      </Animated.View>

      {/* ── Ticket / boarding pass (capturable) ── */}
      <ViewShot ref={ticketRef} options={{ format: 'png', quality: 1 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, marginTop: 16, overflow: 'hidden', ...shadows.sm }}>
          {/* Top: branded header */}
          <View style={{ backgroundColor: colors.forest, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="wrench" size={18} color={colors.onPrimary} strokeWidth={2} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.onPrimary, letterSpacing: 0.5 }}>GARAGE GO</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.onPrimary, opacity: 0.7 }}>Reservation</Text>
          </View>

          {/* QR section */}
          <View style={{ alignItems: 'center', paddingVertical: 22, paddingHorizontal: 18 }}>
            <View style={{ padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' }}>
              <QRCode
                value={JSON.stringify({ code: booking.code, garage: booking.garage, service: booking.service, slot: booking.slot })}
                size={160}
                color={colors.ink}
                backgroundColor="transparent"
              />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: 3, color: colors.ink, marginTop: 14 }}>{booking.code}</Text>
            <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 4 }}>Scan at the garage entrance</Text>
          </View>

          {/* Tear line */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 }}>
            <View style={{ width: 14, height: 28, borderTopRightRadius: 14, borderBottomRightRadius: 14, backgroundColor: colors.ground, marginLeft: -1 }} />
            <View style={{ flex: 1, borderBottomWidth: 1.5, borderBottomColor: colors.line, borderStyle: 'dashed' }} />
            <View style={{ width: 14, height: 28, borderTopLeftRadius: 14, borderBottomLeftRadius: 14, backgroundColor: colors.ground, marginRight: -1 }} />
          </View>

          {/* Detail rows */}
          <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20 }}>
            {rows.map(([icon, label, value], i) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={icon as any} size={16} color={colors.ink2} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink, marginTop: 1 }}>{value}</Text>
                </View>
              </View>
            ))}

            {/* Status row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.line }}>
              <Text style={{ fontSize: 11, color: colors.muted }}>Status</Text>
              <Badge label={statusLabel} variant={statusVariant} icon={booking.status === 'upcoming' ? 'check' : undefined} />
            </View>
          </View>

          {/* Footer: fee breakdown */}
          <View style={{ backgroundColor: colors.surface, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 11, color: colors.muted }}>Reservation fee</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{booking.fee} ETB</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: colors.faint }}>{booking.fee / 2} platform · {booking.fee / 2} garage</Text>
              <Text style={{ fontSize: 10, color: colors.faint, marginTop: 2 }}>Paid via Telebirr</Text>
            </View>
          </View>
        </View>
      </ViewShot>

      {/* Actions */}
      <View style={{ marginTop: 18, gap: 10 }}>
        <Button label={saving ? 'Saving...' : 'Save to Gallery'} icon="bookmark" variant="primary" loading={saving} onPress={saveToGallery} />
        <Button label="Share booking" icon="share" variant="outline" onPress={shareBooking} />
        {booking.status === 'upcoming' && (
          <Button label="Cancel reservation" variant="ghost" onPress={cancelBooking} style={{ borderWidth: 1, borderColor: colors.errorTint }} />
        )}
      </View>

      {/* Booked on timestamp */}
      <Text style={{ fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 16 }}>
        Booked on {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(booking.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </ScrollView>
  );
}
