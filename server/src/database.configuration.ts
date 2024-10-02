import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): SqliteConnectionOptions {
    return {
      type: 'sqlite',
      database: 'data/database.db',
      synchronize: false,
      logging: false,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [__dirname + '/migrations/**/*.{js,ts}'],
    };
  }
}
