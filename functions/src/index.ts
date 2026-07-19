import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';

export const health = onCall(async () => {
  return { status: 'healthy', timestamp: Date.now() };
});

export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  logger.info('Order created', { orderId: event.params.orderId });
});
