// src/vnpay/vnpay.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay'; // từ lib gốc :contentReference[oaicite:1]{index=1}
import { VnpayAdapterService } from './vnpay.service';


@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: '.env' }),
        VnpayModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                tmnCode: config.getOrThrow<string>('VNPAY_TMN_CODE'),
                secureSecret: config.getOrThrow<string>('VNPAY_SECURE_SECRET'),
                vnpayHost: config.get<string>('VNPAY_HOST', 'https://sandbox.vnpayment.vn'),
                testMode: config.get<boolean>('VNPAY_TEST', true),
                loggerFn: ignoreLogger,
            }),
        }),
    ],
    providers: [VnpayAdapterService],
    exports: [VnpayAdapterService],
})
export class NestVnpayModule { }
