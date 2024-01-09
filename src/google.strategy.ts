import { PassportStrategy } from '@nestjs/passport';
import * as pass from 'generate-password';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { AuthService } from '~/auth/auth.service';
import { UsersService } from '~/users/users.service';

import { Injectable } from '@nestjs/common';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:4000/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const userGoogle = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    const user = await this.userService.findOne({ email: userGoogle.email });
    if (!user.data) {
      const password = pass.generate({
        length: 10,
        numbers: true,
        symbols: true,
      });
      const newUser = {
        name: userGoogle.firstName + ' ' + userGoogle.lastName,
        email: userGoogle.email,
        password,
        password_confirm: password,
        is_email_verified: true,
      };
      await this.userService.create(newUser, true);
    }
    const jwt_token = await this.authService.signIn(userGoogle.email, '', true);

    done(null, jwt_token);
  }
}
