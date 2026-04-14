import { defineConfig } from '@mikro-orm/sqlite';
import { Task } from './src/task/task.entity';

export default defineConfig({
  dbName: './data/mk2.db',
  entities: [Task],
  debug: process.env.NODE_ENV !== 'production',
});
