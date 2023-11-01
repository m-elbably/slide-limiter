import {RateLimiterOptions, WindowOptions, RateLimiterStore } from "./types";

export class SlideLimiter {
    protected _store: RateLimiterStore;
    protected _options: RateLimiterOptions;

    // Default options
    static readonly defaultWindowMs = 60000;
    static readonly defaultMaxLimit = 10;

    /**
     * Create a rate limiter
     * @param {RateLimiterStore} store - The rate limiter store
     * @param {RateLimiterOptions} options - The rate limiter options
     */
    constructor(store: RateLimiterStore, options?: RateLimiterOptions) {
        this._store = store;
        this._options = {
            windowMs: options?.windowMs || SlideLimiter.defaultWindowMs,
            maxLimit: options?.maxLimit || SlideLimiter.defaultMaxLimit
        };
    }

    get options(): RateLimiterOptions {
        return this._options;
    }

    get store(): RateLimiterStore {
        return this._store;
    }

    /**
     * Hit a rate limiter
     * @param bucket - The rate limiter bucket name
     * @param {string} key - The rate limiter key
     * @param {WindowOptions} options - The rate limiter window options
     * @returns {Promise<number>} - The number of requests remaining
     */
    async hit(
        bucket: string,
        key: string,
        options: WindowOptions = {
            windowMs: this._options.windowMs,
            maxLimit: this._options.maxLimit
        }
    ): Promise<number> {
        return this._store.hit(bucket, key, {
            ...options
        });
    }
}
