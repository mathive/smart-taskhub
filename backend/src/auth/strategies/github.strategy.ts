import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { oAuthConfig } from '../../config/oauth.config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super(oAuthConfig.github);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.displayName || profile.username,
      lastName: '',
      avatar: profile.photos[0].value,
      provider: 'github',
      providerId: profile.id,
    };

    const savedUser = await this.authService.validateOAuthUser(user);
    done(null, savedUser);
  }
}