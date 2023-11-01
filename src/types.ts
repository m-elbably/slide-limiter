export interface WindowOptions {
    windowMs: number;
    maxLimit: number;
}
export interface RateLimiterOptions extends WindowOptions {}

export class RateLimiterStore {
    constructor(protected config = {}) {}

    async hit(
        bucket: string,
        key: string,
        options?: WindowOptions
    ): Promise<number> {
        throw new Error('Method Not implemented');
    }
}
