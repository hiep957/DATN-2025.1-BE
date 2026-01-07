import { HttpException, HttpStatus, Injectable, Post, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as argon2 from 'argon2';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_SEC } from './entities/auth.constants';
import { RefreshToken } from './entities/refresh-token.entity';
import { ref } from 'process';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { EmailService } from 'src/common/utils/email.service';
import { QueuryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {

  constructor(
    private emailService: EmailService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

  ) { }


  async testDb() {
    return this.userRepository.find({
      relations: ['userRoles', 'userRoles.role']
    })
  }

  //1. Register user

  async register(createUserDto: CreateUserDto) {
    console.log('Registering user:', createUserDto);
    const userExists = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    console.log('User exists:', userExists);
    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const user = new User();
    user.username = createUserDto.username;
    user.password = await argon2.hash(createUserDto.password); // Hash the password
    user.email = createUserDto.email;
    const defaultRole = await this.roleRepository.findOne({ where: { code: 'USER' } });
    console.log('Default role:', defaultRole);
    if (!defaultRole) {
      throw new HttpException('Default role not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    console.log("đến đây rồi nè")
    // 3. Tạo đối tượng UserRole trong bộ nhớ
    const newUserRole = new UserRole();
    newUserRole.role = defaultRole;
    console.log('New UserRole:', newUserRole);
    user.userRoles = [newUserRole];
    console.log('User with roles:', user);
    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException('Error saving user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Optionally, you can generate a JWT token for the user after registration

    return this.tokenService.issueTokens(savedUser); // Issue tokens after registration
  }


  //2. Login user
  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.tokenService.issueTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role']
    });
    console.log('Validating user:', user);
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await argon2.verify(user.password, password);
    if (!ok) throw new UnauthorizedException('Invalid password');
    return user;
  }

  async updateUserProfile(userId: number, updateUserDto: UpdateUserDto) {
    console.log('Updating user profile:', updateUserDto, 'for user ID:', userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { username, avatar, phoneNumber, birthday, gender, address, occupation } = updateUserDto;
    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (birthday !== undefined) user.birthday = birthday;
    if (gender !== undefined) user.gender = gender
    if (address !== undefined) user.address = address;
    if (occupation !== undefined) user.occupation = occupation;
    await this.userRepository.save(user);
    return user;
  }


  async refresh(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role']
    })

    if (!user) throw new UnauthorizedException();


    const row = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id } }
    })
    if (!row) throw new UnauthorizedException('Refresh token not found');


    const match = await argon2.verify(row.tokenHash, refreshToken);
    const expired = row.expiresAt < new Date();

    if (!match || expired) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const { accessToken, refreshToken: newRT, roles } = await this.tokenService.issueTokens(user);
    return { accessToken, refreshToken: newRT, roles };

  }

  async logout(userId: number) {
    const row = await this.refreshTokenRepository.findOne({
      where: { user: { id: userId } }
    });

    if (row) {
      await this.refreshTokenRepository.remove(row);
    }

    return { message: 'Logged out successfully' };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async requestPasswordReset(email: string) {
    // Kiểm tra xem user có tồn tại không
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    console.log('User found:', user);

    // Tạo OTP và lưu vào database
    const otp_code = await this.passwordService.createOtp(email);
    if (!otp_code) throw new HttpException('Cannot create OTP', HttpStatus.INTERNAL_SERVER_ERROR);

    // Gửi email chứa OTP
    try {
      await this.emailService.sendMailPasswordReset(email, otp_code);
    } catch (error) {
      throw new HttpException('Failed to send OTP email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { otp_code };
  }

  async changePassword(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const isPasswordValid = await argon2.verify(user.password, oldPassword);
    if (!isPasswordValid) throw new HttpException('Old password is incorrect', HttpStatus.BAD_REQUEST);
    user.password = await argon2.hash(newPassword);
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }


  async getUser(query: QueuryUserDto) {
    const { q, role, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const qb = this.userRepository.createQueryBuilder('user');
    qb.leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    if (q) {
      qb.andWhere('user.username LIKE :q OR user.email LIKE :q', { q: `%${q}%` });
    }
    if (role) {
      qb.andWhere('role.code = :role', { role });
    }
    if (sortBy) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${sortBy}`, order);
    }
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }


}
