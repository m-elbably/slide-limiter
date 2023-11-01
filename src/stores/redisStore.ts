import Redis from "ioredis";
import {RateLimiterStore, WindowOptions} from "../types";

export class RedisStore extends RateLimiterStore {
    constructor(private _db: Redis) {
        super();
        this.initialize();
    }

    private initialize() {
        this._db.defineCommand('hit', {
            numberOfKeys: 2,
            lua: `
                local current_time = redis.call('TIME')
                local bucket = KEYS[1]
                local id = KEYS[2]

                local key = bucket .. ":" .. id
                local window = tonumber(ARGV[1]) / 1000
                local limit = tonumber(ARGV[2])

                local trim_time = tonumber(current_time[1]) - window
                redis.call('ZREMRANGEBYSCORE', key, 0, trim_time)
                local request_count = redis.call('ZCARD', key)

                if request_count < limit then
                  redis.call('ZADD', key, current_time[1], current_time[1] .. current_time[2])
                  redis.call('EXPIRE', key, window)
                  return limit - request_count - 1;
                end
                return 0
            `
        })
    }

    get db(): Redis {
        return this._db;
    }

    async hit(
        bucket: string,
        key: string,
        options: WindowOptions
    ): Promise<number> {
        const {
            windowMs,
            maxLimit
        } = options;
        return (this._db as any).hit(bucket, key, windowMs, maxLimit);
    }
}
