import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { DatabaseConfiguration } from './database.configuration';

dotenv.config();

export default new DataSource(
  new DatabaseConfiguration().createTypeOrmOptions(),
);
