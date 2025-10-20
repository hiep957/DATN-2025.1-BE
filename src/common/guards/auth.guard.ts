// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { extractBearerToken } from '../utils/jwt-extract';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) { }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    console.log("đã vào auth.guard")
    const token = extractBearerToken(req);
    console.log("Token trong auth.guard: ", token);
    if (!token) {
      throw new UnauthorizedException({
        code: 'ACCESS_TOKEN_MISSING',
        message: 'Missing access token',
      });
    }

    try {
      const payload = await this.jwt.verifyAsync(token,{
        secret: "hiep1234567890"
      });
      req.user = payload;
      return true;
    } catch (err: any) {
      if (err instanceof TokenExpiredError || err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({

          message: 'Access token expired',
        });
      }
      throw new UnauthorizedException({

        message: 'Invalid access token11',
      });
    }
  }
}
