import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, UsePipes, ValidationPipe, UseFilters, ForbiddenException, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpExceptionFilter } from 'src/http-exception.filter';
import { LoginUserDto } from './dto/login-user.dto';
import { Response, Request } from 'express';
import { REFRESH_COOKIE_NAME, REFRESH_TOKEN_TTL_SEC } from './entities/auth.constants';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RefreshGuard } from 'src/common/guards/refresh.guard';
import { ok } from 'assert';
import { PasswordService } from './password.service';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,     // production: true (HTTPS). Dev: có thể false nếu chưa có HTTPS

    maxAge: REFRESH_TOKEN_TTL_SEC * 1000,

  });
}
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly passwordService: PasswordService
  ) { }



  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    console.log(createUserDto)
    const { accessToken, refreshToken, roles, user } = await this.usersService.register(createUserDto);
    console.log('RefreshToken', refreshToken);
    setRefreshCookie(res, refreshToken);
    return { accessToken, roles, user };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    console.log(loginUserDto)
    const { accessToken, refreshToken, roles, user } = await this.usersService.login(loginUserDto);
    setRefreshCookie(res, refreshToken);
    console.log('Login data:', { accessToken, refreshToken, roles });
    return { accessToken, roles, user };
  }

  @Get('testdb')
  testDb() {
    console.log('Testing database connection...');
    const data = this.usersService.testDb();
    return data;
  }


  @Get('profile')
  @UseGuards(AuthGuard) // Use your AuthGuard here
  getProfile(@Req() req: Request) {
    const user = req['user']; // Access the user info attached by AuthGuard
    const data = this.usersService.getUserById(user.userId);
    return { data };
  }

  @Get('testAdmin')
  @UseGuards(AuthGuard, RolesGuard) // Ensure the user is authenticated
  @Roles('ADMIN')
  testAdmin(@Req() req: Request) {
    const user = req['user'];
    console.log('User profile:', user);
    return "Admin content";
  }


  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId, refreshToken } = (req as any).refresh as { userId: number; refreshToken: string };
    const { accessToken, refreshToken: newRefreshToken, roles } = await this.usersService.refresh(userId, refreshToken);
    setRefreshCookie(res, newRefreshToken);
    console.log("Trong Controller: ", userId, refreshToken);
    return { accessToken, roles };
  }

  @Post('logout')
  @UseGuards(AuthGuard) // Ensure the user is authenticated
  @UseGuards(RefreshGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId } = (req as any).refresh as { userId: number };
    await this.usersService.logout(userId);
    res.clearCookie(REFRESH_COOKIE_NAME);
    return { ok: true };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    const otp = await this.usersService.requestPasswordReset(email);
    return { data: otp, message: 'OTP sent to email' };
  }

  @Post('verify-otp-password')
  async verifyOtpPassword(@Body('email') email: string, @Body('otp') otp: string) {
    const isValid = await this.passwordService.verifyOtp(email, otp);
    return { data: isValid, message: 'OTP verified successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body('email') email: string, @Body('newPassword') newPassword: string) {
    const user = await this.passwordService.updatePassword(email, newPassword);
    return { data: user, message: 'Password updated successfully' };
  }
}
