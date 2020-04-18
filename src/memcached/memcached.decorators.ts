import { Inject } from '@nestjs/common';

import { MEMCACHED_MODULE_OPTIONS } from './memcached.constants';

export const InjectMemcachedService = () => Inject(MEMCACHED_MODULE_OPTIONS);
