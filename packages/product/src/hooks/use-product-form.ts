import { useMemo } from 'react';
import { createProductSchema, updateProductSchema } from '@oceanfresh/shared';
import type { CreateProductInput, UpdateProductInput } from '@oceanfresh/shared';

export interface ProductFormOptions<T extends CreateProductInput | UpdateProductInput> {
  mode: 'create' | 'update';
  initialData?: Partial<T>;
}

export function useProductForm<T extends CreateProductInput | UpdateProductInput>(options: ProductFormOptions<T>) {
  const schema = useMemo(
    () => (options.mode === 'create' ? createProductSchema : updateProductSchema),
    [options.mode],
  );

  const defaultValues = useMemo<Partial<T>>(
    () => options.initialData ?? ({} as Partial<T>),
    [options.initialData],
  );

  return {
    schema,
    defaultValues,
    mode: options.mode,
  };
}
