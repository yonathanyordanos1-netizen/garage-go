import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { Screen, Header } from '../../components/screen';
import { Card, Badge, Button, Field, Toggle, EmptyState, IconButton } from '../../components/ui';
import { Sheet } from '../../components/sheet';
import { Icon } from '../../lib/icons';
import { radius } from '../../lib/theme';
import { formatETB } from '../../lib/utils';
import { useAuth } from '../../lib/auth';
import {
  useStore, upsertService, removeService, upsertListing, removeListing, newId,
  ServiceItem, Listing,
} from '../../lib/owner';
import * as haptics from '../../lib/haptics';

/* ── Service editor (garage) ── */
function ServiceEditor({ open, initial, onClose }: { open: boolean; initial: ServiceItem | null; onClose: () => void }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDesc(initial?.description ?? '');
      setDuration(initial?.duration ?? '');
      setPrice(initial ? String(initial.price) : '');
    }
  }, [open, initial]);

  function save() {
    if (!name.trim()) return toast.error('Give the service a name.');
    const p = parseInt(price.replace(/\D/g, ''), 10) || 0;
    upsertService({
      id: initial?.id ?? newId('s'),
      name: name.trim(),
      description: desc.trim(),
      duration: duration.trim() || '—',
      price: p,
      active: initial?.active ?? true,
    });
    haptics.success();
    toast.success(initial ? 'Service updated' : 'Service added');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit service' : 'New service'} snapPoints={['70%']}>
      <View style={{ gap: 12, paddingTop: 4 }}>
        <Field label="Service name" placeholder="e.g. Brake pad replacement" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Field label="Short description" placeholder="What’s included" value={desc} onChangeText={setDesc} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Field label="Duration" placeholder="45 min" value={duration} onChangeText={setDuration} style={{ flex: 1 }} />
          <Field label="Price (ETB)" placeholder="650" value={price} onChangeText={setPrice} keyboardType="number-pad" style={{ flex: 1 }} />
        </View>
        <Button label={initial ? 'Save changes' : 'Add service'} icon="check" onPress={save} style={{ marginTop: 6 }} />
      </View>
    </Sheet>
  );
}

/* ── Listing editor (seller) ── */
function ListingEditor({ open, initial, onClose }: { open: boolean; initial: Listing | null; onClose: () => void }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setCategory(initial?.category ?? '');
      setPrice(initial ? String(initial.price) : '');
      setStock(initial ? String(initial.stock) : '');
    }
  }, [open, initial]);

  function save() {
    if (!name.trim()) return toast.error('Give the item a name.');
    const p = parseInt(price.replace(/\D/g, ''), 10) || 0;
    const s = parseInt(stock.replace(/\D/g, ''), 10) || 0;
    upsertListing({
      id: initial?.id ?? newId('l'),
      name: name.trim(),
      category: category.trim() || 'Car parts',
      price: p,
      stock: s,
      tag: initial?.tag,
      active: initial?.active ?? true,
    });
    haptics.success();
    toast.success(initial ? 'Listing updated' : 'Listing added');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit listing' : 'New listing'} snapPoints={['72%']}>
      <View style={{ gap: 12, paddingTop: 4 }}>
        <Field label="Item name" placeholder="e.g. Bosch S4 Battery 60Ah" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Field label="Category" placeholder="Battery / Tyres / Oils…" value={category} onChangeText={setCategory} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Field label="Price (ETB)" placeholder="4200" value={price} onChangeText={setPrice} keyboardType="number-pad" style={{ flex: 1 }} />
          <Field label="In stock" placeholder="8" value={stock} onChangeText={setStock} keyboardType="number-pad" style={{ flex: 1 }} />
        </View>
        <Button label={initial ? 'Save changes' : 'Add listing'} icon="check" onPress={save} style={{ marginTop: 6 }} />
      </View>
    </Sheet>
  );
}

