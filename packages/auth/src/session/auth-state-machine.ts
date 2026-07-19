import { AuthenticationState, createLogger, IllegalStateTransitionError } from '@oceanfresh/shared';

const logger = createLogger('auth:session:state-machine');

const VALID_TRANSITIONS: Record<AuthenticationState, AuthenticationState[]> = {
  [AuthenticationState.UNAUTHENTICATED]: [AuthenticationState.AUTHENTICATING],
  [AuthenticationState.AUTHENTICATING]: [
    AuthenticationState.AUTHENTICATED,
    AuthenticationState.MFA_REQUIRED,
    AuthenticationState.EMAIL_UNVERIFIED,
    AuthenticationState.UNAUTHENTICATED,
  ],
  [AuthenticationState.MFA_REQUIRED]: [
    AuthenticationState.AUTHENTICATED,
    AuthenticationState.UNAUTHENTICATED,
    AuthenticationState.SESSION_EXPIRED,
  ],
  [AuthenticationState.AUTHENTICATED]: [
    AuthenticationState.SESSION_EXPIRED,
    AuthenticationState.REAUTH_REQUIRED,
    AuthenticationState.ACCOUNT_DISABLED,
    AuthenticationState.ACCOUNT_DELETED,
    AuthenticationState.UNAUTHENTICATED,
  ],
  [AuthenticationState.EMAIL_UNVERIFIED]: [
    AuthenticationState.AUTHENTICATED,
    AuthenticationState.UNAUTHENTICATED,
  ],
  [AuthenticationState.REAUTH_REQUIRED]: [
    AuthenticationState.AUTHENTICATED,
    AuthenticationState.SESSION_EXPIRED,
    AuthenticationState.UNAUTHENTICATED,
  ],
  [AuthenticationState.SESSION_EXPIRED]: [
    AuthenticationState.AUTHENTICATING,
    AuthenticationState.UNAUTHENTICATED,
  ],
  [AuthenticationState.ACCOUNT_DISABLED]: [AuthenticationState.AUTHENTICATING],
  [AuthenticationState.ACCOUNT_DELETED]: [AuthenticationState.UNAUTHENTICATED],
};

export class AuthStateMachine {
  private state: AuthenticationState;
  private listeners: Set<(state: AuthenticationState, prev: AuthenticationState) => void> =
    new Set();

  constructor(initialState: AuthenticationState = AuthenticationState.UNAUTHENTICATED) {
    this.state = initialState;
  }

  get currentState(): AuthenticationState {
    return this.state;
  }

  transition(to: AuthenticationState): void {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed?.includes(to)) {
      throw new IllegalStateTransitionError(this.state, to);
    }
    const prev = this.state;
    this.state = to;
    logger.debug('state transition', { from: prev, to });
    for (const listener of this.listeners) {
      try {
        listener(to, prev);
      } catch (err) {
        logger.error('State transition listener failed', { error: err });
      }
    }
  }

  canTransitionTo(to: AuthenticationState): boolean {
    const allowed = VALID_TRANSITIONS[this.state];
    return allowed?.includes(to) ?? false;
  }

  onTransition(
    listener: (state: AuthenticationState, prev: AuthenticationState) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = AuthenticationState.UNAUTHENTICATED;
  }

  isAuthenticated(): boolean {
    return this.state === AuthenticationState.AUTHENTICATED;
  }

  isUnauthenticated(): boolean {
    return this.state === AuthenticationState.UNAUTHENTICATED;
  }

  requiresMfa(): boolean {
    return this.state === AuthenticationState.MFA_REQUIRED;
  }

  requiresReauth(): boolean {
    return this.state === AuthenticationState.REAUTH_REQUIRED;
  }

  isSessionExpired(): boolean {
    return this.state === AuthenticationState.SESSION_EXPIRED;
  }
}
