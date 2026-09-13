import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme, ThemePreference } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Card, Toggle, Separator, IconButton, radius } from '../components/ui';
import { Sheet } from '../components/sheet';
import { Icon, IconName } from '../lib/icons';

export default function Settings() {
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [push, setPush] = useState(true);
  const [emails, setEmails] = useState(false);
  const [themeSheet, setThemeSheet] = useState(false);

  const themeLabel = preference[0].toUpperCase() + preference.slice(1);
  const themeOptions: { key: ThemePreference; label: string; sub: string; icon: IconName }[] = [
    { key: 'system', label: 'System', sub: 'Match your device', icon: 'phone' },
    { key: 'light', label: 'Light', sub: 'Always light', icon: 'sun' },
    { key: 'dark', label: 'Dark', sub: 'Always dark', icon: 'moon' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon="chevL" onPress={() => router.back()} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>Settings</Text>
        </View>

        {/* Appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <Pressable onPress={() => setThemeSheet(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, height: 54 }}>
            <SettingIcon icon={preference === 'dark' ? 'moon' : preference === 'light' ? 'sun' : 'phone'} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.ink }}>Theme</Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>{themeLabel}</Text>
            <Icon name="chevR" size={16} color={colors.faint} />
          </Pressable>
        </Card>

        {/* Notifications */}
        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <ToggleRow icon="bell" label="Push notifications" value={push} onChange={setPush} />
          <Separator />
          <ToggleRow icon="mail" label="Email updates" value={emails} onChange={setEmails} />
        </Card>

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <Card>
          <ValueRow icon="chat" label="Language" value="English" onPress={() => toast.info('Coming soon')} />
          <Separator />
          <ValueRow icon="pin" label="Distance unit" value="Kilometers" onPress={() => toast.info('Coming soon')} />
        </Card>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <Card>
          <ValueRow icon="lock" label="Change password" onPress={() => toast.info('Coming soon')} />
          <Separator />
          <Pressable
            onPress={() => Alert.alert('Delete account', 'This permanently deletes your account and data. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => toast.error('Account deletion is disabled in the demo') }])}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, height: 54 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.errorTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trash" size={18} color={colors.error} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.error }}>Delete account</Text>
          </Pressable>
        </Card>

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <Card>
          <ValueRow icon="info" label="App version" value={Constants.expoConfig?.version ?? '1.0.0'} />
          <Separator />
          <ValueRow icon="shield" label="Terms of service" onPress={() => toast.info('Coming soon')} />
          <Separator />
          <ValueRow icon="shield" label="Privacy policy" onPress={() => toast.info('Coming soon')} />
        </Card>
      </ScrollView>

      {/* Theme picker sheet */}
      <Sheet open={themeSheet} onClose={() => setThemeSheet(false)} snapPoints={['46%']} title="Appearance" description="Choose how Garage Go looks">
        <View style={{ gap: 8 }}>
          {themeOptions.map((o) => {
            const on = preference === o.key;
            return (
              <Pressable key={o.key} onPress={() => { setPreference(o.key); setThemeSheet(false); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.forest : colors.line, backgroundColor: on ? colors.forestTint : colors.card }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={o.icon} size={19} color={colors.ink2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{o.label}</Text>
                  <Text style={{ fontSize: 11.5, color: colors.muted }}>{o.sub}</Text>
                </View>
                {on && <Icon name="check" size={20} color={colors.forest} strokeWidth={2.4} />}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 22, marginBottom: 8 }}>{children}</Text>;
}
function SettingIcon({ icon }: { icon: IconName }) {
  const { colors } = useTheme();
  return <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={colors.ink2} /></View>;
}
function ToggleRow({ icon, label, value, onChange }: { icon: IconName; label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, height: 54 }}>
      <SettingIcon icon={icon} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.ink }}>{label}</Text>
      <Toggle value={value} onValueChange={onChange} />
    </View>
  );
}
function ValueRow({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, height: 54 }}>
      <SettingIcon icon={icon} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.ink }}>{label}</Text>
      {value && <Text style={{ fontSize: 13, color: colors.muted }}>{value}</Text>}
      {onPress && <Icon name="chevR" size={16} color={colors.faint} />}
    </Pressable>
  );
}
