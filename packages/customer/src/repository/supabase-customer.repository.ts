import { NotFoundError, RepositoryError } from '@oceanfresh/shared';
import { objToSnakeCase, rowToCamelCase, supabaseService } from '@oceanfresh/supabase';

import type { Customer, CustomerUpdate, ICustomerRepository } from './customer.repository.js';

const TABLE = 'users';

export class SupabaseCustomerRepository implements ICustomerRepository {
  async getById(userId: string): Promise<Customer | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, userId);
      if (!row) return null;
      return rowToCamelCase<Customer>(row);
    } catch (err) {
      throw new RepositoryError('Failed to find customer', 'getById', TABLE, {
        userId,
        error: err,
      });
    }
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'email', operator: 'eq', value: email },
      ]);
      if (rows.length === 0) return null;
      return rowToCamelCase<Customer>(rows[0] as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to find customer by email', 'findByEmail', TABLE, {
        email,
        error: err,
      });
    }
  }

  async create(customer: Customer): Promise<Customer> {
    try {
      const payload = objToSnakeCase(customer as unknown as Record<string, unknown>);
      const created = await supabaseService.add<Record<string, unknown>>(TABLE, payload);
      return rowToCamelCase<Customer>(created);
    } catch (err) {
      throw new RepositoryError('Failed to create customer', 'create', TABLE, {
        userId: customer.id,
        error: err,
      });
    }
  }

  async update(userId: string, data: CustomerUpdate): Promise<void> {
    try {
      const existing = await this.getById(userId);
      if (!existing) throw new NotFoundError('Customer not found');
      const payload = objToSnakeCase(data as unknown as Record<string, unknown>);
      await supabaseService.update(TABLE, userId, payload);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update customer', 'update', TABLE, {
        userId,
        error: err,
      });
    }
  }
}
