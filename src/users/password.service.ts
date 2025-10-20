import { BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "src/common/entities/otp.entity";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as argon2 from 'argon2';

export class PasswordService {
    constructor(
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }


    async updatePassword(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        user.password = await argon2.hash(password); // Hash the password
        const { password: _, ...userWithoutPassword } = await this.userRepository.save(user);
        return userWithoutPassword;
    }


    async createOtp(email: string) {
        const otp_value = this.generateOtp(6);
        const expiresAt = this.expiresAt(5); // 5 phút
        console.log(`Generated OTP for ${email}: ${otp_value}, expires at ${expiresAt}`);
        const otp = this.otpRepository.create({
            email,
            otpCode: otp_value,
            expiresAt
        });
        console.log('Creating OTP:', otp);
        await this.otpRepository.save(otp);
        return otp_value;
    }


    async verifyOtp(email: string, otpCode: string) {
        const otpRecord = await this.otpRepository.findOne({ where: { email, otpCode } });
        if (!otpRecord) {
            console.log(`No OTP record found for email: ${email} with code: ${otpCode}`);
            throw new BadRequestException('Invalid OTP');
        }
        if (otpRecord.expiresAt < new Date()) {
            console.log(`OTP has expired for email: ${email} with code: ${otpCode}`);
            throw new BadRequestException('OTP has expired');
        }
        await this.otpRepository.remove(otpRecord); // Xoá OTP sau khi xác thực thành công
        console.log(`OTP verified and removed for email: ${email} with code: ${otpCode}`);
        return true;
    }

    private expiresAt(minutes = Number(process.env.OTP_EXPIRES_MINUTES ?? 5)) {
        const d = new Date();
        d.setMinutes(d.getMinutes() + minutes);
        return d;
    }
    private generateOtp(length = 6) {
        // OTP số 6 chữ số; có thể đổi sang alphanumeric nếu muốn
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }
}