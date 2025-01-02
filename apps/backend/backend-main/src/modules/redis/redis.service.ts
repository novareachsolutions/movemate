import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

import { logger } from "../../logger";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisOptions: RedisOptions = {
      host: this.configService.get<string>("REDIS_HOST"),
      port: this.configService.get<number>("REDIS_PORT"),
    };
    this.redisClient = new Redis(redisOptions);

    this.redisClient.on("connect", () => {
      logger.info("Connected to Redis server");
    });

    this.redisClient.on("error", (error: unknown) => {
      logger.error("Error connecting to Redis:", error);
    });
  }

  async set(
    key: string,
    value: any,
    expiryMode: "EX" = "EX",
    time?: number,
  ): Promise<void> {
    await this.redisClient.set(key, value, expiryMode, time || 300);
  }

  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number | string): Promise<number> {
    return await this.redisClient.expire(key, seconds);
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
    logger.info("Redis client disconnected");
  }
}
