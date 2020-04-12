import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { ModelSchemaService } from './model-schema.service';
import { DocumentRepository } from './document.repository';

const querySelectors = {
  equal: '$eq',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  ne: '$ne',
  in: '$in',
  nin: '$nin',
  regex: '$regex',
  exist: '$exist',
};

const logicalSelectors = {
  and: '$and',
  or: '$or',
};

const arrayOperators = {
  elemMatch: '$elemMatch',
};

declare type Options = Record<string, any>;

const prepareFieldsFilter = (filters: [Options], wrapKeys = false): Options => {
  let preparedFilters: Options = {};

  for (const filter of filters) {
    const { operator, paramName, value, modificators = [] } = filter;

    const queryOperator = querySelectors[operator];
    const logicalSelector = logicalSelectors[operator];
    const arrayOperator = arrayOperators[operator];

    if (queryOperator) {
      const prepareFilter = {
        [paramName]: {
          [queryOperator]: (operator === 'in' || operator === 'nin') && !Array.isArray(value) ? [value] : value,
        },
      };

      if (operator === 'regex') {
        prepareFilter[paramName]['$options'] = modificators.join('');
      }

      if (wrapKeys) {
        preparedFilters = prepareFilter;
      } else {
        preparedFilters = { ...preparedFilters, ...prepareFilter };
      }
    } else if (logicalSelector) {
      preparedFilters[logicalSelector] = prepareFieldsFilter(value, true);
    } else if (arrayOperator) {
      preparedFilters[paramName] = {
        [arrayOperator]: prepareFieldsFilter(value),
      };
    } else {
      throw new Error(`Unsupported operator '${operator}'`);
    }
  }

  return preparedFilters;
};

const makeOptions = (fields?: [string], sort?: [Record<string, number>], limit?: number, offset?: number): Options => {
  const options: Options = {};

  if (fields) {
    options.projection = fields.reduce<Options>((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {});
  }

  if (sort) {
    options.sort = sort;
  }

  if (limit) {
    options.limit = limit;
  }

  if (offset) {
    options.skip = offset;
  }

  return options;
};

const isValidId = (id: string): boolean => /^[0-9a-z]{24}$/.test(id);

// сомнительный функционал !!!!
// const validIdExist = (array: [string]) => {
//   if (array.length === 1) {
//     return isValidId(array[0]);
//   } else {
//     for (const value of array) {
//       if (Array.isArray(value)) {
//         return validIdExist(value);
//       }
//     }
//   }
// };

// const prepareId = (filter: Options, parentKey = '') => {
//   const result: Options = {};

//   for (const [key, value] of Object.entries(filter)) {
//     if (key === 'id') {
//       if (Array.isArray(value) && validIdExist(value as [string])) {
//         prepareId(value, key);
//       }
//     } else if (parentKey === 'id' && key.startsWith('$') && value) {
//       if (Array.isArray(value)) {
//       } else {
//       }
//     } else if (Array.isArray(value)) {
//       prepareId(value, key); // !!!!! array or object !!
//     }
//   }
// };

@Injectable()
export class DataService {
  constructor(
    private readonly modelSchemaService: ModelSchemaService,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async save(project: string, configId: string, modelName: string, documents: [any]): Promise<any> {
    // получаем схему модели

    const schema = await this.modelSchemaService.getSchema(modelName, project, configId);

    if (!schema) {
      throw new BadRequestException(`Unable to find model '${modelName}'`);
    }

    if (!schema.source) {
      throw new BadRequestException(`Unable to find model '${modelName}' source`);
    }

    const {
      source: { name: collection },
    } = schema;

    const savedDocuments = [];

    for await (const document of documents) {
      const { _id, uptime, content } = await this.documentRepository.save(project, collection, document);
      savedDocuments.push({ id: _id, uptime, ...content });
    }

    return savedDocuments;
  }

  async findAll(
    project: string,
    configId: string,
    modelName: string,
    filters: [Record<string, any>],
    fields: [string],
    sort: [Record<string, number>],
    limit: number,
    offset: number,
  ): Promise<any> {
    const preparedFilters: Options = prepareFieldsFilter(filters);
    const options: Options = makeOptions(fields, sort, limit, offset);

    // $collection = $this->getDb()->selectCollection($name);

    // заменяем в filter все id на _id
    // self::prepareId($filter);

    // /** @var BSONDocument $data */
    // foreach ($collection->find($filter, $options) as $data) {
    //     $conf = $data->getArrayCopy();
    //     $conf['id'] = (string) $conf['_id'];
    //     unset($conf['_id']);
    //     yield $conf;
    // }

    return;
  }
}

//     /**
//      * @param array  $filter
//      * @param string $parentKey
//      */
// function prepareId(array &$filter, string $parentKey = ''): void {
//++   foreach ($filter as $key => &$value) {
//       if ($key === 'id') {
//         if (is_array($value) && self::arrayValidIdExist($value)) {
//           self::prepareId($value, $key);
//           $filter['_id'] = $filter['id'];
//           unset($filter['id']);
//         } elseif (!is_array($value) && self::isValidId($value)) {
//           $value = new ObjectID($value);
//           $filter['_id'] = $filter['id'];
//           unset($filter['id']);
//         }
//      } elseif ($parentKey == 'id' && self::isOperator($key) && !empty($value)) {
//           if (is_array($value)) {
//               foreach ($value as &$subValue) {
//                   $subValue = self::isValidId($subValue) ? new ObjectID($subValue) : $subValue;
//               }
//           } else {
//               $value = self::isValidId($value) ? new ObjectID($value) : $value;
//           }
//       } elseif (is_array($value)) {
//           self::prepareId($value, $key);
//       }
//   }
// }

// /**
//  *  Рекурсивная проверка массива на наличие ID документов
//  *
//  * @param array $array
//  *
//  * @return bool
//  */
// private static function arrayValidIdExist($array): bool {
//   if (count($array) == count($array, COUNT_RECURSIVE)) {
//     return self::isValidId((string)array_shift($array));
//   } else {
//     foreach ($array as $value) {
//       if (is_array($value)) {
//         return self::arrayValidIdExist($value);
//       }
//     }
//   }
// }
