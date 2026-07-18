declare const gtag: ((cmd: string, ...args: unknown[]) => void) | undefined;

export enum BusinessMetric {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CHECKOUT_STARTED = 'checkout_started',
  ORDER_PLACED = 'order_placed',
  ORDER_COMPLETED = 'order_completed',
  SEARCH_PERFORMED = 'search_performed',
  FILTER_USED = 'filter_used',
  LOCATION_SHARED = 'location_shared',
  PINCODE_CHECKED = 'pincode_checked',
}

export enum PerformanceMetric {
  PRODUCT_LIST_LOAD = 'product_list_load',
  PRODUCT_DETAIL_LOAD = 'product_detail_load',
  ORDER_SUBMIT = 'order_submit',
  IMAGE_UPLOAD = 'image_upload',
  AUTH_LOGIN = 'auth_login',
  CLOUD_FUNCTION_CALL = 'cloud_function_call',
}

export function trackBusinessMetric(metric: BusinessMetric, params?: Record<string, unknown>): void {
  if (typeof gtag !== 'undefined') {
    gtag('event', metric, params);
  }
}

export function startPerformanceTrace(name: PerformanceMetric): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance', {
        metric: name,
        duration,
      });
    }
  };
}
