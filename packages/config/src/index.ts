export const config = {
  app: {
    name: 'OceanFresh',
    version: '1.0.0',
    url: 'https://oceanfresh.in',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    productImagesPath: 'products',
    categoryImagesPath: 'categories',
  },
  cache: {
    productListTtl: 5 * 60 * 1000,
    productDetailTtl: 10 * 60 * 1000,
    categoryTtl: 30 * 60 * 1000,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
} as const;
