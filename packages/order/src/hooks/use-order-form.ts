import { useCallback, useState } from 'react';
import { createOrderFromCheckoutSchema } from '@oceanfresh/shared';
import type { CreateOrderFromCheckoutInput } from '@oceanfresh/shared';

interface FormState {
  customer: {
    name: string;
    email: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    method: string;
    amount: { amount: number; currency: string };
  };
  billing: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin: string | null;
  };
  notes: string;
}

const INITIAL_STATE: FormState = {
  customer: { name: '', email: null, phone: '', address: '', city: '', state: '', pincode: '' },
  shipping: { address: '', city: '', state: '', pincode: '', method: 'standard', amount: { amount: 0, currency: 'INR' } },
  billing: { address: '', city: '', state: '', pincode: '', gstin: null },
  notes: '',
};

type ValidationErrors = Partial<Record<string, string>>;

export function useOrderForm(initialState: FormState = INITIAL_STATE) {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const setFieldValue = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const setNestedFieldValue = useCallback((parent: keyof FormState, field: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as Record<string, unknown>), [field]: value },
    }));
    setTouched((prev) => new Set(prev).add(`${parent}.${field}`));
  }, []);

  const validate = useCallback((): boolean => {
    const result = createOrderFromCheckoutSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [values]);

  const getCreateOrderInput = useCallback(
    (cartId: string, idempotencyKey: string, userId: string | null): CreateOrderFromCheckoutInput => {
      return {
        cartId,
        idempotencyKey,
        userId,
        customer: values.customer,
        shipping: values.shipping,
        billing: values.billing,
        notes: values.notes || undefined,
      };
    },
    [values],
  );

  const reset = useCallback(() => {
    setValues(INITIAL_STATE);
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setNestedFieldValue,
    validate,
    getCreateOrderInput,
    reset,
  };
}
