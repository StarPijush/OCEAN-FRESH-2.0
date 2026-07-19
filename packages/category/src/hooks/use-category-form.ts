import {
  type CreateCategoryInput,
  createCategorySchema,
  type UpdateCategoryInput,
  updateCategorySchema,
} from '@oceanfresh/shared';
import { useMemo } from 'react';

export interface CategoryFormOptions<T extends CreateCategoryInput | UpdateCategoryInput> {
  mode: 'create' | 'update';
  initialData?: Partial<T>;
}

export function useCategoryForm<T extends CreateCategoryInput | UpdateCategoryInput>(
  options: CategoryFormOptions<T>,
) {
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
