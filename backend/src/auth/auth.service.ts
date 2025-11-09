import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { OAuthUser } from './interfaces/oauth-user.interface';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // First check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // If user doesn't exist, proceed with registration
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      // Select only the fields we want to return
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const token = this.generateToken(user.id, user.email);
    return { token, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);
    return { token };
  }

  async validateOAuthUser(oauthUser: OAuthUser) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: oauthUser.email },
          {
            AND: [
              { providerId: oauthUser.providerId },
              { provider: oauthUser.provider }
            ]
          }
        ]
      },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          name: `${oauthUser.firstName} ${oauthUser.lastName}`.trim(),
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          avatar: oauthUser.avatar,
        },
      });
    } else if (!user.provider) {
      // Update existing email user with OAuth info
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          avatar: oauthUser.avatar,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  private generateToken(userId: number, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
