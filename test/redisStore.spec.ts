import Redis, { RedisOptions } from 'ioredis';
import { RedisStore } from '../src';
import { Utils } from './utils';

const { env } = process;

describe('RedisStore', () => {
    let db: Redis;
    let store: RedisStore;

    beforeAll(async () => {
        db = new Redis({
            host: env.REDIS_HOST || 'localhost',
            port: env.REDIS_PORT || 6379,
            password: env.REDIS_PASSWORD,
            db: env.REDIS_DATABASE || 0,
            lazyConnect: true
        } as RedisOptions);

        await db.connect();
        store = new RedisStore(db);
    });

    afterAll(async () => {
        if(db != null) {
            db.disconnect();
        }
    });

    it('should initialize correctly', () => {
        expect(store.db).toBe(db);
    });

    it('should correctly slide the time window', async () => {
        const bucket = 'main';
        const key = 't1';
        const key2 = 't2';
        const windowMs = 2000; // 5 seconds
        const maxLimit = 5;

        // Initial hit
        await store.hit(bucket, key, { windowMs, maxLimit});
        await store.hit(bucket, key2, { windowMs, maxLimit});
        await Utils.wait(2000);

        // New hits will enforce window sliding
        await store.hit(bucket, key, { windowMs, maxLimit });
        await store.hit(bucket, key, { windowMs, maxLimit });
        await store.hit(bucket, key2, { windowMs, maxLimit});
        const remaining = await store
            .hit(bucket, key, { windowMs, maxLimit});

        // Expect the oldest timestamp to be removed
        expect(remaining).toBe(2);
    });

    // We must use different bucket or key to get accurate data
    // because current case will be executed directly after the previous case
    // which will hit the same previews key window and return invalid remaining value
    it('should correctly limit requests within the window', async () => {
        const bucket = 'main';
        const key = 't3';
        const windowMs = 5000; // 5 seconds
        const maxLimit = 3;

        // Hit the limiter three times within the window
        for (let i = 0; i < maxLimit; i++) {
            const remaining = await store
                .hit(bucket, key, { windowMs, maxLimit });
            expect(remaining).toBe(maxLimit - (i + 1));
        }

        // The fourth request should return 0 remaining requests
        const remaining = await store
            .hit(bucket, key, { windowMs, maxLimit });
        expect(remaining).toBe(0);
    });

    it('should not allow requests beyond the max limit', async () => {
        const bucket = 'main';
        const key = 't4';
        const windowMs = 5000; // 5 seconds
        const maxLimit = 2;

        // Hit the limiter twice within the window
        for (let i = 0; i < maxLimit; i++) {
            const remaining = await store
                .hit(bucket, key, { windowMs, maxLimit });
            expect(remaining).toBe(maxLimit - (i + 1));
        }

        // The third request should return 0 remaining requests
        const remaining = await store
            .hit(bucket, key, { windowMs, maxLimit });
        expect(remaining).toBe(0);

        // Attempt one more request, which should return 0 remaining requests
        const extraRequest = await store
            .hit(bucket, key, { windowMs, maxLimit });
        expect(extraRequest).toBe(0);
    });
});
