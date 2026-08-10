import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { useAdminSession } from '../hooks/use-auth-session';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors, radius, spacing } from '../theme';
import type { AdminDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const DRAWER_ITEMS = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'Orders', label: 'Orders' },
  { key: 'Products', label: 'Products' },
  { key: 'Settings', label: 'Settings' },
] as const;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const session = useAdminSession();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <BrandMark size={40} />
        <AppText variant="label" color="mutedBright">
          {session.adminProfile?.role ?? 'Admin'}
        </AppText>
      </View>
      <View style={styles.items}>
        {DRAWER_ITEMS.map((item) => {
          const active = props.state.index === DRAWER_ITEMS.findIndex((d) => d.key === item.key);
          return (
            <DrawerItem
              key={item.key}
              label={item.label}
              focused={active}
              onPress={() => props.navigation.navigate(item.key)}
              labelStyle={styles.itemLabel}
              style={[styles.item, active && styles.itemActive]}
            />
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

export function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.cream },
        headerTintColor: colors.aqua,
        drawerActiveBackgroundColor: colors.surfaceAlive,
        drawerActiveTintColor: colors.aqua,
        drawerInactiveTintColor: colors.mutedBright,
        drawerStyle: { backgroundColor: colors.surface },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
      <Drawer.Screen name="Products" component={ProductsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  brand: { padding: spacing.xl, paddingBottom: spacing.lg, gap: spacing.md },
  items: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.sm },
  item: { borderRadius: radius.md },
  itemActive: { backgroundColor: colors.surfaceAlive },
  itemLabel: { fontSize: 15, fontWeight: '600' },
});
