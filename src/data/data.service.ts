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

// it also required to replace all id to _id
const prepareFieldsFilter = (filters: Options[], wrapKeys = false): Options => {
  let preparedFilters: Options = {};

  for (const filter of filters) {
    const { operator, paramName, value, modificators = [] } = filter;

    const queryOperator = querySelectors[operator];
    const logicalSelector = logicalSelectors[operator];
    const arrayOperator = arrayOperators[operator];

    if (queryOperator) {
      const prepareFilter = {
        [`content.${paramName}`]: {
          [queryOperator]: (operator === 'in' || operator === 'nin') && !Array.isArray(value) ? [value] : value,
        },
      };

      if (operator === 'regex') {
        prepareFilter[`content.${paramName}`]['$options'] = modificators.join('');
      }

      if (wrapKeys) {
        preparedFilters = prepareFilter;
      } else {
        preparedFilters = { ...preparedFilters, ...prepareFilter };
      }
    } else if (logicalSelector) {
      preparedFilters[logicalSelector] = prepareFieldsFilter(value, true);
    } else if (arrayOperator) {
      preparedFilters[`content.${paramName}`] = {
        [arrayOperator]: prepareFieldsFilter(value),
      };
    } else {
      throw new Error(`Unsupported operator '${operator}'`);
    }
  }

  return preparedFilters;
};

const makeOptions = (sort?: Record<string, number>[], limit?: number, offset?: number): Options => {
  const options: Options = {};

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

// const isValidId = (id: string): boolean => /^[0-9a-z]{24}$/.test(id);

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

// const prepareId = (filter: Options, parentKey = ''): Options => {
//   const result: Options = {};

//   for (const [key, value] of Object.entries(filter)) {
//     if (key === 'id') {
//       if (Array.isArray(value) && validIdExist(value as [string])) {
//         prepareId(value, key);
//         filter['_id'] = value;
//       }
//     } else if (parentKey === 'id' && key.startsWith('$') && value) {
//       if (Array.isArray(value)) {
//       } else {
//       }
//     } else if (Array.isArray(value)) {
//       prepareId(value, key); // !!!!! array or object !!
//     }
//   }

//   return result;
// };

@Injectable()
export class DataService {
  constructor(
    private readonly modelSchemaService: ModelSchemaService,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async save(project: string, configId: string, modelName: string, documents: any[]): Promise<any> {
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
    filters: Record<string, any>[],
    fields?: string[],
    sort?: Record<string, number>[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    // console.log('PROJECT:', project);
    // console.log('CONFIG:', configId);
    // console.log('MODEL:', modelName);
    // console.log('FILTERS:', filters);
    // console.log('FIELDS:', fields);
    // console.log('SORT:', sort);
    // console.log('LIMIT:', limit);
    // console.log('OFFSET:', offset);

    const schemaKeys = ['id', 'name', 'uptime'];

    const projection = fields
      ? fields.reduce<Options>((acc, field) => {
          const key = schemaKeys.includes(field) ? field : `content.${field}`;
          acc[key] = 1;
          return acc;
        }, {})
      : null;

    const preparedFilters: Options = prepareFieldsFilter(filters);
    const options: Options = makeOptions(sort, limit, offset);

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

    const found = await this.documentRepository.find(project, collection, preparedFilters, projection, options);

    if (found) {
      return found.map(({ _id, uptime, content }) => ({ id: _id, uptime, ...content }));
    }

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
