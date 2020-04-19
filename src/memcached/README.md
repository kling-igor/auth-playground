<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

## Description

[Memcached](https://github.com/3rd-Eden/memcached) module for [Nest](https://github.com/nestjs/nest) heavily inspired by [nest-memcached](https://github.com/nest-cloud/memcached).

## Installation

```bash
$ npm i --save github:kling-igor/nest-memcached
```

## Usage

Import `MemcachedModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemcachedModule } from 'nest-memcached';

@Module({
  imports: [
    MemcachedModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const MEMCACHED_URI = configService.get<string>('MEMCACHED_URI') || '';
        return {
          uri: MEMCACHED_URI.replace(/\s/g, '').split(','),
          // use other memcached options here
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

Inject `MemcachedService`:

```typescript
import { Module } from '@nestjs/common';
import { MemcachedModule, MemcachedService } from 'nest-memcached';

import { TestService } from './test.service';

@Module({
  imports: [MemcachedModule],
  controllers: [],
  providers: [
    TestService
    MemcachedService,
  ],
  exports: [],
})
export class TestModule {}
```

```typescript
import { Injectable } from '@nestjs/common';

import { MemcachedService } from 'nest-memcached';

@Injectable()
export class TestService {
  constructor(private readonly memcachedService: MemcachedService) {}

  async test() {
    await this.memcachedService.set('foo', 42, 3600);
    const foo = await this.memcachedService.get('foo');
  }
}
```

## Options

```typescript
MemcachedModule.register({
  /* comma separated uri */
  uri: [],

  /* the maximum key size allowed */
  maxKeySize: 250,

  /* the maximum size of a value */
  maxValue: 1048576,

  /* the maximum size of the connection pool */
  poolSize: 10,

  /* the hashing algorithm used to generate the hashRing values */
  algorithm: 'md5',

  /* the time between reconnection attempts (in milliseconds) */
  reconnect: 18000000,

  /* the time after which Memcached sends a connection timeout (in milliseconds) */
  timeout: 5000,

  /* the number of socket allocation retries per request */
  retries: 5,

  /* the number of failed-attempts to a server before it is regarded as 'dead' */
  failures: 5,

  /* the time between a server failure and an attempt to set it up back in service */
  retry: 30000,

  /* if true, authorizes the automatic removal of dead servers from the pool */
  remove: false,

  /* an array of server_locations to replace servers that fail and that are removed from the consistent hashing scheme */
  failOverServers: undefined,

  /* whether to use md5 as hashing scheme when keys exceed maxKeySize */
  keyCompression: true,

  /* the idle timeout for the connections */
  idle: 5000,
});
```

## Async options

Quite often you might want to asynchronously pass your module options instead of passing them beforehand. In such case, use `registerAsync()` method, that provides a couple of various ways to deal with async data.

**1. Use factory**

```typescript
MemcachedModule.registerAsync({
  useFactory: () => ({
    uri: ['127.0.0.1:11211'],
  }),
});
```

Obviously, our factory behaves like every other one (might be `async` and is able to inject dependencies through `inject`).

```typescript
MemcachedModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.getString('MEMCACHED_URI').split(','),
  }),
  inject: [ConfigService],
}),
```

**2. Use class**

```typescript
MemcachedModule.registerAsync({
  useClass: MemcachedConfigService,
});
```

Above construction will instantiate `MemcachedConfigService` inside `MemcachedModule` and will leverage it to create options object.

```typescript
class MemcachedConfigService implements MemcachedOptionsFactory {
  createMemcachedOptions(): Promise<MemcachedOptions> | MemcachedOptions {
    return {
      uri: '127.0.0.1:11211',
    };
  }
}
```

**3. Use existing**

```typescript
MemcachedModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),
```

It works the same as `useClass` with one critical difference - `MemcachedModule` will lookup imported modules to reuse already created `ConfigService`, instead of instantiating it on its own.

## API

### Public methods

**touch** Touches the given key.

- `key`: **String** The key
- `lifetime`: **Number** After how long should the key expire measured in `seconds`

```typescript
await memcachedService.touch('key', 10);
```

**get** Get the value for the given key.

- `key`: **String**, the key

```typescript
const data = await memcachedService.get('foo');
```

**gets** Get the value and the CAS id.

- `key`: **String**, the key

```typescript
// Please note that the data is stored under the name of the given key.
const { foo, cas } = await memcachedService.gets('foo');
```

**getMulti** Retrieves a bunch of values from multiple keys.

- `keys`: **Array**, all the keys that needs to be fetched

```typescript
const { foo, bar } = await memcachedService.getMulti(['foo', 'bar']);
```

**set** Stores a new value in memcached.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
- `lifetime`: **Number**, how long the data needs to be stored measured in `seconds`

```typescript
await memcachedService.set('foo', '42', 10);
```

**replace** Replaces the value in memcached.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
- `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`

```typescript
await memcachedService.replace('foo', 'bar', 10);
```

**add** Add the value, only if it's not in memcached already.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
- `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`

```typescript
await memcachedService.add('foo', 'bar', 10);
```

**cas** Add the value, only if it matches the given CAS value.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
- `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`
- `cas`: **String** the CAS value

```typescript
const { cas } = await memcachedService.gets('foo');
await memcachedService.cas('foo', 'bar', cas, 10);
```

**append** Add the given value string to the value of an existing item.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.

```typescript
await memcachedService.append('foo', 'bar');
```

**prepend** Add the given value string to the value of an existing item.

- `key`: **String** the name of the key
- `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.

