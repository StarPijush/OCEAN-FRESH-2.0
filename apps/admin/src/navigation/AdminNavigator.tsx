import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { STOREFRONT_URL } from '../env';
import { useAdminSession } from '../hooks/use-auth-session';
import { usePendingOrderCount } from '../hooks/use-orders';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { getAuthProvider } from '../services/auth.service';
import { colors, spacing } from '../theme';
import type { AdminDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const NAV_SECTIONS = [
  { label: 'Main', items: [{ id: 'Dashboard', label: 'Dashboard', icon: '▦' }] },
  {
    label: 'Manage',
    items: [
      { id: 'Products', label: 'Products', icon: '🐟' },
      { id: 'Orders', label: 'Orders', icon: '📦', badge: true },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'Settings', label: 'Settings', icon: '⚙' },
      { id: '__store', label: 'View Store', icon: '🌐' },
    ],
  },
] as const;

type NavId = (typeof NAV_SECTIONS)[number]['items'][number]['id'];

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const session = useAdminSession();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const current = props.state.routes[props.state.index]?.name ?? 'Dashboard';
  const name = session.adminProfile?.fullName || session.user?.email || 'Admin';
  const email = session.user?.email ?? '';

  const handleNav = (id: NavId) => {
    if (id === '__store') {
      if (STOREFRONT_URL) void Linking.openURL(STOREFRONT_URL);
      return;
    }
    props.navigation.navigate(id);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <AppText variant="title" style={styles.logo}>
          Ocean
          <AppText variant="title" style={styles.logoAccent}>
            Fresh
          </AppText>
        </AppText>
        <AppText variant="caption" color="muted" style={styles.role}>
          Admin Panel
        </AppText>
      </View>

      <View style={styles.nav}>
        {NAV_SECTIONS.map((section) => (
          <View key={section.label}>
            <AppText variant="caption" color="muted" style={styles.sectionLabel}>
              {section.label.toUpperCase()}
            </AppText>
            {section.items.map((item) => {
              const active = current === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleNav(item.id)}
                  style={[styles.item, active && styles.itemActive]}
                >
                  <AppText style={styles.itemIcon}>{item.icon}</AppText>
                  <AppText
                    variant="bodyMedium"
                    color={active ? 'aqua' : 'mutedBright'}
                    style={styles.itemLabel}
                  >
                    {item.label}
                  </AppText>
                  {'badge' in item && item.badge && pendingCount > 0 ? (
                    <View style={styles.badge}>
                      <AppText variant="caption" style={styles.badgeText}>
                        {pendingCount}
                      </AppText>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.foot}>
        <View style={styles.user}>
          <View style={styles.avatar}>
            <AppText variant="label" style={styles.avatarText}>
              {initialsOf(name)}
            </AppText>
          </View>
          <View style={styles.userMeta}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="caption" color="muted" numberOfLines={1}>
              {email}
            </AppText>
          </View>
        </View>
        <AppText
          variant="label"
          color="mutedBright"
          style={styles.signOut}
          onPress={() => void getAuthProvider().logout()}
        >
          SIGN OUT
        </AppText>
      </View>
    </DrawerContentScrollView>
  );
}

export function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.cream },
        headerTintColor: colors.aqua,
        drawerActiveBackgroundColor: colors.surfaceAlive,
        drawerActiveTintColor: colors.aqua,
        drawerInactiveTintColor: colors.mutedBright,
        drawerStyle: { backgroundColor: colors.surface, width: 264 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Products" component={ProductsScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  head: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  logo: { fontSize: 22, letterSpacing: 1.2, textTransform: 'uppercase' },
  logoAccent: { color: colors.aqua },
  role: { letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 2 },
  nav: { flex: 1, paddingHorizontal: spacing.sm },
  sectionLabel: {
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  itemActive: { backgroundColor: colors.aquaDim, borderLeftColor: colors.aqua },
  itemIcon: { fontSize: 16, width: 22, textAlign: 'center', color: colors.mutedBright },
  itemLabel: { flex: 1 },
  badge: {
    backgroundColor: colors.warn,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  badgeText: { color: colors.white, fontWeight: '700' },
  foot: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.aquaDim,
    borderWidth: 1,
    borderColor: colors.aqua,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.aqua, fontWeight: '600' },
  userMeta: { flex: 1, gap: 1 },
  signOut: {
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 6,
  },
});
