// ============================================================================
// Rate Limiter for API calls
// ============================================================================

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  retryAfterMs: number;
  maxRetries: number;
}

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  retries: number;
  addedAt: number;
}

interface RateLimitState {
  requestsThisMinute: number;
  tokensThisMinute: number;
  minuteStartTime: number;
  lastRequestTime: number;
}

/**
 * Rate Limiter with request queue
 * Prevents exceeding API rate limits by queuing requests
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private state: RateLimitState;
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private requestCounter = 0;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 50, // Claude API default
      maxTokensPerMinute: config.maxTokensPerMinute ?? 40000,
      retryAfterMs: config.retryAfterMs ?? 5000,
      maxRetries: config.maxRetries ?? 3,
    };

    this.state = {
      requestsThisMinute: 0,
      tokensThisMinute: 0,
      minuteStartTime: Date.now(),
      lastRequestTime: 0,
    };
  }

  /**
   * Reset minute counters if a new minute has started
   */
  private resetIfNewMinute(): void {
    const now = Date.now();
    if (now - this.state.minuteStartTime >= 60000) {
      this.state.requestsThisMinute = 0;
      this.state.tokensThisMinute = 0;
      this.state.minuteStartTime = now;
    }
  }

  /**
   * Check if we can make a request
   */
  private canMakeRequest(): boolean {
    this.resetIfNewMinute();
    return this.state.requestsThisMinute < this.config.maxRequestsPerMinute;
  }

  /**
   * Calculate delay needed before next request
   */
  private getDelayMs(): number {
    this.resetIfNewMinute();

    if (this.canMakeRequest()) {
      // Minimum spacing between requests (1.2 seconds = 50 requests per minute)
      const minSpacing = 1200;
      const timeSinceLast = Date.now() - this.state.lastRequestTime;
      return Math.max(0, minSpacing - timeSinceLast);
    }

    // Wait until next minute
    const msUntilNextMinute = 60000 - (Date.now() - this.state.minuteStartTime);
    return msUntilNextMinute + 100; // Add small buffer
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      // Wait if needed
      const delay = this.getDelayMs();
      if (delay > 0) {
        await this.sleep(delay);
      }

      try {
        this.state.requestsThisMinute++;
        this.state.lastRequestTime = Date.now();

        const result = await request.execute();
        request.resolve(result);
        this.queue.shift();

      } catch (error) {
        const err = error as Error & { status?: number };

        // Check if rate limited (429)
        if (err.status === 429) {
          console.warn(`[RateLimiter] Rate limited, waiting ${this.config.retryAfterMs}ms...`);
          await this.sleep(this.config.retryAfterMs);
          request.retries++;

          if (request.retries >= this.config.maxRetries) {
            request.reject(new Error(`Max retries (${this.config.maxRetries}) exceeded`));
            this.queue.shift();
          }
          // Otherwise, keep in queue and retry
        } else {
          // Other error, reject and remove from queue
          request.reject(err);
          this.queue.shift();
        }
      }
    }

    this.processing = false;
  }

  /**
   * Add a request to the queue
   */
  async enqueue<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req-${++this.requestCounter}`,
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
        retries: 0,
        addedAt: Date.now(),
      };

      this.queue.push(request as QueuedRequest<unknown>);
      this.processQueue();
    });
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    queueLength: number;
    requestsThisMinute: number;
    tokensThisMinute: number;
    canMakeRequest: boolean;
  } {
    this.resetIfNewMinute();
    return {
      queueLength: this.queue.length,
      requestsThisMinute: this.state.requestsThisMinute,
      tokensThisMinute: this.state.tokensThisMinute,
      canMakeRequest: this.canMakeRequest(),
    };
  }

  /**
   * Record token usage (call after successful request)
   */
  recordTokenUsage(tokens: number): void {
    this.resetIfNewMinute();
    this.state.tokensThisMinute += tokens;
  }

  /**
   * Clear the queue (e.g., on shutdown)
   */
  clearQueue(): void {
    const errors = this.queue.map(req => req.reject);
    this.queue = [];
    errors.forEach(reject => reject(new Error('Queue cleared')));
  }
}

// Singleton instance for Claude API
let claudeRateLimiter: RateLimiter | null = null;

export function getClaudeRateLimiter(): RateLimiter {
  if (!claudeRateLimiter) {
    claudeRateLimiter = new RateLimiter({
      maxRequestsPerMinute: 50,
      maxTokensPerMinute: 40000,
      retryAfterMs: 5000,
      maxRetries: 3,
    });
  }
  return claudeRateLimiter;
}

// Helper function for rate-limited Claude API calls
export async function rateLimitedRequest<T>(
  request: () => Promise<T>
): Promise<T> {
  const limiter = getClaudeRateLimiter();
  return limiter.enqueue(request);
}
