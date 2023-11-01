import { RateLimiterStore, WindowOptions } from '../src';

class ExStore extends RateLimiterStore {
    async hit(bucket: string, key: string, options: WindowOptions): Promise<number> {
        return super.hit(bucket, key, options);
    }
}

describe('ExtendedStore', () => {
    let store: ExStore;

    beforeEach(() => {
        store = new ExStore();
    });

    it('should initialize correctly', () => {
        expect(store).toBeInstanceOf(RateLimiterStore);
    });

    it('should return error if base class `hit` invoked', async () => {
        await expect(store.hit('bucket', 'key', { windowMs: 5000, maxLimit: 5 }))
            .rejects
            .toThrowError();
    });
});
