import 'dotenv/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

if (Number.isNaN(dbPort)) {
  throw new Error('DB_PORT must be a valid number');
}

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: dbPort,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Teacher, Student],
  migrations: [path.join(__dirname, '../../migrations/*.{js,ts}')],
  synchronize: false,
  logging: false
});
