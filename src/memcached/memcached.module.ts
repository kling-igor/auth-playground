import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { MemcachedService } from './memcached.service';
import { MemcachedOptions } from './interfaces/memcached-options.interface';

import { MemcachedOptionsFactory, MemcachedModuleAsyncOptions } from './interfaces/memcached-module-options.interface';

import { MEMCACHED_MODULE_OPTIONS } from './memcached.constants';

@Global()
@Module({})
export class MemcachedModule {
  public static register(options: MemcachedOptions): DynamicModule {
    return {
      module: MemcachedModule,
      providers: [{ provide: MEMCACHED_MODULE_OPTIONS, useValue: options || {} }, MemcachedService],
      exports: [{ provide: MEMCACHED_MODULE_OPTIONS, useValue: options || {} }, MemcachedService],
    };
  }

  public static registerAsync(options: MemcachedModuleAsyncOptions): DynamicModule {
    return {
      module: MemcachedModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), MemcachedService], // тут провайдится MEMCACHED_MODULE_OPTIONS
      exports: [{ provide: MEMCACHED_MODULE_OPTIONS, useValue: options || {} }, MemcachedService],
    };
  }

  private static createAsyncProviders(options: MemcachedModuleAsyncOptions): Provider[] {
    const provider = this.createAsyncOptionsProvider(options);

    if (options.useExisting || options.useFactory) {
      return [provider];
    }
    return [
      provider,
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: MemcachedModuleAsyncOptions): Provider {
    if (options.useFactory) {
      // for useFactory
      return {
        provide: MEMCACHED_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // For useExisting...
    return {
      provide: MEMCACHED_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MemcachedOptionsFactory) => await optionsFactory.createMemcachedOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
