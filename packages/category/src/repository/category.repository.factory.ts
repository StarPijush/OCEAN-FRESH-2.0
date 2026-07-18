import { container } from '@oceanfresh/shared';
import type { ICategoryRepository } from './category.repository.js';
import { SupabaseCategoryRepository } from './supabase-category.repository.js';

export const CATEGORY_REPOSITORY_TOKEN = 'ICategoryRepository';

export function registerCategoryRepository(): void {
  container.register<ICategoryRepository>(
    CATEGORY_REPOSITORY_TOKEN,
    () => new SupabaseCategoryRepository(),
    true,
  );
}

export function getCategoryRepository(): ICategoryRepository {
  return container.resolve<ICategoryRepository>(CATEGORY_REPOSITORY_TOKEN);
}
