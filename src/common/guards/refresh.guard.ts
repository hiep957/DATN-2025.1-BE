import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req?.cookies?.['refreshToken'];
    if (!token) throw new UnauthorizedException('Missing refresh token');
    console.log(token)
    try {   
      const payload = await this.jwt.verifyAsync(token, {
        secret: "hiep1234567890"
      });
      // Gắn thông tin cần thiết để controller dùng
      console.log("thông tin refreshToken ở refresh guard là: ", payload)
      req.refresh = { userId: payload.sub, refreshToken: token };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid/expired refresh token');
    }
  }
}
