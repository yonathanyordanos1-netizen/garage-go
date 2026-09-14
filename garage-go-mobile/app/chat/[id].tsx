import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { Avatar, IconButton, radius } from '../../components/ui';
import { Icon } from '../../lib/icons';
import { getThread, saveThread, ChatMsg } from '../../lib/store';
import * as haptics from '../../lib/haptics';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function sellerReply(product: string, n: number): string {
  const opts = [
    `Hi! Thanks for your interest in the ${product}. It's in stock — when would you like to pick it up?`,
    'Yes, that price is negotiable for a quick sale. Are you in Addis?',
    'I can hold it for you until tomorrow. Want me to reserve it?',
    'It comes with a 3-month warranty. Any other questions?',
  ];
  return opts[Math.min(n, opts.length - 1)];
}

export default function Chat() {
  const { id, name, product } = useLocalSearchParams<{ id: string; name: string; product: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const sellerTurns = useRef(0);

  useEffect(() => {
    getThread(id).then((t) => {
      if (t.length === 0) {
        const greet: ChatMsg = { id: uid(), from: 'seller', text: sellerReply(product || 'item', 0), at: Date.now() };
        sellerTurns.current = 1;
        setMsgs([greet]);
        saveThread(id, [greet]);
      } else {
        sellerTurns.current = t.filter((m) => m.from === 'seller').length;
        setMsgs(t);
      }
    });
  }, [id]);

  useEffect(() => { const t = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50); return () => clearTimeout(t); }, [msgs, typing]);

  function persist(next: ChatMsg[]) { setMsgs(next); saveThread(id, next); }

  function send() {
    const body = text.trim();
    if (!body) return;
    haptics.tap();
    const mine: ChatMsg = { id: uid(), from: 'me', text: body, at: Date.now() };
    const next = [...msgs, mine];
    persist(next);
    setText('');
    setTyping(true);
    setTimeout(() => {
      const reply: ChatMsg = { id: uid(), from: 'seller', text: sellerReply(product || 'item', sellerTurns.current), at: Date.now() };
      sellerTurns.current += 1;
      setTyping(false);
      persist([...next, reply]);
    }, 1100);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: insets.top + 10, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.card }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Avatar name={name || 'Seller'} size="sm" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{name || 'Seller'}</Text>
          <Text style={{ fontSize: 11.5, color: colors.success }}>● Online</Text>
        </View>
        <IconButton icon="phone" onPress={() => Linking.openURL('tel:' + id)} tint={colors.ink2} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView ref={scroller} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
          {product ? (
            <View style={{ alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 11.5, color: colors.muted }}>About: {product}</Text>
            </View>
          ) : null}
          {msgs.map((m) => {
            const mine = m.from === 'me';
            return (
              <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: mine ? colors.forest : colors.card, borderWidth: mine ? 0 : 1, borderColor: colors.line, borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, paddingHorizontal: 13, paddingVertical: 9 }}>
                <Text style={{ fontSize: 13.5, lineHeight: 19, color: mine ? colors.onPrimary : colors.ink }}>{m.text}</Text>
              </View>
            );
          })}
          {typing && (
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 11 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>typing…</Text>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.card }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor={colors.faint}
            multiline
            style={{ flex: 1, maxHeight: 110, minHeight: 44, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ground, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: 14, color: colors.ink }}
          />
          <Pressable onPress={send} disabled={!text.trim()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: text.trim() ? colors.forest : colors.line2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrowR" size={20} color={text.trim() ? colors.onPrimary : colors.faint} strokeWidth={2.2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