export default function Listings() {
  const { colors } = useTheme();
  const { role } = useAuth();
  const { services, listings } = useStore();
  const isSeller = role === 'seller';

  const [svcOpen, setSvcOpen] = useState(false);
  const [svcEdit, setSvcEdit] = useState<ServiceItem | null>(null);
  const [lstOpen, setLstOpen] = useState(false);
  const [lstEdit, setLstEdit] = useState<Listing | null>(null);

  const addBtn = (
    <IconButton
      icon="plus"
      tint={colors.forest}
      label="Add"
      onPress={() => { haptics.tap(); isSeller ? (setLstEdit(null), setLstOpen(true)) : (setSvcEdit(null), setSvcOpen(true)); }}
    />
  );

  return (
    <Screen>
      <Header title={isSeller ? 'Listings' : 'Services'} subtitle={isSeller ? 'What you sell in the market' : 'What customers can book'} right={addBtn} />

      {isSeller ? (
        <View style={{ gap: 12 }}>
          {listings.length === 0 ? (
            <EmptyState icon="box" title="No listings yet" description="Add parts, oils and tyres for customers to find in the market." action={{ label: 'Add your first listing', onPress: () => { setLstEdit(null); setLstOpen(true); } }} />
          ) : listings.map((l) => (
            <Card key={l.id}>
              <View style={{ padding: 16, opacity: l.active ? 1 : 0.6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }} numberOfLines={1}>{l.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Badge label={l.category} variant="secondary" />
                      <Badge label={l.stock === 0 ? 'Out of stock' : `${l.stock} in stock`} variant={l.stock === 0 ? 'destructive' : l.stock <= 3 ? 'warning' : 'success'} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>{formatETB(l.price)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
                  <Text style={{ fontSize: 12.5, color: colors.muted, flex: 1 }}>{l.active ? 'Visible in market' : 'Hidden'}</Text>
                  <Toggle value={l.active} onValueChange={(v) => upsertListing({ ...l, active: v })} />
                  <Pressable onPress={() => { haptics.tap(); setLstEdit(l); setLstOpen(true); }} hitSlop={8} style={{ padding: 4 }}>
                    <Icon name="edit" size={18} color={colors.ink2} />
                  </Pressable>
                  <Pressable onPress={() => { haptics.warning(); removeListing(l.id); }} hitSlop={8} style={{ padding: 4 }}>
                    <Icon name="trash" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {services.length === 0 ? (
            <EmptyState icon="wrench" title="No services yet" description="List what your garage offers so customers can book it." action={{ label: 'Add your first service', onPress: () => { setSvcEdit(null); setSvcOpen(true); } }} />
          ) : services.map((s) => (
            <Card key={s.id}>
              <View style={{ padding: 16, opacity: s.active ? 1 : 0.6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{s.name}</Text>
                    <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 2 }}>{s.description}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
                      <Icon name="clock" size={13} color={colors.faint} />
                      <Text style={{ fontSize: 12, color: colors.ink2 }}>{s.duration}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>{formatETB(s.price)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
                  <Text style={{ fontSize: 12.5, color: colors.muted, flex: 1 }}>{s.active ? 'Bookable now' : 'Paused'}</Text>
                  <Toggle value={s.active} onValueChange={(v) => upsertService({ ...s, active: v })} />
                  <Pressable onPress={() => { haptics.tap(); setSvcEdit(s); setSvcOpen(true); }} hitSlop={8} style={{ padding: 4 }}>
                    <Icon name="edit" size={18} color={colors.ink2} />
                  </Pressable>
                  <Pressable onPress={() => { haptics.warning(); removeService(s.id); }} hitSlop={8} style={{ padding: 4 }}>
                    <Icon name="trash" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <ServiceEditor open={svcOpen} initial={svcEdit} onClose={() => setSvcOpen(false)} />
      <ListingEditor open={lstOpen} initial={lstEdit} onClose={() => setLstOpen(false)} />
    </Screen>
  );
}
