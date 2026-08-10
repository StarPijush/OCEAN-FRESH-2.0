export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  OtpVerify: { email: string };
  ResetPassword: { email: string };
  Admin: undefined;
};

export type AdminDrawerParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Settings: undefined;
};
