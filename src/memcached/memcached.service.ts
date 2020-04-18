import { Inject, Injectable, Logger } from '@nestjs/common';
import * as MemcachedClient from 'memcached';
import { MemcachedOptions } from './interfaces/memcached-options.interface';

import { MEMCACHED_MODULE_OPTIONS } from './memcached.constants';

@Injectable()
export class MemcachedService {
  private readonly client: MemcachedClient;

  private readonly logger = new Logger('MemcachedService');

  constructor(@Inject(MEMCACHED_MODULE_OPTIONS) options: MemcachedOptions) {
    const { uri } = options;

    this.logger.log(`Using uri ${uri}`);

    this.client = new MemcachedClient(uri, options);
  }

  get raw() {
    return this.client;
  }

  async touch(key: string, lifetime?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.touch(key, lifetime, err => (err ? reject(err) : resolve()));
    });
  }

  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) return reject(err);

        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
  }

  async gets(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.gets(key, (err, data) => {
        if (err) return reject(err);

        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
  }

  async getMulti(keys: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.getMulti(keys, (err, data) => {
        if (err) return reject(err);

        const result = data.map(item => {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        });

        resolve(result);
      });
    });
  }

  async set(key: string, value: any, lifetime?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, lifetime, err => (err ? reject(err) : resolve()));
    });
  }

  async replace(key: string, value: any, lifetime?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.replace(key, value, lifetime, err => (err ? reject(err) : resolve()));
    });
  }

  async cas(key: string, value: any, lifetime: number, cas: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.cas(key, value, lifetime, cas, err => (err ? reject(err) : resolve()));
    });
  }

  async append(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.append(key, value, err => (err ? reject(err) : resolve()));
    });
  }

  async prepend(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.append(key, value, err => (err ? reject(err) : resolve()));
    });
  }

  async incr(key: string, amount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.incr(key, amount, err => (err ? reject(err) : resolve()));
    });
  }

  async decr(key: string, amount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.decr(key, amount, err => (err ? reject(err) : resolve()));
    });
  }

  async del(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(key, err => (err ? reject(err) : resolve()));
    });
  }

  on(event: string, callback): void {
    this.client.on(event, callback);
  }
}
