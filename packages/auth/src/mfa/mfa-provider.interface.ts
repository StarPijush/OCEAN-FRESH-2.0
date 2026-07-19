import type { MfaFactorType } from '@oceanfresh/shared';

export interface MfaEnrollment {
  id: string;
  userId: string;
  factorType: MfaFactorType;
  enrolledAt: Date;
  name: string;
  isVerified: boolean;
}

export interface MfaChallenge {
  id: string;
  userId: string;
  factorType: MfaFactorType;
  createdAt: Date;
  expiresAt: Date;
  isVerified: boolean;
}

export interface IMfaProvider {
  enroll(userId: string, factorType: MfaFactorType, name?: string): Promise<MfaEnrollment>;
  verify(challengeId: string, code: string): Promise<boolean>;
  unenroll(userId: string, factorId: string): Promise<void>;
  getEnrolledFactors(userId: string): Promise<MfaEnrollment[]>;
  createChallenge(userId: string, factorType: MfaFactorType): Promise<MfaChallenge>;
}
