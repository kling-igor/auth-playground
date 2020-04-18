# Import module

```js
import { Module } from '@nestjs/common';
import { MemcachedModule } from './memcached';

@Module({
  imports: [
    MemcachedModule.register({
      uri: ['192.168.0.20:11211'],
      retries: 3,
    }),
  ],
})
export class ApplicationModule {}
```

# Client Injection

```js
import { Component } from '@nestjs/common';
import { InjectMemcachedClient, MemcachedService } from './memcached';

@Component()
export class TestService {
  constructor(@InjectMemcachedClient() private readonly memService: MemcachedService) {}

  async addValue(key: string, value: string): Promise<void> {
      await this.memService.add(key, value);
  }

  async deleteValue(key: string): Promise<void> {
      await this.memService.del(key);
  }
}
```
