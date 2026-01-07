import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load biến môi trường (nếu có dùng .env)

// Chỉ export duy nhất biến này (Named Export)
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'hieplaso1',
    database: process.env.DB_NAME || 'shopdb',

    // 🔥 QUAN TRỌNG: Sửa lại đường dẫn này để quét TẤT CẢ entity trong src
    // Dù file entity nằm ở users, common, hay products nó đều tìm thấy hết.
    entities: [__dirname + '/**/*.entity{.ts,.js}'],

    logging: false,
    migrations: ['src/migrations/*.ts'],
    synchronize: false, // Luôn để false khi dùng migration
});

// ❌ ĐÃ XÓA DÒNG export default AppDataSource;