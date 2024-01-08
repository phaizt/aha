import { DataSource } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT ? +process.env.DATABASE_HOST : 3306,
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME,
                entities: ["dist/**/*.entity{.ts,.js}"],
                synchronize: true,
            });

            return dataSource.initialize();
        },
    },
];
