import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Button, IconButton, Badge, Separator } from '../components/ui';
import { Icon, IconName } from '../lib/icons';
import { radius } from '../lib/theme';
import { formatETB } from '../lib/utils';
import { useStore, setJobStatus, Job } from '../lib/owner';
import { useAuth } from '../lib/auth';
import * as haptics from '../lib/haptics';

// The customer app encodes bookings as JSON: { code, garage, service, slot }.
type ScannedReservation = { code?: string; garage?: string; service?: string; slot?: string };

function parsePayload(raw: string): ScannedReservation | null {
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && (obj.code || obj.service)) return obj as ScannedReservation;
  } catch {}
  // Fall back: a bare booking code like "GG-482193".
  const m = raw.match(/GG-\d{6}/i);
  if (m) return { code: m[0].toUpperCase() };
  return null;
}

function DetailLine({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 }}>
      <Icon name={icon} size={16} color={colors.faint} />
      <Text style={{ fontSize: 13, color: colors.muted, width: 74 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13.5, fontWeight: '600', color: colors.ink, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export default function Scan() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const { jobs } = useStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScannedReservation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const lock = useRef(false);

  // Resolve the scanned code against this operator's jobs.
  const matched: Job | undefined = result?.code
    ? jobs.find((j) => j.code.toUpperCase() === result.code!.toUpperCase())
    : undefined;

  function onScanned(res: BarcodeScanningResult) {
    if (lock.current || result) return;
    const parsed = parsePayload(res.data);
    if (!parsed) return; // ignore non-reservation codes, keep scanning
    lock.current = true;
    haptics.success();
    setResult(parsed);
    const found = parsed.code && jobs.some((j) => j.code.toUpperCase() === parsed.code!.toUpperCase());
    setNotFound(!found);
  }

  function reset() {
    setResult(null);
    setNotFound(false);
    lock.current = false;
  }

  function checkIn() {
    if (!matched) return;
    if (matched.status === 'pending') setJobStatus(matched.id, 'confirmed');
    else if (matched.status === 'confirmed') setJobStatus(matched.id, 'in_progress');
    toast.success(`${matched.customer} checked in for ${matched.code}.`);
    router.replace(`/job/${matched.id}`);
  }

  const Chrome = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flex: 1, backgroundColor: '#161210' }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <IconButton icon="x" onPress={() => router.back()} label="Close" />
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>Scan reservation</Text>
      </View>
      {children}
    </View>
  );

  // ── Permission states ──
  if (!permission) {
    return <Chrome><View style={{ flex: 1 }} /></Chrome>;
  }
  if (!permission.granted) {
    return (
      <Chrome>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 }}>
          <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={34} color="#fff" strokeWidth={1.8} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' }}>Camera access needed</Text>
          <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 }}>
            Allow camera access to scan the QR code on a customer’s booking.
          </Text>
          <View style={{ width: '100%', marginTop: 8, gap: 10 }}>
            {permission.canAskAgain ? (
              <Button label="Allow camera" icon="check" onPress={requestPermission} />
            ) : (
              <Button label="Open settings" onPress={() => Linking.openSettings()} />
            )}
            <Button label="Not now" variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      </Chrome>
    );
  }

  // ── Live camera ──
  return (
    <Chrome>
      <View style={{ flex: 1, marginTop: 12 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={result ? undefined : onScanned}
        />

        {/* Reticle overlay */}
        {!result && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 240, height: 240, borderRadius: 28, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)' }} />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 20, textShadowColor: '#000', textShadowRadius: 6 }}>
              Point at the customer’s booking QR
            </Text>
          </View>
        )}

        {/* Result panel */}
        {result && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(22,18,16,0.55)', justifyContent: 'flex-end' }}>
            <Animated.View entering={SlideInDown.duration(240)} style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: notFound ? colors.warningTint : colors.successTint, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={notFound ? 'alertCircle' : 'checkCircle'} size={22} color={notFound ? colors.warning : colors.success} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16.5, fontWeight: '800', color: colors.ink }}>
                    {notFound ? 'Reservation scanned' : 'Reservation found'}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: colors.muted }}>{result.code ?? 'Unknown code'}</Text>
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                {matched ? (
                  <>
                    <DetailLine icon="user" label="Customer" value={matched.customer} />
                    <Separator />
                    <DetailLine icon="phone" label="Phone" value={matched.phone} />
                    <Separator />
                    <DetailLine icon="car" label="Vehicle" value={matched.vehicle} />
                    <Separator />
                    <DetailLine icon="wrench" label="Service" value={matched.service} />
                    <Separator />
                    <DetailLine icon="calendar" label="Slot" value={`${matched.date === new Date().toISOString().slice(0, 10) ? 'Today' : matched.date} · ${matched.slot}`} />
                    <Separator />
                    <DetailLine icon="wallet" label="You keep" value={formatETB(matched.garageCut)} />
                    <View style={{ marginTop: 8 }}>
                      <Badge
                        label={matched.status === 'completed' ? 'Already completed' : matched.status === 'cancelled' ? 'Was declined' : matched.status === 'in_progress' ? 'In progress' : matched.status === 'confirmed' ? 'Confirmed' : 'Awaiting check-in'}
                        variant={matched.status === 'completed' ? 'success' : matched.status === 'cancelled' ? 'destructive' : 'warning'}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {result.garage ? <><DetailLine icon="garage" label="Garage" value={result.garage} /><Separator /></> : null}
                    {result.service ? <><DetailLine icon="wrench" label="Service" value={result.service} /><Separator /></> : null}
                    {result.slot ? <DetailLine icon="calendar" label="Slot" value={result.slot} /> : null}
                    <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 10, lineHeight: 18 }}>
                      This booking isn’t in your {role === 'seller' ? 'orders' : 'job list'} yet — it may belong to another operator, or the customer hasn’t booked with you.
                    </Text>
                  </>
                )}
              </View>

              <View style={{ gap: 10, marginTop: 18 }}>
                {matched && matched.status !== 'completed' && matched.status !== 'cancelled' && (
                  <Button label="Check in customer" icon="check" onPress={checkIn} />
                )}
                {matched && (matched.status === 'completed' || matched.status === 'cancelled') && (
                  <Button label="Open booking" iconRight="arrowR" onPress={() => router.replace(`/job/${matched.id}`)} />
                )}
                <Button label="Scan another" variant={matched && matched.status !== 'completed' && matched.status !== 'cancelled' ? 'secondary' : 'primary'} icon="search" onPress={reset} />
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    </Chrome>
  );
}
