import React from 'react';
import { View, Text, ScrollView, Linking, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { Card, Badge, Button, IconButton, Separator, Avatar } from '../../components/ui';
import { Icon, IconName } from '../../lib/icons';
import { radius } from '../../lib/theme';
import { formatETB } from '../../lib/utils';
import { useStore, setJobStatus, JobStatus } from '../../lib/owner';
import * as haptics from '../../lib/haptics';

function statusMeta(status: JobStatus) {
  switch (status) {
    case 'pending': return { label: 'Awaiting your reply', variant: 'warning' as const };
    case 'confirmed': return { label: 'Confirmed', variant: 'default' as const };
    case 'in_progress': return { label: 'In progress', variant: 'default' as const };
    case 'completed': return { label: 'Completed', variant: 'success' as const };
    case 'cancelled': return { label: 'Declined', variant: 'destructive' as const };
  }
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} color={colors.ink2} />
      </View>
      <Text style={{ fontSize: 13, color: colors.muted, width: 78 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13.5, fontWeight: '600', color: colors.ink, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { jobs } = useStore();

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: colors.muted }}>This job is no longer available.</Text>
        <Button label="Go back" variant="secondary" full={false} onPress={() => router.back()} />
      </View>
    );
  }

  const meta = statusMeta(job.status);
  const platformFee = job.fee - job.garageCut;

  function call() {
    haptics.tap();
    Linking.openURL(`tel:${job!.phone}`).catch(() => toast.error('Could not open the dialer.'));
  }
  function move(status: JobStatus, msg: string) {
    setJobStatus(job!.id, status);
    haptics.success();
    toast.success(msg);
    if (status === 'cancelled') router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevL" onPress={() => router.back()} label="Back" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>Booking</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{job.code}</Text>
        </View>
        <Badge label={meta.label} variant={meta.variant} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        {/* Customer */}
        <Card>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={job.customer} size="md" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.ink }}>{job.customer}</Text>
              <Text style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>{job.phone}</Text>
            </View>
            <Pressable onPress={call} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="phone" size={20} color={colors.onPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </Card>

        {/* Job details */}
        <Card style={{ marginTop: 14 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            <InfoRow icon="wrench" label="Service" value={job.service} />
            <Separator />
            <InfoRow icon="car" label="Vehicle" value={job.vehicle} />
            <Separator />
            <InfoRow icon="calendar" label="When" value={`${job.date === new Date().toISOString().slice(0, 10) ? 'Today' : job.date} · ${job.slot}`} />
            {job.assignedTo ? (<><Separator /><InfoRow icon="user" label="Assigned" value={job.assignedTo} /></>) : null}
          </View>
        </Card>

        {job.problem ? (
          <Card style={{ marginTop: 14 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.muted, marginBottom: 6 }}>CUSTOMER’S NOTE</Text>
              <Text style={{ fontSize: 14, color: colors.ink2, lineHeight: 20 }}>{job.problem}</Text>
            </View>
          </Card>
        ) : null}

        {/* Payout breakdown */}
        <Card style={{ marginTop: 14 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.muted, marginBottom: 10 }}>PAYOUT</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13.5, color: colors.ink2 }}>Customer pays</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>{formatETB(job.fee)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13.5, color: colors.ink2 }}>Platform fee</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.error }}>−{formatETB(platformFee)}</Text>
            </View>
            <Separator />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>You keep</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.forest }}>{formatETB(job.garageCut)}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Action bar */}
      {(job.status === 'pending' || job.status === 'confirmed' || job.status === 'in_progress') && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line }}>
          {job.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Decline" variant="outline" icon="x" onPress={() => move('cancelled', `Declined ${job.code}.`)} style={{ flex: 1 }} />
              <Button label="Accept booking" icon="check" onPress={() => move('confirmed', 'Accepted — customer notified.')} style={{ flex: 1.5 }} />
            </View>
          )}
          {job.status === 'confirmed' && (
            <Button label="Start job" icon="wrench" onPress={() => move('in_progress', 'Job started.')} />
          )}
          {job.status === 'in_progress' && (
            <Button label="Mark as complete" icon="check" onPress={() => move('completed', 'Job completed — payout pending.')} />
          )}
        </View>
      )}
    </View>
  );
}
