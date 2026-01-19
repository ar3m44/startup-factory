// ============================================================================
// YOOKASSA - Интеграция с платёжной системой YooKassa
// ============================================================================
//
// Документация API: https://yookassa.ru/developers/api
//
// Для использования необходимо:
// 1. Зарегистрироваться на https://yookassa.ru
// 2. Получить shopId и secretKey в личном кабинете
// 3. Добавить в .env.local:
//    YOOKASSA_SHOP_ID=your_shop_id
//    YOOKASSA_SECRET_KEY=your_secret_key
//    YOOKASSA_RETURN_URL=https://your-domain.com/payment/success
//

export interface YooKassaConfig {
  shopId: string;
  secretKey: string;
  returnUrl: string;
}

export interface CreatePaymentParams {
  amount: number;
  currency: 'RUB' | 'USD';
  description: string;
  metadata?: Record<string, string>;
  ventureId?: string;
  userId?: string;
}

export interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  description: string;
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  metadata?: Record<string, string>;
  created_at: string;
  paid: boolean;
}

export interface WebhookPayload {
  type: string;
  event: string;
  object: YooKassaPayment;
}

/**
 * YooKassa Client - работа с API платежей
 */
export class YooKassaClient {
  private config: YooKassaConfig;
  private baseUrl = 'https://api.yookassa.ru/v3';

  constructor(config?: Partial<YooKassaConfig>) {
    this.config = {
      shopId: config?.shopId || process.env.YOOKASSA_SHOP_ID || '',
      secretKey: config?.secretKey || process.env.YOOKASSA_SECRET_KEY || '',
      returnUrl: config?.returnUrl || process.env.YOOKASSA_RETURN_URL || 'http://localhost:3000/payment/success',
    };
  }

  /**
   * Проверить, настроена ли интеграция
   */
  isConfigured(): boolean {
    return !!(this.config.shopId && this.config.secretKey);
  }

  /**
   * Получить auth header для запросов
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.shopId}:${this.config.secretKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Генерировать idempotency key
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Создать платёж
   */
  async createPayment(params: CreatePaymentParams): Promise<YooKassaPayment> {
    if (!this.isConfigured()) {
      throw new Error('YooKassa is not configured. Please set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY');
    }

    const body = {
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency,
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.returnUrl,
      },
      capture: true, // Автоматическое подтверждение платежа
      description: params.description,
      metadata: {
        ...params.metadata,
        ventureId: params.ventureId || '',
        userId: params.userId || '',
      },
    };

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotencyKey(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YooKassa API error: ${error.description || error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Получить информацию о платеже
   */
  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    if (!this.isConfigured()) {
      throw new Error('YooKassa is not configured');
    }

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YooKassa API error: ${error.description || error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Подтвердить платёж (для двухстадийных платежей)
   */
  async capturePayment(paymentId: string, amount?: number): Promise<YooKassaPayment> {
    if (!this.isConfigured()) {
      throw new Error('YooKassa is not configured');
    }

    const body: Record<string, unknown> = {};
    if (amount !== undefined) {
      body.amount = {
        value: amount.toFixed(2),
        currency: 'RUB',
      };
    }

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotencyKey(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YooKassa API error: ${error.description || error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Отменить платёж
   */
  async cancelPayment(paymentId: string): Promise<YooKassaPayment> {
    if (!this.isConfigured()) {
      throw new Error('YooKassa is not configured');
    }

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotencyKey(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YooKassa API error: ${error.description || error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Создать возврат
   */
  async createRefund(paymentId: string, amount: number, description?: string): Promise<Record<string, unknown>> {
    if (!this.isConfigured()) {
      throw new Error('YooKassa is not configured');
    }

    const body = {
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      description: description || 'Возврат средств',
    };

    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotencyKey(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YooKassa API error: ${error.description || error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Валидировать webhook подпись
   * YooKassa использует IP-whitelist вместо подписи, поэтому просто проверяем формат
   */
  validateWebhook(payload: unknown): payload is WebhookPayload {
    if (!payload || typeof payload !== 'object') return false;

    const p = payload as Record<string, unknown>;
    return (
      typeof p.type === 'string' &&
      typeof p.event === 'string' &&
      typeof p.object === 'object' &&
      p.object !== null
    );
  }
}

// Singleton instance
let yooKassaInstance: YooKassaClient | null = null;

export function getYooKassaClient(): YooKassaClient {
  if (!yooKassaInstance) {
    yooKassaInstance = new YooKassaClient();
  }
  return yooKassaInstance;
}

/**
 * Helper для быстрого создания платежа
 */
export async function createQuickPayment(
  amount: number,
  description: string,
  ventureId?: string
): Promise<{ paymentUrl: string; paymentId: string }> {
  const client = getYooKassaClient();
  const payment = await client.createPayment({
    amount,
    currency: 'RUB',
    description,
    ventureId,
  });

  if (!payment.confirmation?.confirmation_url) {
    throw new Error('Payment created but no confirmation URL returned');
  }

  return {
    paymentUrl: payment.confirmation.confirmation_url,
    paymentId: payment.id,
  };
}
