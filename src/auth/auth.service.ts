import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email, pass, isOauth?: boolean) {
    const user = await this.usersService.findOne({ email });
    if (!user?.data) {
      throw new HttpException(
        {
          message: ['Email not exists, please register first'],
          error: 'Bad Request ',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isOauth) {
      const isMatch = await bcrypt.compare(pass, user?.data.password);
      if (!isMatch) {
        throw new UnauthorizedException();
      }
    }
    const payload = { id: user.data.id, email: user.data.email };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }
}
