class RateLimiter {
	private requests: Map<string, number[]> = new Map();
	private readonly windowMs: number;
	private readonly maxRequests: number;

	constructor(windowMs = 60000, maxRequests = 100) {
		this.windowMs = windowMs;
		this.maxRequests = maxRequests;
	}

	isRateLimited(key: string): boolean {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		if (!this.requests.has(key)) {
			this.requests.set(key, [now]);
			return false;
		}

		const requests = this.requests.get(key)!.filter((timestamp) => timestamp > windowStart);

		requests.push(now);
		this.requests.set(key, requests);

		return requests.length > this.maxRequests;
	}
}

export const rateLimiter = new RateLimiter();
