import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { MemcachedOptions } from './memcached-options.interface';

export interface MemcachedOptionsFactory {
  createMemcachedOptions(): Promise<MemcachedOptions> | MemcachedOptions;
}

export interface MemcachedModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MemcachedOptionsFactory>;
  useClass?: Type<MemcachedOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<Partial<MemcachedOptions>> | Partial<MemcachedOptions>;
  inject?: any[];
}
