import { type AddToCartInput, addToCartSchema, updateCartItemSchema } from '@oceanfresh/shared';
import { useCallback, useState } from 'react';

interface FormState {
  productId: string;
  quantity: number;
  variantId?: string;
}

const INITIAL_STATE: FormState = { productId: '', quantity: 1 };

type ValidationErrors = Partial<Record<keyof FormState, string>>;

export function useCartForm(initialState: FormState = INITIAL_STATE) {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());

  const setFieldValue = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const validate = useCallback((): boolean => {
    const result = addToCartSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormState;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [values]);

  const validateUpdate = useCallback((itemId: string, quantity: number): boolean => {
    const result = updateCartItemSchema.safeParse({ itemId, quantity });
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormState;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, []);

  const getAddToCartInput = useCallback((): AddToCartInput => {
    return {
      productId: values.productId,
      quantity: values.quantity,
      variantId: values.variantId,
    };
  }, [values]);

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
    validate,
    validateUpdate,
    getAddToCartInput,
    reset,
  };
}
