import { useDeferredValue, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useProducts, useToggleFeatured } from '../hooks/use-products';
import { colors, radius, spacing } from '../theme';
import { formatCurrency } from '../utils/format';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'] as const;

export function ProductsScreen() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading, isError, error, refetch } = useProducts({
    search: deferredSearch,
    status,
  });
  const toggleFeatured = useToggleFeatured();

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products…"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <View style={styles.chips}>
          {STATUS_FILTERS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.chip, status === s && styles.chipActive]}
            >
              <AppText variant="label" color={status === s ? 'bg' : 'mutedBright'}>
                {s.replace('_', ' ')}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState message={error?.message ?? null} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No products" hint="Try a different search or status filter." />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <Image source={{ uri: item.thumbnail ?? item.images?.[0] }} style={styles.thumb} />
              <View style={styles.rowBody}>
                <AppText variant="bodySemiBold" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color="muted">
                  {item.status} · {item.stock ?? 0} in stock
                </AppText>
                <AppText variant="bodyMedium">{formatCurrency(item.price)}</AppText>
              </View>
              <Pressable
                onPress={() => toggleFeatured.mutateAsync(item)}
                hitSlop={8}
                style={[styles.fav, item.featured && styles.favActive]}
              >
                <AppText variant="label" color={item.featured ? 'gold' : 'muted'}>
                  ★
                </AppText>
              </Pressable>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.md },
  toolbar: { paddingHorizontal: spacing.lg, gap: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActive: { backgroundColor: colors.aqua, borderColor: colors.aqua },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceAlive },
  rowBody: { flex: 1, gap: 2 },
  fav: { padding: spacing.sm },
  favActive: { backgroundColor: colors.goldDim, borderRadius: radius.sm },
});
