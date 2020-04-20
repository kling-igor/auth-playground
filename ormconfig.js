const isTs = process.env.TS_ENV === 'true';

module.exports = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRESS_DB,
  synchronize: true, // привязать к process.env.NODE_ENV
  logging: true,
  cli: {
    entitiesDir: './src',
    migrationsDir: './src/migration',
    subscribersDir: './src/subscriber',
  },
  entities: isTs ? ['./src/**/*.entity.ts'] : ['./dist/**/*.entity.js'],
  migrations: isTs ? ['./src/migration/*.ts'] : ['./dist/migration/*.js'],
  subscribers: isTs ? ['./src/**/*.subscriber.ts'] : ['./dist/**/*.subscriber.js'],
};
