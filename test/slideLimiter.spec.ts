import {SlideLimiter, MemoryStore, RateLimiterStore} from '../src';

describe('SlideLimiter', () => {
    let store: RateLimiterStore;
    let slideLimiter: SlideLimiter;

    beforeEach(() => {
        store = new MemoryStore();
        slideLimiter = new SlideLimiter(store);
    });

    it('should initialize with default options', () => {
        expect(slideLimiter.options.windowMs).toBe(SlideLimiter.defaultWindowMs);
        expect(slideLimiter.options.maxLimit).toBe(SlideLimiter.defaultMaxLimit);
    });

    it('should initialize with custom options', () => {
        const windowMs = 5000; // 5 seconds
        const maxLimit = 3;

        const slideLimiter = new SlideLimiter(new MemoryStore(), {
            windowMs,
            maxLimit
        });
        expect(slideLimiter.options.windowMs).toBe(windowMs);
        expect(slideLimiter.options.maxLimit).toBe(maxLimit);
    });

    it('should return current store', () => {
        expect(slideLimiter.store).toBe(store);
    });

    it('should allow requests within the window', async () => {
        const bucket = 'main';
        const key = 't1';
        const windowMs = 5000; // 5 seconds
        const maxLimit = 3;

        // Hit the limiter three times within the window
        for (let i = 0; i < maxLimit; i++) {
            const remaining = await slideLimiter
                .hit(bucket, key, { windowMs, maxLimit });
            expect(remaining).toBe(maxLimit - (i + 1));
        }

        // The fourth request should return 0 remaining requests
        const remaining = await slideLimiter
            .hit(bucket, key, { windowMs, maxLimit });
        expect(remaining).toBe(0);
    });

    it('should not allow requests beyond the max limit', async () => {
        const bucket = 'main';
        const key = 't2';
        const windowMs = 5000; // 5 seconds
        const maxLimit = 2;

        // Hit the limiter twice within the window
        for (let i = 0; i < maxLimit; i++) {
            const remaining = await slideLimiter
                .hit(bucket, key, { windowMs, maxLimit });
            expect(remaining).toBe(maxLimit - (i + 1));
        }

        // The third request should return 0 remaining requests
        const remaining = await slideLimiter
            .hit(bucket, key, { windowMs, maxLimit });
        expect(remaining).toBe(0);

        // Attempt one more request, which should return 0 remaining requests
        const extraRequest = await slideLimiter
            .hit(bucket, key, { windowMs, maxLimit });
        expect(extraRequest).toBe(0);
    });
});
