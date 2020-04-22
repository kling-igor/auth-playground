const isTs = process.env.TS_ENV === 'true';

module.exports = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRESS_DB,
  synchronize: false, // привязать к process.env.NODE_ENV
  logging: true,
  migrationsRun: true,
  cli: {
    entitiesDir: './src',
    migrationsDir: './src/migration',
    subscribersDir: './src/subscriber',
  },
  entities: isTs ? ['./src/**/*.entity.ts'] : ['./dist/**/*.entity.js'],
  migrations: isTs ? ['./src/migration/*.ts'] : ['./dist/migration/*.js'],
  subscribers: isTs ? ['./src/**/*.subscriber.ts'] : ['./dist/**/*.subscriber.js'],

  // use cahcing as follows
  // this.repository.find({
  //   cache: true,
  //   where: conditions,
  // })

  // cache: {
  //   type: 'redis',
  //   duration: 30000,
  //   options: {
  //     host: 'localhost',
  //     port: 6379,
  //   },
  // },
};
