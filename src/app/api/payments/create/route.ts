// ============================================================================
// API ROUTE: /api/payments/create - Создание платежа YooKassa
// ============================================================================

import { NextResponse } from 'next/server';
import { getYooKassaClient } from '@/lib/payments/yookassa';
import { getAnalytics } from '@/lib/analytics';

interface CreatePaymentRequest {
  amount: number;
  description: string;
  ventureId?: string;
  userId?: string;
  metadata?: Record<string, string>;
}

/**
 * POST /api/payments/create
 * Создать новый платёж
 */
export async function POST(request: Request) {
  try {
    const body: CreatePaymentRequest = await request.json();

    // Валидация
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount is required and must be positive' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    const client = getYooKassaClient();

    // Проверяем, настроена ли интеграция
    if (!client.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment system is not configured',
          message: 'Please configure YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in environment variables'
        },
        { status: 503 }
      );
    }

    // Создаём платёж
    const payment = await client.createPayment({
      amount: body.amount,
      currency: 'RUB',
      description: body.description,
      ventureId: body.ventureId,
      userId: body.userId,
      metadata: body.metadata,
    });

    // Логируем событие
    const analytics = getAnalytics();
    analytics.trackEvent('payment_created', body.ventureId, {
      paymentId: payment.id,
      amount: body.amount,
      status: payment.status,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        confirmationUrl: payment.confirmation?.confirmation_url,
      },
    });
  } catch (error) {
    console.error('Payment create API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/create
 * Получить статус конфигурации
 */
export async function GET() {
  try {
    const client = getYooKassaClient();

    return NextResponse.json({
      success: true,
      configured: client.isConfigured(),
      message: client.isConfigured()
        ? 'YooKassa is configured and ready'
        : 'YooKassa is not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY',
    });
  } catch (error) {
    console.error('Payment status API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
