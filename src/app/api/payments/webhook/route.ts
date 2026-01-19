// ============================================================================
// API ROUTE: /api/payments/webhook - YooKassa Webhook Handler
// ============================================================================
//
// YooKassa отправляет уведомления о событиях платежей на этот endpoint.
// Настройте webhook URL в личном кабинете YooKassa:
// https://your-domain.com/api/payments/webhook
//
// Важно: YooKassa использует IP-whitelist для безопасности.
// Разрешённые IP: 185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25, 77.75.156.11, 77.75.156.35
//

import { NextResponse } from 'next/server';
import { getYooKassaClient, type WebhookPayload } from '@/lib/payments/yookassa';
import { getAnalytics } from '@/lib/analytics';

// YooKassa IP ranges (для проверки в middleware)
export const YOOKASSA_IPS = [
  '185.71.76.',
  '185.71.77.',
  '77.75.153.',
  '77.75.156.11',
  '77.75.156.35',
];

/**
 * POST /api/payments/webhook
 * Обработка webhook от YooKassa
 */
export async function POST(request: Request) {
  try {
    // Получаем тело запроса
    const body = await request.json();

    const client = getYooKassaClient();
    const analytics = getAnalytics();

    // Валидируем формат webhook
    if (!client.validateWebhook(body)) {
      console.error('Invalid webhook payload:', body);
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const payload = body as WebhookPayload;
    const payment = payload.object;
    const ventureId = payment.metadata?.ventureId;

    console.log(`[YooKassa Webhook] Event: ${payload.event}, Payment: ${payment.id}, Status: ${payment.status}`);

    // Обрабатываем разные события
    switch (payload.event) {
      case 'payment.succeeded':
        // Платёж успешно завершён
        analytics.trackEvent('payment_succeeded', ventureId, {
          paymentId: payment.id,
          amount: parseFloat(payment.amount.value),
          currency: payment.amount.currency,
        });

        // Здесь можно:
        // - Обновить статус заказа в БД
        // - Отправить email пользователю
        // - Активировать подписку
        // - Обновить метрики venture

        if (ventureId) {
          analytics.trackPurchase(
            ventureId,
            parseFloat(payment.amount.value),
            payment.amount.currency as 'RUB'
          );
        }
        break;

      case 'payment.waiting_for_capture':
        // Платёж ожидает подтверждения (для двухстадийных платежей)
        analytics.trackEvent('payment_waiting_capture', ventureId, {
          paymentId: payment.id,
        });
        break;

      case 'payment.canceled':
        // Платёж отменён
        analytics.trackEvent('payment_canceled', ventureId, {
          paymentId: payment.id,
        });
        break;

      case 'refund.succeeded':
        // Возврат успешно выполнен
        analytics.trackEvent('refund_succeeded', ventureId, {
          paymentId: payment.id,
          amount: parseFloat(payment.amount.value),
        });
        break;

      default:
        console.log(`[YooKassa Webhook] Unhandled event: ${payload.event}`);
    }

    // Возвращаем 200 OK для подтверждения получения
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    // Возвращаем 200 даже при ошибке, чтобы YooKassa не ретраила
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/payments/webhook
 * Проверка доступности endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'YooKassa webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
