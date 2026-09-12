import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.9z" />
      <Path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
      <Path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4z" />
      <Path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 12 1 11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.8 6-4.8z" />
    </Svg>
  );
}

export function SocialAuth({ onGoogle, onApple }: { onGoogle: () => void; onApple: () => void }) {
  return (
    <View>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or continue with</Text>
        <View style={styles.line} />
      </View>
      <View style={{ gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Continue with Google" onPress={onGoogle}
          style={({ pressed }) => [styles.social, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line2, opacity: pressed ? 0.9 : 1 }]}>
          <GoogleMark />
          <Text style={[styles.socialText, { color: colors.ink }]}>Continue with Google</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Continue with Apple" onPress={onApple}
          style={({ pressed }) => [styles.social, { backgroundColor: colors.ink, opacity: pressed ? 0.9 : 1 }]}>
          <Icon name="apple" size={19} color="#fff" strokeWidth={1.6} />
          <Text style={[styles.socialText, { color: '#fff' }]}>Continue with Apple</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.line2 },
  or: { fontSize: 11, color: colors.faint },
  social: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  socialText: { fontSize: 13.5, fontWeight: '600' },
});
