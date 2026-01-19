// ============================================================================
// API ROUTE: /api/payments/[id] - Get payment by ID
// ============================================================================

import { NextResponse } from 'next/server';
import { getYooKassaClient } from '@/lib/payments/yookassa';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/payments/[id]
 * Получить информацию о платеже
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const client = getYooKassaClient();

    if (!client.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

    const payment = await client.getPayment(id);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
        paid: payment.paid,
        createdAt: payment.created_at,
        metadata: payment.metadata,
      },
    });
  } catch (error) {
    console.error('Payment get API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/[id]
 * Отменить платёж
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const client = getYooKassaClient();

    if (!client.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

    let payment;

    switch (action) {
      case 'cancel':
        payment = await client.cancelPayment(id);
        break;

      case 'capture':
        payment = await client.capturePayment(id, body.amount);
        break;

      case 'refund':
        if (!body.amount) {
          return NextResponse.json(
            { success: false, error: 'Amount is required for refund' },
            { status: 400 }
          );
        }
        const refund = await client.createRefund(id, body.amount, body.description);
        return NextResponse.json({
          success: true,
          refund,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: cancel, capture, or refund' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error('Payment action API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
