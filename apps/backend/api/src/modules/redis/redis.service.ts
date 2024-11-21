import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { logger } from '../../logger';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redisClient: Redis;

  private setupEventListeners(client: Redis) {
    client.on('connect', () => {
      logger.info('Connected to Redis server');
    });
    client.on('error', (error: unknown) => {
      logger.error('Error connecting to Redis:', error);
    });
  }

  constructor(private readonly configService: ConfigService) {
    const redisOptions: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    };
    this.redisClient = new Redis(redisOptions);

    this.setupEventListeners(this.redisClient);
    this.redisClient.on('connect', () => {
      logger.info('Connected to Redis server');
    });

    this.redisClient.on('error', (error: unknown) => {
      logger.error('Error connecting to Redis:', error);
    });
  }

  onModuleInit() {}

  async set(
    key: string,
    value: any,
    expiryMode: 'EX' = 'EX',
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
}
