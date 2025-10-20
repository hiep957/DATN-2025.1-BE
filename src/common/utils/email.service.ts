import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMailPasswordReset(email: string, otpCode: string) {
    const subject = 'Mã xác thực OTP của bạn';
    const text = `Mã OTP: ${otpCode}. Mã có hiệu lực 5 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px;">
        <h2>🔐 Xác thực OTP</h2>
        <p>Xin chào,</p>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; padding: 12px 16px; border: 1px solid #eee; display: inline-block;">
          ${otpCode}
        </div>
        <p style="margin-top: 12px;">Mã sẽ hết hạn trong 5 phút.</p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>
    `;

    const result = await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', result);
    return result;
  }
}
