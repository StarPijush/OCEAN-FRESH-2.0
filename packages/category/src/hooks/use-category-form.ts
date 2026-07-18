import { useMemo } from 'react';
import { createCategorySchema, updateCategorySchema } from '@oceanfresh/shared';
import type { CreateCategoryInput, UpdateCategoryInput } from '@oceanfresh/shared';

export interface CategoryFormOptions<T extends CreateCategoryInput | UpdateCategoryInput> {
  mode: 'create' | 'update';
  initialData?: Partial<T>;
}

export function useCategoryForm<T extends CreateCategoryInput | UpdateCategoryInput>(options: CategoryFormOptions<T>) {
  const schema = useMemo(
    () => (options.mode === 'create' ? createCategorySchema : updateCategorySchema),
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
