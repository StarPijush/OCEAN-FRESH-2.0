export interface ChangePasswordCommand {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
