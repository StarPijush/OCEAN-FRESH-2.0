import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpVerifyScreen } from '../screens/OtpVerifyScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { AdminNavigator } from './AdminNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0d0f12' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Admin" component={AdminNavigator} />
    </Stack.Navigator>
  );
}
