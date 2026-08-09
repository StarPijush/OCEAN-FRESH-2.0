export interface Customer {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  photoUrl: string | null;
  provider: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: string | null;
  isAnonymous: boolean;
  metadata: Record<string, unknown>;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerUpdate = Partial<
  Pick<
    Customer,
    | 'email'
    | 'phone'
    | 'displayName'
    | 'photoUrl'
    | 'emailVerified'
    | 'phoneVerified'
    | 'accountStatus'
    | 'isAnonymous'
    | 'metadata'
    | 'lastLoginAt'
  >
>;

export interface ICustomerRepository {
  getById(userId: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(userId: string, data: CustomerUpdate): Promise<void>;
}