```typescript
await memcachedService.prepend('foo', 'bar');
```

**incr** Increment a given key.

- `key`: **String** the name of the key
- `amount`: **Number** The increment

```typescript
await memcachedService.incr('foo', 10);
```

**decr** Decrement a given key.

- `key`: **String** the name of the key
- `amount`: **Number** The increment

```typescript
await memcachedService.decr('foo', 10);
```

**del** Remove the key from memcached.

- `key`: **String** the name of the key

```typescript
await memcachedService.del('foo');
```

**memcachedClient** Return underneath memcached client. Use it if some modules require callback style interface.

```typescript
const memcachedClient = memcachedService.memcachedClient()

memcachedClient.touch('key', 10), err => {
  /* stuff */
});
```

## Events

When connection issues occur we send out different notifications using the
`EventEmitter` protocol. This can be useful for logging, notification and
debugging purposes. Each event will receive details Object containing detailed
information about the issues that occurred.

### Details Object

The details Object contains the various of error messages that caused, the
following 3 will always be present in all error events:

- `server`: the server where the issue occurred on
- `tokens`: a array of the parsed server string in `[port, hostname]` format.
- `messages`: a array containing all error messages that this server received.
  As messages are added to the array using .push(), the first issue will at the
  beginning and the latest error at the end of the array.

The following properties depend on the type of event that is send. If we are
still in our retry phase the details will also contain:

- `failures`: the amount of failures left before we mark the server as dead.
- `totalFailures`: the total amount of failures that occurred on this server, as when the
  server has been reconnected after it's dead the `failures` will be rest to
  defaults and messages will be removed.

If the server is dead these details will be added:

- `totalReconnectsAttempted`: the total reconnects we have attempted. This is
  the success and failure combined.
- `totalReconnectsSuccess`: the total successful reconnects we have made.
- `totalReconnectsFailed`: the total failed reconnects we have made.
- `totalDownTime`: the total down time that was generated. Formula: (
  totalReconnectsFailed _ reconnect_timeout ) + ( totalRetries _ retry_timeout).

### Events

There are `5` different events that the `memcached` client emits when connection
issues occur.

- `issue`: a issue occurred on one a server, we are going to attempt a retry next.
- `failure`: a server has been marked as failure or dead.
- `reconnecting`: we are going to attempt to reconnect the to the failed server.
- `reconnect`: successfully reconnected to the memcached server.
- `remove`: removing the server from our consistent hashing.

Example implementations:

```typescript
memcachedService.on('failure', details => {
  sys.error('Server ' + details.server + 'went down due to: ' + details.messages.join(''));
});

memcachedService.on('reconnecting', details => {
  sys.debug('Total downtime caused by server ' + details.server + ' :' + details.totalDownTime + 'ms');
});
```

# License

The module is released under the MIT license. See the
[LICENSE](/kling-igor/node-memcached/blob/master/LICENSE) for more information.
