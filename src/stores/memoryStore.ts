import {RateLimiterStore, WindowOptions} from "../types";

export interface MemoryStoreBucket {
    [key: string]: Array<number>
}
export class MemoryStore extends RateLimiterStore {
    protected _buckets: {
        [key: string]: MemoryStoreBucket
    } = {};

    private slideWindow(
        bucket: string,
        key: string,
        now: number,
        windowMs: number
    ): void {
        const keyWindow = this._buckets[bucket][key] || [];
        while (keyWindow[0] <= now - windowMs) {
            keyWindow.shift();
        }
    }

    get buckets(): { [key: string]: MemoryStoreBucket } {
        return this._buckets;
    }

    async hit(
        bucket: string,
        key: string,
        options: WindowOptions
    ): Promise<number> {
        const { windowMs, maxLimit} = options;
        const now = Date.now();
        if(this._buckets[bucket] == null) {
            this._buckets[bucket] = {
                [key]: []
            };
        }

        if(this._buckets[bucket][key] == null) {
            this._buckets[bucket][key] = [];
        }

        this.slideWindow(bucket, key, now, windowMs);
        if(this._buckets[bucket][key].length < maxLimit) {
            this._buckets[bucket][key].push(now);
        }

        return maxLimit - this._buckets[bucket][key].length;
    }
}
