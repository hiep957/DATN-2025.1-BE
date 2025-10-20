import { Injectable } from "@nestjs/common";
import * as argon2 from 'argon2';
import { User } from "./entities/user.entity";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_SEC } from "./entities/auth.constants";
import { JwtService } from "@nestjs/jwt";
import { RefreshToken } from "./entities/refresh-token.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "src/common/entities/otp.entity";


@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService, // Inject JwtService if you need it for token generation
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
    ) { }

    async issueTokens(user: User) {
        const roles = user.userRoles?.map(ur => ur.role.code) ?? [];
        const accessToken = await this.signAccessToken(user, roles);
        const refreshToken = await this.signRefreshToken(user);
        console.log("RefreshToken trong issueTokens:", refreshToken);
        //Lưu 1 bản hash duy nhất
        const tokenHash = await argon2.hash(refreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);
        const existing = await this.refreshTokenRepository.findOne({ where: { user: { id: user.id } } });
        if (existing) {
            existing.tokenHash = tokenHash;
            existing.expiresAt = expiresAt;
            await this.refreshTokenRepository.save(existing);
        } else {
            const newToken = this.refreshTokenRepository.create({
                user,
                tokenHash,
                expiresAt
            });
            await this.refreshTokenRepository.save(newToken);
        }

        return { accessToken, refreshToken, roles, user }
    }

    private async signAccessToken(user: User, roles: string[]) {
        const payload = { sub: user.id, email: user.email, roles };
        return this.jwtService.signAsync(payload, {
            secret: "hiep1234567890",
            expiresIn: ACCESS_TOKEN_TTL
        });
    }

    private async signRefreshToken(user: User) {
        const payload = { sub: user.id };
        return this.jwtService.signAsync(payload, {
            secret: "hiep1234567890",
            expiresIn: REFRESH_TOKEN_TTL_SEC
        });
    }
}