import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_wanderlust_jwt_key_2026',
    });
  }

  async validate(payload: any) {
    const user = await this.db.queryOne(
      `SELECT u.id, u.email, u."fullName", u."phoneNumber", u."avatarUrl", u."isActive", u."roleId",
              json_build_object('id', r.id, 'name', r.name, 'description', r.description) as role
       FROM users u
       JOIN roles r ON u."roleId" = r.id
       WHERE u.id = $1`,
      [payload.sub]
    );

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
