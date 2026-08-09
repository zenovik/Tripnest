import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.queryOne('SELECT id FROM users WHERE email = $1', [dto.email]);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const requestedRole = (dto.roleName as RoleName) || RoleName.CUSTOMER;
    let role = await this.db.queryOne('SELECT * FROM roles WHERE name = $1', [requestedRole]);
    if (!role) {
      role = await this.db.queryOne('SELECT * FROM roles WHERE name = $1', [RoleName.CUSTOMER]);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.db.queryOne(
      `INSERT INTO users (email, password, "fullName", "phoneNumber", "roleId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, "fullName", "phoneNumber", "avatarUrl", "isActive", "roleId", "createdAt", "updatedAt"`,
      [dto.email, hashedPassword, dto.fullName, dto.phoneNumber || null, role.id]
    );

    newUser.role = role;

    const token = this.generateToken(newUser);
    return {
      message: 'Registration successful',
      user: this.sanitizeUser(newUser),
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne(
      `SELECT u.*, json_build_object('id', r.id, 'name', r.name, 'description', r.description) as role
       FROM users u
       JOIN roles r ON u."roleId" = r.id
       WHERE u.email = $1`,
      [dto.email]
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);
    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    return {
      message: `OTP sent successfully to ${dto.phoneNumber}`,
      demoOtp: '123456',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (dto.otpCode !== '123456') {
      throw new BadRequestException('Invalid OTP code');
    }

    let user = await this.db.queryOne(
      `SELECT u.*, json_build_object('id', r.id, 'name', r.name, 'description', r.description) as role
       FROM users u
       JOIN roles r ON u."roleId" = r.id
       WHERE u."phoneNumber" = $1`,
      [dto.phoneNumber]
    );

    if (!user) {
      const customerRole = await this.db.queryOne('SELECT * FROM roles WHERE name = $1', [RoleName.CUSTOMER]);
      const defaultPassword = await bcrypt.hash('OtpUser@123', 10);
      user = await this.db.queryOne(
        `INSERT INTO users (email, password, "fullName", "phoneNumber", "roleId")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, "fullName", "phoneNumber", "avatarUrl", "isActive", "roleId", "createdAt", "updatedAt"`,
        [
          `user_${Date.now()}@wanderlust.com`,
          defaultPassword,
          `Guest Traveller (${dto.phoneNumber.slice(-4)})`,
          dto.phoneNumber,
          customerRole.id,
        ]
      );
      user.role = customerRole;
    }

    const token = this.generateToken(user);
    return {
      message: 'Mobile OTP login verified',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
