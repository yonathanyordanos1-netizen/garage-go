import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { Screen, Header } from '../../components/screen';
import { Card, Badge, Button, SegmentedControl, EmptyState, IconButton } from '../../components/ui';
import { Icon } from '../../lib/icons';
import { radius } from '../../lib/theme';
import { formatETB } from '../../lib/utils';
import { useStore, setJobStatus, Job, JobStatus } from '../../lib/owner';
import * as haptics from '../../lib/haptics';

const FILTERS: { label: string; match: JobStatus[] }[] = [
  { label: 'New', match: ['pending'] },
  { label: 'Scheduled', match: ['confirmed', 'in_progress'] },
  { label: 'History', match: ['completed', 'cancelled'] },
];

function statusBadge(status: JobStatus) {
  switch (status) {
    case 'pending': return { label: 'Awaiting reply', variant: 'warning' as const };
    case 'confirmed': return { label: 'Confirmed', variant: 'default' as const };
    case 'in_progress': return { label: 'In progress', variant: 'default' as const };
    case 'completed': return { label: 'Completed', variant: 'success' as const };
    case 'cancelled': return { label: 'Declined', variant: 'destructive' as const };
  }
}

function JobCard({ job, onOpen, onAccept, onDecline }: {
  job: Job; onOpen: () => void; onAccept: () => void; onDecline: () => void;
}) {
  const { colors } = useTheme();
  const badge = statusBadge(job.status);
  return (
    <Card variant="interactive" onPress={onOpen}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink }} numberOfLines={1}>{job.service}</Text>
          <Badge label={badge.label} variant={badge.variant} />
        </View>
        <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 3 }} numberOfLines={1}>
          {job.customer} · {job.vehicle}
        </Text>

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="calendar" size={14} color={colors.faint} />
            <Text style={{ fontSize: 12.5, color: colors.ink2 }}>{job.date === new Date().toISOString().slice(0, 10) ? 'Today' : job.date} · {job.slot}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="wallet" size={14} color={colors.faint} />
            <Text style={{ fontSize: 12.5, color: colors.ink2 }}>{formatETB(job.garageCut)} to you</Text>
          </View>
        </View>

        {job.status === 'pending' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Button label="Decline" variant="outline" size="sm" icon="x" onPress={onDecline} style={{ flex: 1 }} />
            <Button label="Accept" size="sm" icon="check" onPress={onAccept} style={{ flex: 1.4 }} />
          </View>
        )}
      </View>
    </Card>
  );
}

export default function Jobs() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { jobs } = useStore();
  const [tab, setTab] = useState(0);

  const filter = FILTERS[tab];
  const list = jobs
    .filter((j) => filter.match.includes(j.status))
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));

  function accept(j: Job) {
    setJobStatus(j.id, 'confirmed');
    haptics.success();
    toast.success(`Accepted ${j.code} — customer notified.`);
  }
  function decline(j: Job) {
    setJobStatus(j.id, 'cancelled');
    haptics.warning();
    toast.info(`Declined ${j.code}.`);
  }

  const pendingCount = jobs.filter((j) => j.status === 'pending').length;

  return (
    <Screen>
      <Header
        title="Jobs"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {pendingCount > 0 && (
              <View style={{ backgroundColor: colors.forest, borderRadius: radius.pill, minWidth: 28, height: 28, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.onPrimary, fontWeight: '800', fontSize: 13 }}>{pendingCount}</Text>
              </View>
            )}
            <IconButton icon="search" tint={colors.forest} label="Scan reservation" onPress={() => router.push('/scan')} />
          </View>
        }
      />

      <SegmentedControl options={FILTERS.map((f) => f.label)} index={tab} onChange={setTab} />

      <View style={{ gap: 12, marginTop: 16 }}>
        {list.length === 0 ? (
          <EmptyState
            icon={tab === 0 ? 'clipboard' : tab === 1 ? 'calendar' : 'clock'}
            title={tab === 0 ? 'No new requests' : tab === 1 ? 'Nothing scheduled' : 'No past jobs yet'}
            description={tab === 0 ? 'New bookings from customers will land here for you to accept.' : tab === 1 ? 'Accepted jobs will appear here on their date.' : 'Completed and declined jobs are archived here.'}
          />
        ) : list.map((j) => (
          <JobCard
            key={j.id}
            job={j}
            onOpen={() => router.push(`/job/${j.id}`)}
            onAccept={() => accept(j)}
            onDecline={() => decline(j)}
          />
        ))}
      </View>
    </Screen>
  );
}
